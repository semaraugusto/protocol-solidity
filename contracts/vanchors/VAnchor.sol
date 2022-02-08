/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later-only
 */

pragma solidity ^0.8.0;

import "../interfaces/ITokenWrapper.sol";
import "../interfaces/IMintableERC20.sol";
import "./VAnchorBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract VAnchor is VAnchorBase {
  using SafeERC20 for IERC20;
  using SafeMath for uint256;
  address public immutable token;

  constructor(
    IAnchorVerifier _verifier,
    uint32 _levels,
    IPoseidonT3 _hasher,
    address _handler,
    address _token,
    uint8 _maxEdges
  ) VAnchorBase (
    _verifier,
    _levels,
    _hasher,
    _handler,
    _maxEdges
  ) {token = _token;}

  function wrapToken(address tokenAddress, uint256 amount) public {
    ITokenWrapper(token).wrapFor(msg.sender, tokenAddress, amount);
  }

  function unwrapIntoToken(address tokenAddress, uint256 amount) public {
    ITokenWrapper(token).unwrapFor(msg.sender, tokenAddress, amount);
  }

  function wrapNative() payable public {
    ITokenWrapper(token).wrapFor{value: msg.value}(msg.sender, address(0), 0);
  }

  function unwrapIntoNative(address tokenAddress, uint256 amount) public {
    ITokenWrapper(token).unwrapFor(msg.sender, tokenAddress, amount);
  }
  
  // TODO: Rename to _executeWrapping
  function wrapAndDeposit(
    address tokenAddress,
    uint256 _extAmount
  ) payable public {
    // wrap into the token and send directly to this contract
    if (tokenAddress == address(0)) {
        require(msg.value == _extAmount);
        ITokenWrapper(token).wrapForAndSendTo{value: msg.value}(
            msg.sender,
            tokenAddress,
            0,
            address(this)
        );
    }
    else {
        ITokenWrapper(token).wrapForAndSendTo(
            msg.sender,
            tokenAddress,
            _extAmount,
            address(this)
        );
    }
  }

  // TODO: Rename _executeUnwrapping
  function withdrawAndUnwrap(
    address tokenAddress,
    address recipient,
    uint256 _minusExtAmount
  ) public payable nonReentrant {
    // TODO: Why is process withdraw first
    _processWithdraw(payable(address(this)), _minusExtAmount);

    ITokenWrapper(token).unwrapAndSendTo(
      tokenAddress,
      _minusExtAmount,
      recipient
    );
  }

  function registerAndTransact(
    Account memory _account,
    VAnchorEncodeInputs.Proof memory _proofArgs,
    ExtData memory _extData
  ) public {
    register(_account);
    transact(_proofArgs, _extData);
  }

  function registerAndTransactWrap(
    Account memory _account,
    VAnchorEncodeInputs.Proof memory _proofArgs,
    ExtData memory _extData,
    address tokenAddress
  ) public {
    register(_account);
    transactWrap(_proofArgs, _extData, tokenAddress);
  }

  function transact(VAnchorEncodeInputs.Proof memory _args, ExtData memory _extData) public nonReentrant {
    _executeValidationAndVerification(_args, _extData);

    if (_extData.extAmount > 0) {
      IMintableERC20(token).transferFrom(msg.sender, address(this), uint256(_extData.extAmount));
      require(uint256(_extData.extAmount) <= maximumDepositAmount, "amount is larger than maximumDepositAmount");
    }

    if (_extData.extAmount < 0) {
      require(_extData.recipient != address(0), "Can't withdraw to zero address");
      require(uint256(-_extData.extAmount) >= minimalWithdrawalAmount, "amount is less than minimalWithdrawalAmount"); // prevents ddos attack to Bridge
      _processWithdraw(_extData.recipient, uint256(-_extData.extAmount));
    }
    if (_extData.fee > 0) {
      _processFee(_extData.relayer, _extData.fee);
    }

    _executeInsertions(_args, _extData);
  }

  function transactWrap(
    VAnchorEncodeInputs.Proof memory _args,
    ExtData memory _extData,
    address tokenAddress
  ) public payable {
    _executeValidationAndVerification(_args, _extData);

    // Check if extAmount > 0, call wrapAndDeposit
    if (_extData.extAmount > 0) {
      //wrapAndDeposit
      require(uint256(_extData.extAmount) <= maximumDepositAmount, "amount is larger than maximumDepositAmount");
      wrapAndDeposit(tokenAddress, uint256(_extData.extAmount));
    } 
    //Otherwise, check if extAmount < 0, call withdrawAndUnwrap
    if (_extData.extAmount < 0) {
      require(_extData.recipient != address(0), "Can't withdraw to zero address");
      require(uint256(-_extData.extAmount) >= minimalWithdrawalAmount, "amount is less than minimalWithdrawalAmount"); 
      // prevents ddos attack to Bridge
      //withdrawAndUnwrap
      withdrawAndUnwrap(tokenAddress, _extData.recipient, uint256(-_extData.extAmount));
    }

    if (_extData.fee > 0) {
      //Do something
      _processFee(_extData.relayer, _extData.fee);
    }

    _executeInsertions(_args, _extData);
  }

  function _executeValidationAndVerification(VAnchorEncodeInputs.Proof memory _args, ExtData memory _extData) internal {
    for (uint256 i = 0; i < _args.inputNullifiers.length; i++) {
      require(!isSpent(_args.inputNullifiers[i]), "Input is already spent");
    }
    require(uint256(_args.extDataHash) == uint256(keccak256(abi.encode(_extData))) % FIELD_SIZE, "Incorrect external data hash");
    require(_args.publicAmount == calculatePublicAmount(_extData.extAmount, _extData.fee), "Invalid public amount");
    _executeVerification(_args);

    for (uint256 i = 0; i < _args.inputNullifiers.length; i++) {
      // sets the nullifier for the input UTXO to spent
      nullifierHashes[_args.inputNullifiers[i]] = true;
    }
  }

  function _executeVerification(VAnchorEncodeInputs.Proof memory _args) view internal {
    if (_args.inputNullifiers.length == 2) {
      (bytes memory encodedInput, bytes32[] memory roots, bytes memory argsHash) = VAnchorEncodeInputs._encodeInputs2(_args, maxEdges);
      require(isValidRoots(roots), "Invalid roots");
      require(verify2(_args.proof, argsHash), "Invalid transaction proof");
    } else if (_args.inputNullifiers.length == 16) {
      (bytes memory encodedInput, bytes32[] memory roots, bytes memory argsHash) = VAnchorEncodeInputs._encodeInputs16(_args, maxEdges);
      require(isValidRoots(roots), "Invalid roots");
      require(verify16(_args.proof, argsHash), "Invalid transaction proof");
    } else {
      revert("unsupported input count");
    }
  }

  function _executeInsertions(VAnchorEncodeInputs.Proof memory _args, ExtData memory _extData) internal {
    insertTwo(_args.outputCommitments[0], _args.outputCommitments[1]);
    emit NewCommitment(_args.outputCommitments[0], nextIndex - 2, _extData.encryptedOutput1);
    emit NewCommitment(_args.outputCommitments[1], nextIndex - 1, _extData.encryptedOutput2);
    for (uint256 i = 0; i < _args.inputNullifiers.length; i++) {
      emit NewNullifier(_args.inputNullifiers[i]);
    }
  }

  function _processWithdraw(
    address _recipient,
    uint256 _minusExtAmount
  ) internal override {
    uint balance = IERC20(token).balanceOf(address(this));
    if (balance >= _minusExtAmount) {
      // transfer tokens when balance exists
      IERC20(token).safeTransfer(_recipient, _minusExtAmount);
    } else {
      // mint tokens when not enough balance exists
      IMintableERC20(token).mint(_recipient, _minusExtAmount);
    }
  }

  function _processFee(
    address  _relayer,
    uint256 _fee
  ) internal override {
    uint balance = IERC20(token).balanceOf(address(this));
    if (_fee > 0) {
      if (balance >= _fee) {
        // transfer tokens when balance exists
        IERC20(token).safeTransfer(_relayer, _fee);
      }
      else {
        IMintableERC20(token).mint(_relayer, _fee);
      }
    }
  }

  function getProposalNonce() public view returns (uint32) {
    return proposalNonce;
  }
}
