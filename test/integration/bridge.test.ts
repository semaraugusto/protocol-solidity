/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
 const assert = require('assert');
 import { artifacts, ethers } from 'hardhat';
 const TruffleAssert = require('truffle-assertions');
 
 const fs = require('fs');
 const path = require('path');
 const { toBN, randomHex } = require('web3-utils');
 const Poseidon = artifacts.require('PoseidonT3');
 
 // Typechain generated bindings for contracts
 import {
   Verifier2,
   Verifier2__factory as Verifier2Factory,
   ERC20Mock as Token,
   ERC20Mock__factory as TokenFactory,
   Bridge,
 } from '../../typechain';
 
 // Convenience wrapper classes for contract classes
 import Anchor from '../../lib/darkwebb/Anchor';
 
 const { NATIVE_AMOUNT } = process.env
 const snarkjs = require('snarkjs')
 const bigInt = require('big-integer');
 const BN = require('bn.js');
 const F = require('circomlib').babyJub.F;
 const Scalar = require("ffjavascript").Scalar;
 
 const helpers = require('../../lib/darkwebb/utils');
 const MerkleTree = require('../../lib/MerkleTree');
 
 describe('Anchor2', () => {
   beforeEach(async () => {
   })
 
   describe('#constructor', () => {
     it('should initialize', async () => {
     });
   });

   describe('#bridging', () => {
    it('should bridge assets between 2 chains', async () => {
      // // for usage
      // const deposit = await Bridge.deposit(chainId, denomination, tokenName);
      // // const { deposit, index } = await anchor.deposit();
      // // for testing
      // // run updates across the linked anchors
      // await Bridge.update();
      // // for usage
      // await Bridge.withdraw(chainId, deposit);
    });

    it('should create a bridge between 3 chains', async () => {

    });

    it('should create a bridge between 4 chains', async () => {

    });

    it('should create a bridge between 5 chains', async () => {

    });

    it('should deploy a bridge for a WEBB wrapped asset', async () => {

    });

    it('should be able to wrap ETH into webbETH on one chain and unwrap webbETH into ETH on another', async () => {

    });
  });
});