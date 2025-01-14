//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Governable {
    address private _governor;
    uint32 public refreshNonce = 0;

    event GovernanceOwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event RecoveredAddress(address indexed recovered);

    mapping (bytes32 => bool) private _usedHashes;

    constructor (address governor) {
        _governor = governor;
        emit GovernanceOwnershipTransferred(address(0), _governor);
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function governor() public view returns (address) {
        return _governor;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyGovernor() {
        require(isGovernor(), "Governable: caller is not the governor");
        _;
    }

    /**
     * @dev Returns true if the caller is the current owner.
     */
    function isGovernor() public view returns (bool) {
        return msg.sender == _governor;
    }

    /**
     * @dev Returns true if the signature is signed by the current governor.
     */
    function isSignatureFromGovernor(bytes memory data, bytes memory sig) public view returns (bool) {
        bytes32 hashedData = keccak256(data);
        address signer = ECDSA.recover(hashedData, sig);
        return signer == governor();
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyGovernor` functions anymore. Can only be called by the current owner.
     *
     * > Note: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public onlyGovernor {
        emit GovernanceOwnershipTransferred(_governor, address(0));
        _governor = address(0);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner, uint32 nonce) public onlyGovernor {
        require(refreshNonce < nonce, "Invalid nonce");
        require(nonce <= refreshNonce + 1, "Nonce must increment by 1");
        _transferOwnership(newOwner);
        refreshNonce = nonce;
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnershipWithSignature(address newOwner, uint32 nonce, bytes memory sig) public {
        require(refreshNonce < nonce, "Invalid nonce");
        require(nonce <= refreshNonce + 1, "Nonce must increment by 1");
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 newOwnerHash = keccak256(abi.encodePacked(nonce, newOwner));
        require(isSignatureFromGovernor(abi.encodePacked(prefix, abi.encodePacked(newOwnerHash)), sig), "Governable: caller is not the governor");
        _transferOwnership(newOwner);
        refreshNonce = nonce;
    }

    /**
     * @dev Transfers ownership of the contract to a new account associated with the publicKey    * input
     */
    function transferOwnershipWithSignaturePubKey(bytes memory publicKey, uint32 nonce, bytes memory sig) public {
        require(refreshNonce < nonce, "Invalid nonce");
        require(nonce <= refreshNonce + 1, "Nonce must increment by 1");
        bytes memory prefix = "\x19Ethereum Signed Message:\n32"; 
        bytes32 pubKeyHash = keccak256(publicKey);
        bytes32 pubKeyNonceHash = keccak256(abi.encodePacked(nonce, publicKey));
        address newOwner = address(uint160(uint256(pubKeyHash)));
        require(isSignatureFromGovernor(abi.encodePacked(prefix, abi.encodePacked(pubKeyNonceHash)), sig), "Governable: caller is not the governor");
        _transferOwnership(newOwner);
        refreshNonce = nonce;
    }

    function verify(bytes32 hash, uint8 v, bytes32 r, bytes32 s) public view returns(bool) {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, hash));
        return ecrecover(prefixedHash, v, r, s) == governor();
    }

    function checkPubKey(bytes calldata pubkey) public view returns (bool){
        return (uint(keccak256(pubkey)) & 0x00FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) == uint256(uint160(msg.sender));
    }

    function recover(bytes memory data, bytes memory sig) public {
        bytes32 hashedData = keccak256(data);
        address signer = ECDSA.recover(hashedData, sig);
        emit RecoveredAddress(signer);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     */
    function _transferOwnership(address newOwner) internal {
        require(newOwner != address(0), "Governable: new owner is the zero address");
        emit GovernanceOwnershipTransferred(_governor, newOwner);
        _governor = newOwner;
    }
}