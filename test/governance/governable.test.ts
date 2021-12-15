/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
 const assert = require('assert');
 const path = require('path');
 import { ethers } from 'hardhat';
 import { BigNumber, Signer } from 'ethers';
 import { toFixedHex } from '@webb-tools/utils';
 const TruffleAssert = require('truffle-assertions');
 import { Bytes, concat } from "@ethersproject/bytes";
 import { toUtf8Bytes, toUtf8String } from "@ethersproject/strings";
 
 // Convenience wrapper classes for contract classes
 import { GovernedTokenWrapper } from '@webb-tools/tokens';
 import { Governable__factory } from '../../typechain';
 
 describe('Governable Contract', () => {
  let governableInstance;
  let sender;
  let nextGovernor;
  let arbSigner;
  let hashMessage;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    const wallet = signers[0];
    sender = wallet;
    nextGovernor = signers[1];
    arbSigner = signers[2];
    // create poseidon hasher
    const govFactory = new Governable__factory(wallet);
    governableInstance = await govFactory.deploy(sender.address);
    await governableInstance.deployed();

    const messagePrefix = "\x19Ethereum Signed Message:\n";
    hashMessage = (message: Bytes | string): any => {
      if (typeof(message) === "string") { message = toUtf8Bytes(message); }
      return concat([
          toUtf8Bytes(messagePrefix),
          toUtf8Bytes(String(message.length)),
          message
      ]);
    }
  });
 
  it('should check governor', async () => {
    assert.strictEqual((await governableInstance.governor()), sender.address);
  });

  it('should recover signer', async () => {
    const msg = 'message to sign';
    const signedMessage = await sender.signMessage(msg);

    const prefixedMsg = "\x19Ethereum Signed Message:\n" + msg.length + msg;
    var msgBuffer = [];
    var buffer = new Buffer(prefixedMsg, 'utf8');
    for (var i = 0; i < buffer.length; i++) {
      msgBuffer.push(buffer[i]);
    }

    await governableInstance.recover(msgBuffer, signedMessage);
    const filter = governableInstance.filters.RecoveredAddress();
    const events = await governableInstance.queryFilter(filter);
    assert.strictEqual(sender.address, events[0].args.recovered);
  });

  it.only('should check ownership is transferred to new governor', async () => {
    const msg = ethers.utils.arrayify(nextGovernor.address);
    const signedMessage = await sender.signMessage(msg);
    await governableInstance.transferOwnershipWithSignature(nextGovernor.address, signedMessage);
    assert.strictEqual((await governableInstance.governor()), nextGovernor.address);
  });

  it('failing test: non-governor should not be able to transfer ownership', async() => {
    const msg = ethers.utils.arrayify(nextGovernor.address);
    const signedMessage = await sender.signMessage(msg);

    await TruffleAssert.reverts(
      governableInstance.connect(nextGovernor).transferOwnership(nextGovernor.address),
      'Governable: caller is not the governor',
    );
    
    await TruffleAssert.reverts(
      governableInstance.connect(nextGovernor).transferOwnershipWithSignature(nextGovernor.address, signedMessage),
      'Governable: caller is not the governor',
    );
  });

  it('failing test: old governor should not be able to call an onlyGovernor function', async () => {
    const msg = ethers.utils.arrayify(nextGovernor.address);
    const signedMessage = await sender.signMessage(msg);

    await governableInstance.transferOwnershipWithSignature(nextGovernor.address, signedMessage);
    
    await TruffleAssert.reverts(
      governableInstance.connect(sender).transferOwnership(nextGovernor.address),
      'Governable: caller is not the governor',
    );
  });

  it('failing test replay attack', async () => {
    const msg = ethers.utils.arrayify(nextGovernor.address);
    const signedMessage = await sender.signMessage(msg);

    await governableInstance.transferOwnershipWithSignature(nextGovernor.address, signedMessage);
    
    await TruffleAssert.reverts(
      governableInstance.connect(arbSigner).transferOwnershipWithSignature(arbSigner.address, signedMessage),
      'Governable: caller is not the governor',
    );
  });

  it('test renounce ownership', async() => {
    await governableInstance.renounceOwnership();
    assert.strictEqual((await governableInstance.governor()).toString(), '0x0000000000000000000000000000000000000000');

    await TruffleAssert.reverts(
      governableInstance.connect(sender).transferOwnership(nextGovernor.address),
      'Governable: caller is not the governor',
    );
  });

 });
 