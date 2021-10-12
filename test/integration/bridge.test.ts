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

// Convenience wrapper classes for contract classes
import Bridge from '../../lib/darkwebb/Bridge';
import Anchor from '../../lib/darkwebb/Anchor';
import MintableToken from '../../lib/darkwebb/MintableToken';

const snarkjs = require('snarkjs')
const bigInt = require('big-integer');
const BN = require('bn.js');
const F = require('circomlib').babyJub.F;
const Scalar = require("ffjavascript").Scalar;

const helpers = require('../../lib/darkwebb/utils');
const MerkleTree = require('../../lib/MerkleTree');

describe('BridgeConstruction', () => {
  const webbETHAssetDetails = {
    assetName: 'webbEthereum',
    assetSymbol: 'webbETH'
  };
  
  let bridge2WebbEthInputFresh = {
    anchorInputs: [
      {
        asset: webbETHAssetDetails,
        anchorSizes: ['100000000000000000', '1000000000000000000', '10000000000000000000'],
      }
    ],
    chainIDs: [4, 1666700000]
  };

  let bridge3WebbEthInputFresh = {
    anchorInputs: [
      {
        asset: webbETHAssetDetails,
        anchorSizes: ['100000000000000000', '1000000000000000000', '10000000000000000000'],
      }
    ],
    chainIDs: [4, 1666700000, 1666700001]
  };

  let bridge2WebbEthInputExisting = {};
  let bridge3WebbEthInputExisting = {};

  before('construction-tests', async () => {
    // Create a token to test bridge construction support for existing tokens
    const tokenInstance1 = await MintableToken.createToken('existingERC20', 'EXIST', signer[7]); // used for 4
    const tokenInstance2 = await MintableToken.createToken('existingERC20', 'EXIST', other_signer[7]); // used for 1666700000
    const tokenInstance3 = await MintableToken.createToken('existingERC20', 'EXIST', another_signer[7]); // used for 1666700000

    await tokenInstance1.mintTokens(signer[0], '100000000000000000000000000');

    bridge2WebbEthInputExisting = {
      anchorInputs: [
        {
          asset: {
            4: tokenInstance1.contract.address,
            1666700000: tokenInstance2.contract.address,
          },
          anchorSizes: ['1000000000000000000', '100000000000000000000', '10000000000000000000000'],
        }
      ],
      chainIDs: [4, 1666700000]
    };

    bridge3WebbEthInputExisting = {
      anchorInputs: [
        {
          asset: {
            4: tokenInstance1.contract.address,
            1666700000: tokenInstance2.contract.address,
            1666700001: tokenInstance3.contract.address,
          },
          anchorSizes: ['1000000000000000000', '100000000000000000000', '10000000000000000000000'],
        }
      ],
      chainIDs: [4, 1666700000, 1666700001]
    };

  });

  describe('create 2 side bridge for new token', async () => {
    
    const deploymentConfig = {
      4: signer[1],
      1666700000: other_signer[1],
    }

    const bridge = Bridge.deployBridge(bridge2WebbEthInputFresh, deploymentConfig);

    // Should be able to retrieve individual anchors
    const chainIdSource = 4;
    const chainIdDest = 1666700000;
    const tokenName = 'webbEthereum';
    const anchorSize = '1000000000000000000';
    const controlledAnchor1: Anchor = bridge.getAnchor(chainIdSource, tokenName, anchorSize);
    const controlledAnchor2: Anchor = bridge.getAnchor(chainIdDest, tokenName, anchorSize);

    // get the state of anchors before deposit
    const sourceAnchorRootBefore = await controlledAnchor1.contract.getLastRoot();
    let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);
    let destAnchorEdgeBefore = await controlledAnchor2.contract.edgeList(edgeIndex);

    // Deposit on the bridge
    const depositNote = await bridge.deposit(chainIdSource, tokenName, anchorSize);
    await bridge.update();
    
    // Check the state of anchors after deposit
    const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
    const destAnchorEdgeAfter = await controlledAnchor2.contract.edgeList(edgeIndex);

    // make sure the roots / anchors state have changed
    assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
    assert.notEqual(destAnchorEdgeBefore.root, destAnchorEdgeAfter.root);
    assert.equal(destAnchorEdgeBefore.latestLeafIndex + 1, destAnchorEdgeAfter.latestLeafIndex);
  });

  describe('create 3 side bridge for new token', async () => {
    const deploymentConfig = {
      4: signer[1],
      1666700000: other_signer[1],
      1666700001: another_signer[1],
    };
    const bridge = Bridge.deployBridge(bridge3WebbEthInputFresh, deploymentConfig);

    // Should be able to retrieve individual anchors
    const chainIdSource = 4;
    const chainId2 = 1666700000;
    const chainId3 = 1666700001;
    const tokenName = 'webbEthereum';
    const anchorSize = '1000000000000000000';
    const controlledAnchor1: Anchor = bridge.getAnchor(chainIdSource, tokenName, anchorSize);
    const controlledAnchor2: Anchor = bridge.getAnchor(chainId2, tokenName, anchorSize);
    const controlledAnchor3: Anchor = bridge.getAnchor(chainId3, tokenName, anchorSize);

    // get the state of anchors before deposit
    const sourceAnchorRootBefore = await controlledAnchor1.contract.getLastRoot();
    let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);
    const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);
    edgeIndex = await controlledAnchor3.contract.edgeIndex(chainIdSource);
    const destAnchorEdge3Before = await controlledAnchor3.contract.edgeList(edgeIndex);

    // Deposit on the bridge
    const depositNote = await bridge.deposit(chainIdSource, tokenName, anchorSize);
    await bridge.update();
    
    // Check the state of anchors after deposit
    const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
    const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
    const destAnchorEdge3After = await controlledAnchor3.contract.edgeList(edgeIndex);

    // make sure the roots / anchors state have changed
    assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
    assert.notEqual(destAnchorEdge2Before.root, destAnchorEdge2After.root);
    assert.notEqual(destAnchorEdge3Before.root, destAnchorEdge3After.root);
    assert.equal(destAnchorEdge2After.latestLeafIndex, destAnchorEdge3After.latestLeafIndex);
    assert.equal(destAnchorEdge2After.root, destAnchorEdge3After.root);
  });

  describe('create 2 side bridge for existing token', async () => {
    const deploymentConfig = {
      4: signer[1],
      1666700000: other_signer[1],
    };
    const bridge = Bridge.deployBridge(bridge2WebbEthInputExisting, deploymentConfig);

    // Should be able to retrieve individual anchors
    const chainIdSource = 4;
    const chainIdDest = 1666700000;
    const tokenName = 'existingERC20';
    const anchorSize = '1000000000000000000';
    const controlledAnchor1: Anchor = bridge.getAnchor(chainIdSource, tokenName, anchorSize);
    const controlledAnchor2: Anchor = bridge.getAnchor(chainIdDest, tokenName, anchorSize);

    // get the state of anchors before deposit
    const sourceAnchorRootBefore = await controlledAnchor1.contract.getLastRoot();
    let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);
    let destAnchorEdgeBefore = await controlledAnchor2.contract.edgeList(edgeIndex);

    // Deposit on the bridge
    const depositNote = await bridge.deposit(chainIdSource, tokenName, anchorSize);
    await bridge.update();
    
    // Check the state of anchors after deposit
    const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
    const destAnchorEdgeAfter = await controlledAnchor2.contract.edgeList(edgeIndex);

    // make sure the roots / anchors state have changed
    assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
    assert.notEqual(destAnchorEdgeBefore.root, destAnchorEdgeAfter.root);
    assert.equal(destAnchorEdgeBefore.latestLeafIndex + 1, destAnchorEdgeAfter.latestLeafIndex);
  });

  describe('create 3 side bridge for new token', async () => {
    const deploymentConfig = {
      4: signer[1],
      1666700000: other_signer[1],
      1666700001: another_signer[1],
    };
    const bridge = Bridge.deployBridge(bridge3WebbEthInputExisting, deploymentConfig);

    // Should be able to retrieve individual anchors
    const chainIdSource = 4;
    const chainId2 = 1666700000;
    const chainId3 = 1666700001;
    const tokenName = 'existingERC20';
    const anchorSize = '1000000000000000000';
    const controlledAnchor1: Anchor = bridge.getAnchor(chainIdSource, tokenName, anchorSize);
    const controlledAnchor2: Anchor = bridge.getAnchor(chainId2, tokenName, anchorSize);
    const controlledAnchor3: Anchor = bridge.getAnchor(chainId3, tokenName, anchorSize);

    // get the state of anchors before deposit
    const sourceAnchorRootBefore = await controlledAnchor1.contract.getLastRoot();
    let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);
    const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);
    edgeIndex = await controlledAnchor3.contract.edgeIndex(chainIdSource);
    const destAnchorEdge3Before = await controlledAnchor3.contract.edgeList(edgeIndex);

    // Deposit on the bridge
    const depositNote = await bridge.deposit(chainIdSource, tokenName, anchorSize);
    await bridge.update();
    
    // Check the state of anchors after deposit
    const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
    const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
    const destAnchorEdge3After = await controlledAnchor3.contract.edgeList(edgeIndex);

    // make sure the roots / anchors state have changed
    assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
    assert.notEqual(destAnchorEdge2Before.root, destAnchorEdge2After.root);
    assert.notEqual(destAnchorEdge3Before.root, destAnchorEdge3After.root);
    assert.equal(destAnchorEdge2After.latestLeafIndex, destAnchorEdge3After.latestLeafIndex);
    assert.equal(destAnchorEdge2After.root, destAnchorEdge3After.root);
  });
});
 
