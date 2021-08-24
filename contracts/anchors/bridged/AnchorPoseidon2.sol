/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later-only
 */

pragma solidity ^0.8.0;

import "../../trees/MerkleTreePoseidon.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IVerifier {
  function verifyProof(
      uint[2] memory a,
      uint[2][2] memory b,
      uint[2] memory c,
      uint[8] memory input
  ) external view returns (bool r);
}

abstract contract AnchorPoseidon2 is MerkleTreePoseidon, ReentrancyGuard {
  address public bridge;
  address public admin;
  address public handler;

  IVerifier public immutable verifier;
  uint256 public immutable denomination;

  uint256 public immutable chainID;
  struct Edge {
    uint256 chainID;
    bytes32 root;
    uint256 height;
  }

  // maps sourceChainID to the index in the edge list
  mapping(uint256 => uint256) public edgeIndex;
  mapping(uint256 => bool) public edgeExistsForChain;
  Edge[] public edgeList;

  // map to store chainID => (rootIndex => root) to track neighbor histories
  mapping(uint256 => mapping(uint32 => bytes32)) public neighborRoots;
  // map to store the current historical root index for a chainID
  mapping(uint256 => uint32) public currentNeighborRootIndex;

  // map to store used nullifier hashes
  mapping(bytes32 => bool) public nullifierHashes;
  // map to store all commitments to prevent accidental deposits with the same commitment
  mapping(bytes32 => bool) public commitments;

  // map to store the history of root updates
  mapping(uint => bytes32[]) public rootHistory;

  // the latest history index that represents the next index to store history
  uint latestHistoryIndex;

  // currency events
  event Deposit(bytes32 indexed commitment, uint32 leafIndex, uint256 timestamp);
  event Withdrawal(address to, bytes32 nullifierHash, address indexed relayer, uint256 fee);
  // bridge events
  event EdgeAddition(uint256 chainID, uint256 height, bytes32 merkleRoot);
  event EdgeUpdate(uint256 chainID, uint256 height, bytes32 merkleRoot);
  event RootHistoryRecorded(uint timestamp, bytes32[1] roots);
  event RootHistoryUpdate(uint timestamp, bytes32[1] roots);

  /**
    @dev The constructor
    @param _verifier the address of SNARK verifier for this contract
    @param _hasher the address of hash contract
    @param _denomination transfer amount for each deposit
    @param _merkleTreeHeight the height of deposits' Merkle Tree
  */
  constructor(
    IVerifier _verifier,
    IPoseidonT3 _hasher,
    uint256 _denomination,
    uint32 _merkleTreeHeight,
    uint256 _chainID
  ) MerkleTreePoseidon(_merkleTreeHeight, _hasher) {
    require(_denomination > 0, "denomination should be greater than 0");
    verifier = _verifier;
    denomination = _denomination;
    chainID = _chainID;
    latestHistoryIndex = 0;
    // TODO: Parameterize max roots (length of array should be max roots)
    rootHistory[latestHistoryIndex] = new bytes32[](1);
  }

  /**
    @dev Deposit funds into the contract. The caller must send (for ETH) or approve (for ERC20) value equal to or `denomination` of this instance.
    @param _commitment the note commitment, which is PedersenHash(nullifier + secret)
  */
  function deposit(bytes32 _commitment) external payable nonReentrant {
    require(!commitments[_commitment], "The commitment has been submitted");

    uint32 insertedIndex = _insert(_commitment);
    commitments[_commitment] = true;
    _processDeposit();

    emit Deposit(_commitment, insertedIndex, block.timestamp);
  }

  /** @dev this function is defined in a child contract */
  function _processDeposit() internal virtual;

  /**
    @dev Withdraw a deposit from the contract. `proof` is a zkSNARK proof data, and input is an array of circuit public inputs
    `input` array consists of:
      - merkle root of all deposits in the contract
      - hash of unique deposit nullifier to prevent double spends
      - the recipient of funds
      - optional fee that goes to the transaction sender (usually a relay)
  */
  function withdraw(
    bytes calldata _proof,
    bytes calldata _roots,
    bytes32 _nullifierHash,
    address payable _recipient,
    address payable _relayer,
    uint256 _fee,
    uint256 _refund
  ) external payable nonReentrant {
    bytes32[2] memory roots = abi.decode(_roots, (bytes32[2]));
    require(_fee <= denomination, "Fee exceeds transfer value");
    require(!nullifierHashes[_nullifierHash], "The note has been already spent");
    require(isKnownRoot(roots[0]), "Cannot find your merkle root");
    require(roots.length >= edgeList.length + 1, "Incorrect root array length");
    for (uint i = 0; i < edgeList.length; i++) {
      Edge memory _edge = edgeList[i];
      require(isKnownNeighborRoot(_edge.chainID, roots[i+1]), "Neighbor root not found");
    }
    address rec = address(_recipient);
    address rel = address(_relayer);

    uint256[8] memory inputs;
    inputs[0] = uint256(_nullifierHash);
    inputs[1] = uint256(uint160(rec));
    inputs[2] = uint256(uint160(rel));
    inputs[3] = uint256(_fee);
    inputs[4] = uint256(_refund);
    inputs[5] = uint256(chainID);
    inputs[6] = uint256(roots[0]);
    inputs[7] = uint256(roots[1]);
    bytes memory encodedInputs = abi.encodePacked(inputs);

    require(verify(_proof, encodedInputs), "Invalid withdraw proof");
  
    nullifierHashes[_nullifierHash] = true;
    _processWithdraw(_recipient, _relayer, _fee, _refund);
    emit Withdrawal(_recipient, _nullifierHash, _relayer, _fee);
  }

  function verify(
    bytes memory _proof,
    bytes memory _input
  ) internal view returns (bool r) {
    uint256[8] memory p = abi.decode(_proof, (uint256[8]));
    (
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c
    ) = unpackProof(p);
    uint256[8] memory inputs = abi.decode(_input, (uint256[8]));
    r = verifier.verifyProof(
      a, b, c,
      inputs
    );
    require(r, "Invalid withdraw proof");
    return r;
  }

  /*
  * A helper function to convert an array of 8 uint256 values into the a, b,
  * and c array values that the zk-SNARK verifier's verifyProof accepts.
  */
  function unpackProof(
      uint256[8] memory _proof
  ) public pure returns (
      uint256[2] memory,
      uint256[2][2] memory,
      uint256[2] memory
  ) {
    return (
      [_proof[0], _proof[1]],
      [
        [_proof[2], _proof[3]],
        [_proof[4], _proof[5]]
      ],
      [_proof[6], _proof[7]]
    );
  }

  /** @dev this function is defined in a child contract */
  function _processWithdraw(
    address payable _recipient,
    address payable _relayer,
    uint256 _fee,
    uint256 _refund
  ) internal virtual;

  /** @dev whether a note is already spent */
  function isSpent(bytes32 _nullifierHash) public view returns (bool) {
    return nullifierHashes[_nullifierHash];
  }

  /** @dev whether an array of notes is already spent */
  function isSpentArray(bytes32[] calldata _nullifierHashes) external view returns (bool[] memory spent) {
    spent = new bool[](_nullifierHashes.length);
    for (uint256 i = 0; i < _nullifierHashes.length; i++) {
      if (isSpent(_nullifierHashes[i])) {
        spent[i] = true;
      }
    }
  }

  /** @dev */
  function getLatestNeighborRoots() public view returns (bytes32[1] memory roots) {
    for (uint256 i = 0; i < 1; i++) {
      if (edgeList.length >= i + 1) {
        roots[i] = edgeList[i].root;
      } else {
        roots[i] = bytes32(0x0);
      }
    }
  }

  /** @dev */
  function isKnownNeighborRoot(uint256 neighborChainID, bytes32 _root) public view returns (bool) {
    if (_root == 0) {
      return false;
    }
    uint32 _currentRootIndex = currentNeighborRootIndex[neighborChainID];
    uint32 i = _currentRootIndex;
    do {
      if (_root == neighborRoots[neighborChainID][i]) {
        return true;
      }
      if (i == 0) {
        i = ROOT_HISTORY_SIZE;
      }
      i--;
    } while (i != _currentRootIndex);
    return false;
  }

  modifier onlyAdmin()  {
    require(msg.sender == admin, 'sender is not the admin');
    _;
  }

  modifier onlyBridge()  {
    require(msg.sender == bridge, 'sender is not the bridge');
    _;
  }

  modifier onlyHandler()  {
    require(msg.sender == handler, 'sender is not the handler');
    _;
  }
}