describe('2 sided bridge fresh token use', () => {
  beforeEach(async () => {
    // deploy the 
  })

});

describe('2 sided bridge existing token use', async () => {

  // ERC20 compliant contracts that can easily create balances for test
  let tokenName = 'existingERC20';
  let existingTokenSrc: MintableToken;
  let existingTokenDest: MintableToken;

  let bridge: Bridge;
  let chainId1 = 4;
  let chainId2 = 1666700000;

  before(async () => {
    existingTokenSrc = await MintableToken.createToken(tokenName, 'EXIST', signer[7]);
    // Use some other signer with provider on other chain
    existingTokenDest = await MintableToken.createToken(tokenName, 'EXIST', other_signer[7]);

    // mint some tokens to the user of the bridge
    existingTokenSrc.mintTokens(signer[1], '100000000000000000000000000');
  })

  beforeEach(async () => {
    // create the config for the bridge
    const existingTokenBridgeConfig = {
      anchorInputs: [
        {
          asset: {
            4: existingTokenSrc.contract.address,
            1666700000: existingTokenDest.contract.address,
          },
          anchorSizes: ['1000000000000000000', '100000000000000000000', '10000000000000000000000'],
        }
      ],
      chainIDs: [4, 1666700000]
    };

    // setup the config for deployers of contracts (admins)
    const deploymentConfig = {
      4: signer[0],
      1666700000: other_signer[0],
    }
    
    // deploy the bridge
    bridge = await Bridge.deployBridge(existingTokenBridgeConfig, deploymentConfig);
  })

  describe('#bridging', () => {
    it('should wrap assets on deposit and unwrap on withdraw', async () => {
      const anchorSize = '1000000000000000000';

      // Check the balanceOf of the existing tokens.
      const startingBalanceSource = existingTokenSrc.getBalance(signer[1].address);
      const startingBalanceDest = existingTokenDest.getBalance(other_signer[1].address);

      // Deposit, update, and withdraw
      const depositNote = await bridge.deposit(chainId1, tokenName, anchorSize, signer[1]);
      await bridge.update(chainId1, tokenName, anchorSize);
      await bridge.withdraw(depositNote, other_signer[1]);

      // Verify the balanceOf existing tokens
      const endingBalanceSource = existingTokenSrc.getBalance(signer[1].address);
      const endingBalanceDest = existingTokenDest.getBalance(other_signer[1].address);
      assert.equal(startingBalanceSource - anchorSize, endingBalanceSource);
      assert.equal(startingBalanceDest, endingBalanceDest + anchorSize);
    });

    it('should update multiple deposits', async () => {
      // Fetch information about the anchor to be updated.
      const anchorSize = '1000000000000000000';
      const controlledAnchor2: Anchor = bridge.getAnchor(chainId2, tokenName, anchorSize);
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainId1);
      const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);
      const startingBalanceDest = existingTokenDest.getBalance(other_signer[1].address);

      // Make two deposits, and update after
      const depositNote1 = await bridge.deposit(chainId1, tokenName, anchorSize, signer[1]);
      const depositNote2 = await bridge.deposit(chainId1, tokenName, anchorSize, signer[1]);

      await bridge.update(chainId1, tokenName, anchorSize);

      // Check the leaf index is incremented by two
      const destAnchorEdge2After = controlledAnchor2.contract.edgeList(edgeIndex);
      assert.equal(destAnchorEdge2Before.latestLeafIndex + 2, destAnchorEdge2After.latestLeafIndex);

      // Withdraw from the bridge with older deposit note
      await bridge.withdraw(depositNote1, other_signer[1]);

      // Check the balance of the other_signer.
      const endingBalanceDest = existingTokenDest.getBalance(other_signer[1].address);
      assert.equal(endingBalanceDest, startingBalanceDest + anchorSize);
    });

    it('should update with Anchor interaction', async () => {
      const anchorSize = '1000000000000000000';
      const controlledAnchor1: Anchor = bridge.getAnchor(chainId1, tokenName, anchorSize);
      const controlledAnchor2: Anchor = bridge.getAnchor(chainId2, tokenName, anchorSize);
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainId1);
      const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);

      // Do a deposit on the Anchor directly
      const deposit = await controlledAnchor1.deposit(chainId2);

      // Call update on the bridge
      await bridge.update(chainId1, tokenName, anchorSize);

      // Verify the linkedAnchor is properly updated
      const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
      assert.equal(destAnchorEdge2Before.latestLeafIndex + 1, destAnchorEdge2After.latestLeafIndex);
    })
  });
});