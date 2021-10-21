/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const assert = require('assert');
import { ethers, network } from 'hardhat';

const snarkjs = require('snarkjs')
const fs = require('fs');
const path = require('path');

const ganache = require('ganache-cli');

// Convenience wrapper classes for contract classes
import Bridge, { BridgeInput } from '../../lib/darkwebb/Bridge';
import Anchor from '../../lib/darkwebb/Anchor';
import MintableToken from '../../lib/darkwebb/MintableToken';
import { toFixedHex } from '../../lib/darkwebb/utils';

function startGanacheServer(port: number, networkId: number, mnemonic: string) {
  const ganacheServer = ganache.server({
    port: port,
    network_id: networkId,
    _chainId: networkId,
    chainId: networkId,
    _chainIdRpc: networkId,
    mnemonic:
      mnemonic,
  });

  ganacheServer.listen(port);
  console.log(`Ganache Started on http://127.0.0.1:${port} ..`);

  return ganacheServer;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('multichain tests', () => {

  // setup ganache networks
  let ganacheServer2: any;
  let ganacheServer3: any;
  let ganacheServer4: any;

  before('setup networks', async () => {
    ganacheServer2 = startGanacheServer(8545, 1337, 'congress island collect purity dentist team gas unlock nuclear pig combine sight');
    ganacheServer3 = startGanacheServer(9999, 9999, 'aspect biology suit thought bottom popular custom rebuild recall sauce endless local');
    ganacheServer4 = startGanacheServer(4444, 4444, 'harvest useful giraffe swim rail ostrich public awful provide amazing tank weapon');
    await sleep(2000);
  });

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
      chainIDs: [31337, 1337]
    };

    let bridge3WebbEthInputFresh = {
      anchorInputs: [
        {
          asset: webbETHAssetDetails,
          anchorSizes: ['100000000000000000', '1000000000000000000', '10000000000000000000'],
        }
      ],
      chainIDs: [31337, 1337, 9999]
    };

    let bridge2WebbEthInputExisting: BridgeInput;
    let bridge3WebbEthInputExisting: BridgeInput;

    let ganacheProvider2 = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    let ganacheWallet2 = new ethers.Wallet('c0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e', ganacheProvider2);
    let ganacheProvider3 = new ethers.providers.JsonRpcProvider('http://localhost:9999');
    let ganacheWallet3 = new ethers.Wallet('745ee040ef2b087f075dc7d314fa06797ed2ffd4ab59a4cc35c0a33e8d2b7791', ganacheProvider3);

    before('construction-tests', async () => {
      const signers = await ethers.getSigners();

      // Create a token to test bridge construction support for existing tokens
      const tokenInstance1 = await MintableToken.createToken('existingERC20', 'EXIST', signers[7]);
      const tokenInstance2 = await MintableToken.createToken('existingERC20', 'EXIST', ganacheWallet2);
      const tokenInstance3 = await MintableToken.createToken('existingERC20', 'EXIST', ganacheWallet3);

      await tokenInstance1.mintTokens(signers[1].address, '100000000000000000000000000');

      bridge2WebbEthInputExisting = {
        anchorInputs: [
          {
            asset: {
              31337: tokenInstance1.contract.address,
              1337: tokenInstance2.contract.address,
            },
            anchorSizes: ['1000000000000000000', '100000000000000000000', '10000000000000000000000'],
          }
        ],
        chainIDs: [31337, 1337]
      };

      bridge3WebbEthInputExisting = {
        anchorInputs: [
          {
            asset: {
              31337: tokenInstance1.contract.address,
              1337: tokenInstance2.contract.address,
              9999: tokenInstance3.contract.address,
            },
            anchorSizes: ['1000000000000000000', '100000000000000000000', '10000000000000000000000'],
          }
        ],
        chainIDs: [31337, 1337, 9999]
      };

    });

    it('create 2 side bridge for new token', async () => {
      const signers = await ethers.getSigners();      
      const deploymentConfig = {
        31337: signers[1],
        1337: ganacheWallet2,
      }

      const bridge = await Bridge.deployBridge(bridge2WebbEthInputFresh, deploymentConfig);

      // Should be able to retrieve individual anchors
      const chainIdSource = 31337;
      const chainIdDest = 1337;
      const tokenName = 'webbEthereum';
      const anchorSize = '1000000000000000000';
      const controlledAnchor1: Anchor = bridge.getAnchor(chainIdSource, tokenName, anchorSize)!;
      const controlledAnchor2: Anchor = bridge.getAnchor(chainIdDest, tokenName, anchorSize)!;

      // Should be able to retrieve the token address (so we can mint tokens for test scenario)
      const webbTokenAddress = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName, chainId: chainIdSource}));
      const webbToken = await MintableToken.tokenFromAddress(webbTokenAddress!, signers[1]);
      const tx = await webbToken.mintTokens(signers[2].address, '100000000000000000000000');

      // get the state of anchors before deposit
      const sourceAnchorRootBefore = await controlledAnchor1.contract.getLastRoot();
      const destAnchorNeighborRoot = await controlledAnchor2.contract.getLatestNeighborRoots();

      // Deposit on the bridge
      const depositNote = await bridge.deposit(chainIdDest, tokenName, anchorSize, signers[2]);
      
      // Check the state of anchors after deposit
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);

      const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
      const destAnchorEdgeAfter = await controlledAnchor2.contract.edgeList(edgeIndex);

      // make sure the roots / anchors state have changed
      assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
      assert.deepStrictEqual(ethers.BigNumber.from(0), destAnchorEdgeAfter.latestLeafIndex);
    });

    it('create 3 side bridge for new token', async () => {
      const signers = await ethers.getSigners();

      const deploymentConfig = {
        31337: signers[1],
        1337: ganacheWallet2,
        9999: ganacheWallet3,
      };
      const bridge = await Bridge.deployBridge(bridge3WebbEthInputFresh, deploymentConfig);

      // Should be able to retrieve individual anchors
      const chainIdSource = 31337;
      const chainId2 = 1337;
      const chainId3 = 9999;
      const tokenName = 'webbEthereum';
      const anchorSize = '1000000000000000000';
      const controlledAnchor1: Anchor = bridge.getAnchor(chainIdSource, tokenName, anchorSize)!;
      const controlledAnchor2: Anchor = bridge.getAnchor(chainId2, tokenName, anchorSize)!;
      const controlledAnchor3: Anchor = bridge.getAnchor(chainId3, tokenName, anchorSize)!;

      // get the state of anchors before deposit
      const sourceAnchorRootBefore = await controlledAnchor1.contract.getLastRoot();

      // Should be able to retrieve the token address (so we can mint tokens for test scenario)
      const webbTokenAddress = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName, chainId: chainIdSource}));
      const webbToken = await MintableToken.tokenFromAddress(webbTokenAddress!, signers[1]);
      const tx = await webbToken.mintTokens(signers[2].address, '100000000000000000000000');
      const webbTokenAddress2 = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName, chainId: chainId2}));
      const webbToken2 = await MintableToken.tokenFromAddress(webbTokenAddress2!, ganacheWallet2);
      const tx2 = await webbToken2.mintTokens(ganacheWallet2.address, '100000000000000000000000');
      const webbTokenAddress3 = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName, chainId: chainId3}));
      const webbToken3 = await MintableToken.tokenFromAddress(webbTokenAddress3!, ganacheWallet3);
      const tx3 = await webbToken3.mintTokens(ganacheWallet3.address, '100000000000000000000000');

      // Deposit on the bridge with dest chainID and 
      const depositNote = await bridge.deposit(chainId2, tokenName, anchorSize, signers[2]);
      
      // Check the state of anchors after deposit
      const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);
      const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
      edgeIndex = await controlledAnchor3.contract.edgeIndex(chainIdSource);
      const destAnchorEdge3After = await controlledAnchor3.contract.edgeList(edgeIndex);

      // make deposits on all other edges of the bridge - should not revert
      const depositNote2 = await bridge.deposit(chainIdSource, tokenName, anchorSize, ganacheWallet2);
      const depositNote3 = await bridge.deposit(chainIdSource, tokenName, anchorSize, ganacheWallet3);

      // make sure the roots / anchors state have changed
      assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
      assert.deepStrictEqual(destAnchorEdge2After.latestLeafIndex, destAnchorEdge3After.latestLeafIndex);
      assert.deepStrictEqual(destAnchorEdge2After.root, destAnchorEdge3After.root);
    });

    it('create 2 side bridge for existing token', async () => {
      const signers = await ethers.getSigners();

      const deploymentConfig = {
        31337: signers[1],
        1337: ganacheWallet2,
      };
      const bridge = await Bridge.deployBridge(bridge2WebbEthInputExisting, deploymentConfig);

      // Should be able to retrieve individual anchors
      const chainIdSource = 31337;
      const chainIdDest = 1337;
      const tokenName = 'webbexistingERC20'; // end user should never need to know this
      const anchorSize = '1000000000000000000';
      const controlledAnchor1: Anchor = bridge.getAnchor(chainIdSource, tokenName, anchorSize)!;
      const controlledAnchor2: Anchor = bridge.getAnchor(chainIdDest, tokenName, anchorSize)!;

      // Should be able to retrieve the token address (so we can mint tokens for test scenario)
      const webbTokenAddress = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName, chainId: chainIdSource}));
      const webbToken = await MintableToken.tokenFromAddress(webbTokenAddress!, signers[1]);
      const tx = await webbToken.mintTokens(signers[2].address, '100000000000000000000000');

      // get the state of anchors before deposit
      const sourceAnchorRootBefore = await controlledAnchor1.contract.getLastRoot();
      const destAnchorNeighborRoot = await controlledAnchor2.contract.getLatestNeighborRoots();

      // Deposit on the bridge
      const depositNote = await bridge.deposit(chainIdDest, tokenName, anchorSize, signers[2]);
      
      // Check the state of anchors after deposit
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);

      const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
      const destAnchorEdgeAfter = await controlledAnchor2.contract.edgeList(edgeIndex);

      // make sure the roots / anchors state have changed
      assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
      assert.deepStrictEqual(ethers.BigNumber.from(0), destAnchorEdgeAfter.latestLeafIndex);
    });

    it('create 3 side bridge for existing token', async () => {
      const signers = await ethers.getSigners();

      const deploymentConfig = {
        31337: signers[1],
        1337: ganacheWallet2,
        9999: ganacheWallet3,
      };
      const bridge = await Bridge.deployBridge(bridge3WebbEthInputExisting, deploymentConfig);

      // Should be able to retrieve individual anchors
      const chainIdSource = 31337;
      const chainId2 = 1337;
      const chainId3 = 9999;
      const tokenName = 'webbexistingERC20';
      const anchorSize = '1000000000000000000';
      const controlledAnchor1: Anchor = bridge.getAnchor(chainIdSource, tokenName, anchorSize)!;
      const controlledAnchor2: Anchor = bridge.getAnchor(chainId2, tokenName, anchorSize)!;
      const controlledAnchor3: Anchor = bridge.getAnchor(chainId3, tokenName, anchorSize)!;

      // get the state of anchors before deposit
      const sourceAnchorRootBefore = await controlledAnchor1.contract.getLastRoot();

      // Should be able to retrieve the token address (so we can mint tokens for test scenario)
      const webbTokenAddress = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName, chainId: chainIdSource}));
      const webbToken = await MintableToken.tokenFromAddress(webbTokenAddress!, signers[1]);
      const tx = await webbToken.mintTokens(signers[2].address, '100000000000000000000000');

      // Deposit on the bridge with dest chainID and 
      const depositNote = await bridge.deposit(chainId2, tokenName, anchorSize, signers[2]);
      
      // Check the state of anchors after deposit
      const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);
      const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
      edgeIndex = await controlledAnchor3.contract.edgeIndex(chainIdSource);
      const destAnchorEdge3After = await controlledAnchor3.contract.edgeList(edgeIndex);

      // make sure the roots / anchors state have changed
      assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
      assert.notEqual('0x0000000000000000000000000000000000000000000000000000000000000000', destAnchorEdge2After.root);
      assert.notEqual('0x0000000000000000000000000000000000000000000000000000000000000000', destAnchorEdge3After.root);
      assert.deepStrictEqual(destAnchorEdge2After.latestLeafIndex, destAnchorEdge3After.latestLeafIndex);
      assert.deepStrictEqual(destAnchorEdge2After.root, destAnchorEdge3After.root);
    });
  });

  describe('Bridge connection and sync', () => {

    let bridge: Bridge;

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
      chainIDs: [31337, 1337]
    };

    let ganacheProvider2 = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    let ganacheWallet2 = new ethers.Wallet('c0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e', ganacheProvider2);

    beforeEach('connection-tests', async () => {
      // Create the bridge,
      const signers = await ethers.getSigners();
      
      const deploymentConfig = {
        31337: signers[1],
        1337: ganacheWallet2,
      }

      const createdBridge = await Bridge.deployBridge(bridge2WebbEthInputFresh, deploymentConfig);

      // Export the config for connecting to the bridge
      const bridgeConfig = createdBridge.exportConfig();

      // Connect to the bridge
      bridge = await Bridge.connectBridge(bridgeConfig);
    })

    it('should properly deposit and withdraw after connecting', async () => {
      // // Fetch information about the anchor to be updated.
      // const signers = await ethers.getSigners();
      // const tokenName = 'webbEthereum';
      // const anchorSize = '1000000000000000000';

      // const controlledAnchor2: Anchor = bridge.getAnchor(chainId1, tokenName, anchorSize)!;
      // let edgeIndex = await controlledAnchor2.contract.edgeIndex(destChainID2);
      // const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);
      // const webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, signers[1]);
      // const startingBalanceDest = await webbToken.getBalance(signers[1].address);

      // // Make a deposit
      // const depositNote1 = await bridge.deposit(chainId1, webbTokenName, anchorSize, ganacheWallet2);

      // // Check the leaf index is incremented
      // const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
      // assert.deepStrictEqual(destAnchorEdge2Before.latestLeafIndex.add(1), destAnchorEdge2After.latestLeafIndex);

      // // Withdraw from the bridge
      // console.log('deposit: ', depositNote1);
      // await bridge.withdraw(depositNote1!, webbTokenName, anchorSize, signers[1].address, signers[1].address, signers[1]);

      // // Check the balance of the signer
      // const endingBalanceDest = await webbToken.getBalance(signers[1].address);
      // assert.deepStrictEqual(endingBalanceDest, startingBalanceDest.add(anchorSize));
    })
  });

  describe('2 sided bridge existing token use', () => {

    // ERC20 compliant contracts that can easily create balances for test
    let tokenName = 'existingERC20';
    let existingTokenSrc: MintableToken;
    let existingTokenDest: MintableToken;

    // TODO: Remove these variables when contracts updated with wrap/unwrap functionality
    let webbTokenName = 'webbexistingERC20';
    let webbTokenSrc: string;
    let webbTokenDest: string;

    let bridge: Bridge;
    let chainId1 = 31337;
    let ganacheProvider2 = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    let ganacheWallet2 = new ethers.Wallet('c0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e', ganacheProvider2);
    const destChainID2 = 1337;

    // let ganacheProvider2 = new ethers.providers.JsonRpcProvider('http://localhost:9999');
    // let ganacheWallet2 = new ethers.Wallet('745ee040ef2b087f075dc7d314fa06797ed2ffd4ab59a4cc35c0a33e8d2b7791', ganacheProvider2);
    // const destChainID2 = 9999;

    before(async () => {
      const signers = await ethers.getSigners();

      existingTokenSrc = await MintableToken.createToken(tokenName, 'EXIST', signers[7]);
      // Use some other signer with provider on other chain
      existingTokenDest = await MintableToken.createToken(tokenName, 'EXIST', ganacheWallet2);

      // mint some tokens to the user of the bridge
      await existingTokenSrc.mintTokens(signers[1].address, '100000000000000000000000000');
    })

    beforeEach(async () => {
      const signers = await ethers.getSigners();

      // create the config for the bridge
      const existingTokenBridgeConfig = {
        anchorInputs: [
          {
            asset: {
              31337: existingTokenSrc.contract.address,
              [destChainID2]: existingTokenDest.contract.address,
            },
            anchorSizes: ['1000000000000000000', '100000000000000000000', '10000000000000000000000'],
          }
        ],
        chainIDs: [31337, destChainID2]
      };

      // setup the config for deployers of contracts (admins)
      const deploymentConfig = {
        31337: signers[0],
        [destChainID2]: ganacheWallet2,
      }
      
      // deploy the bridge
      bridge = await Bridge.deployBridge(existingTokenBridgeConfig, deploymentConfig);

      // Should be able to retrieve the token address (so we can mint tokens for test scenario)
      webbTokenSrc = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: 31337}))!;
      let webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, signers[0]);
      await webbToken.mintTokens(signers[1].address, '100000000000000000000000');
      webbTokenDest = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: destChainID2}))!;
      webbToken = await MintableToken.tokenFromAddress(webbTokenDest, ganacheWallet2);
      await webbToken.mintTokens(ganacheWallet2.address, '100000000000000000000000');

      // make one deposit so the edge exists
      await bridge.deposit(destChainID2, webbTokenName, '1000000000000000000', signers[1]);
      await bridge.deposit(31337, webbTokenName, '1000000000000000000', ganacheWallet2);
    })

    describe('#bridging', () => {
      it('should withdraw successfully from latest deposit', async () => {
        // Fetch information about the anchor to be updated.
        const signers = await ethers.getSigners();
        const anchorSize = '1000000000000000000';
        console.log(`in the test: ${webbTokenName}`);

        const controlledAnchor2: Anchor = bridge.getAnchor(destChainID2, webbTokenName, anchorSize)!;
        let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainId1);
        const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);
        const webbToken = await MintableToken.tokenFromAddress(webbTokenDest, ganacheWallet2);
        const startingBalanceDest = await webbToken.getBalance(signers[1].address);

        // Make a deposit
        const depositNote1 = await bridge.deposit(destChainID2, webbTokenName, anchorSize, signers[1]);

        // Check the leaf index is incremented
        const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
        assert.deepStrictEqual(destAnchorEdge2Before.latestLeafIndex.add(1), destAnchorEdge2After.latestLeafIndex);

        // Withdraw from the bridge
        console.log('deposit: ', depositNote1);
        await bridge.withdraw(depositNote1!, webbTokenName, anchorSize, signers[1].address, signers[1].address, ganacheWallet2);

        // Check the balance of the signer
        const endingBalanceDest = await webbToken.getBalance(signers[1].address);
        assert.deepStrictEqual(endingBalanceDest, startingBalanceDest.add(anchorSize));
      })

      it('should withdraw on hardhat from ganache deposit', async () => {
        // Fetch information about the anchor to be updated.
        const signers = await ethers.getSigners();
        const anchorSize = '1000000000000000000';
        console.log(`in the test: ${webbTokenName}`);

        const controlledAnchor2: Anchor = bridge.getAnchor(chainId1, webbTokenName, anchorSize)!;
        let edgeIndex = await controlledAnchor2.contract.edgeIndex(destChainID2);
        const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);
        const webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, signers[1]);
        const startingBalanceDest = await webbToken.getBalance(signers[1].address);

        // Make a deposit
        const depositNote1 = await bridge.deposit(chainId1, webbTokenName, anchorSize, ganacheWallet2);

        // Check the leaf index is incremented
        const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
        assert.deepStrictEqual(destAnchorEdge2Before.latestLeafIndex.add(1), destAnchorEdge2After.latestLeafIndex);

        // Withdraw from the bridge
        console.log('deposit: ', depositNote1);
        await bridge.withdraw(depositNote1!, webbTokenName, anchorSize, signers[1].address, signers[1].address, signers[1]);

        // Check the balance of the signer
        const endingBalanceDest = await webbToken.getBalance(signers[1].address);
        assert.deepStrictEqual(endingBalanceDest, startingBalanceDest.add(anchorSize));
      })
      
      it('should wrap assets on deposit and unwrap on withdraw', async () => {
        // const signers = await ethers.getSigners();
        // const anchorSize = '1000000000000000000';

        // // Check the balanceOf of the existing tokens.
        // const startingBalanceSource = await existingTokenSrc.getBalance(signers[1].address);
        // const startingBalanceDest = await existingTokenDest.getBalance(await ganacheWallet2.getAddress());

        // // Deposit and withdraw
        // const depositNote = await bridge.deposit(chainId1, tokenName, anchorSize, signers[1]);
        // await bridge.withdraw(depositNote!, tokenName, anchorSize, signers[1].address, ganacheWallet2.address, ganacheWallet2);

        // // Verify the balanceOf existing tokens
        // const endingBalanceSource = await existingTokenSrc.getBalance(signers[1].address);
        // const endingBalanceDest = await existingTokenDest.getBalance(ganacheWallet2.address);
        // assert.equal(startingBalanceSource.sub(anchorSize), endingBalanceSource);
        // assert.equal(startingBalanceDest, endingBalanceDest + anchorSize);
      });

      it('should update multiple deposits and withdraw historic deposit', async () => {
        // Fetch information about the anchor to be updated.
        const signers = await ethers.getSigners();
        const anchorSize = '1000000000000000000';
        console.log(`in the test: ${webbTokenName}`);

        const controlledAnchor2: Anchor = bridge.getAnchor(destChainID2, webbTokenName, anchorSize)!;
        let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainId1);
        const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);
        const webbToken = await MintableToken.tokenFromAddress(webbTokenDest, ganacheWallet2);
        const startingBalanceDest = await webbToken.getBalance(signers[1].address);

        // Make two deposits
        const depositNote1 = await bridge.deposit(destChainID2, webbTokenName, anchorSize, signers[1]);
        const depositNote2 = await bridge.deposit(destChainID2, webbTokenName, anchorSize, signers[1]);

        // Check the leaf index is incremented by two
        const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
        assert.deepStrictEqual(destAnchorEdge2Before.latestLeafIndex.add(2), destAnchorEdge2After.latestLeafIndex);

        // Withdraw from the bridge with older deposit note
        await bridge.withdraw(depositNote1!, webbTokenName, anchorSize, signers[1].address, signers[1].address, ganacheWallet2);

        // Check the balance of the other_signer.
        const endingBalanceDest = await webbToken.getBalance(signers[1].address);
        assert.deepStrictEqual(endingBalanceDest, startingBalanceDest.add(anchorSize));
      });

      it('should update multiple deposits and withdraw historic deposit from ganache', async () => {
        // Fetch information about the anchor to be updated.
        const signers = await ethers.getSigners();
        const anchorSize = '1000000000000000000';
        console.log(`in the test: ${webbTokenName}`);

        const controlledAnchor2: Anchor = bridge.getAnchor(chainId1, webbTokenName, anchorSize)!;
        let edgeIndex = await controlledAnchor2.contract.edgeIndex(destChainID2);
        const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);
        const webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, signers[1]);
        const startingBalanceDest = await webbToken.getBalance(signers[1].address);

        // Make two deposits
        const depositNote1 = await bridge.deposit(chainId1, webbTokenName, anchorSize, ganacheWallet2);
        const depositNote2 = await bridge.deposit(chainId1, webbTokenName, anchorSize, ganacheWallet2);

        // Check the leaf index is incremented by two
        const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
        assert.deepStrictEqual(destAnchorEdge2Before.latestLeafIndex.add(2), destAnchorEdge2After.latestLeafIndex);

        // Withdraw from the bridge with older deposit note
        await bridge.withdraw(depositNote1!, webbTokenName, anchorSize, signers[1].address, signers[1].address, signers[1]);

        // Check the balance of the other_signer.
        const endingBalanceDest = await webbToken.getBalance(signers[1].address);
        assert.deepStrictEqual(endingBalanceDest, startingBalanceDest.add(anchorSize));
      });

      it('should update with Anchor interaction', async () => {
        // const anchorSize = '1000000000000000000';
        // const controlledAnchor1: Anchor = bridge.getAnchor(chainId1, tokenName, anchorSize)!;
        // const controlledAnchor2: Anchor = bridge.getAnchor(destChainID2, tokenName, anchorSize)!;
        // let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainId1);
        // const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);

        // // Do a deposit on the Anchor directly
        // const deposit = await controlledAnchor1.deposit(destChainID2);

        // // Call update on the bridge

        // // Verify the linkedAnchor is properly updated
        // const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
        // assert.equal(destAnchorEdge2Before.latestLeafIndex.add(1), destAnchorEdge2After.latestLeafIndex);
      })
    });
  });

  describe('3 sided bridge existing token use', () => {
    // ERC20 compliant contracts that can easily create balances for test
    let tokenName = 'existingERC20';
    let existingTokenSrc: MintableToken;
    let existingTokenSrc2: MintableToken;
    let existingTokenSrc3: MintableToken;

    // TODO: Remove these variables when contracts updated with wrap/unwrap functionality
    let webbTokenName = 'webbexistingERC20';
    let webbTokenSrc: string;
    let webbTokenSrc2: string;
    let webbTokenSrc3: string;

    let bridge: Bridge;
    let chainId1 = 31337;
    let ganacheProvider2 = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    let ganacheWallet2 = new ethers.Wallet('c0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e', ganacheProvider2);
    const destChainID2 = 1337;

    let ganacheProvider3 = new ethers.providers.JsonRpcProvider('http://localhost:9999');
    let ganacheWallet3 = new ethers.Wallet('745ee040ef2b087f075dc7d314fa06797ed2ffd4ab59a4cc35c0a33e8d2b7791', ganacheProvider3);
    const destChainID3 = 9999;

    before(async () => {
      const signers = await ethers.getSigners();

      existingTokenSrc = await MintableToken.createToken(tokenName, 'EXIST', signers[7]);
      existingTokenSrc2 = await MintableToken.createToken(tokenName, 'EXIST', ganacheWallet2);
      existingTokenSrc3 = await MintableToken.createToken(tokenName, 'EXIST', ganacheWallet3);

      // mint some tokens to the user of the bridge
      await existingTokenSrc.mintTokens(signers[1].address, '100000000000000000000000000');
      await existingTokenSrc2.mintTokens(ganacheWallet2.address, '100000000000000000000000000');
      await existingTokenSrc3.mintTokens(ganacheWallet3.address, '100000000000000000000000000');
    })

    beforeEach(async () => {
      const signers = await ethers.getSigners();

      // create the config for the bridge
      const existingTokenBridgeConfig = {
        anchorInputs: [
          {
            asset: {
              31337: existingTokenSrc.contract.address,
              [destChainID2]: existingTokenSrc2.contract.address,
              [destChainID3]: existingTokenSrc3.contract.address,
            },
            anchorSizes: ['1000000000000000000', '100000000000000000000', '10000000000000000000000'],
          }
        ],
        chainIDs: [31337, destChainID2, destChainID3]
      };

      // setup the config for deployers of contracts (admins)
      const deploymentConfig = {
        31337: signers[1],
        [destChainID2]: ganacheWallet2,
        [destChainID3]: ganacheWallet3,
      }
      
      // deploy the bridge
      bridge = await Bridge.deployBridge(existingTokenBridgeConfig, deploymentConfig);

      // Should be able to retrieve the token address (so we can mint tokens for test scenario)
      webbTokenSrc = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: 31337}))!;
      let webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, signers[1]);
      await webbToken.mintTokens(signers[1].address, '100000000000000000000000');
      webbTokenSrc2 = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: destChainID2}))!;
      webbToken = await MintableToken.tokenFromAddress(webbTokenSrc2, ganacheWallet2);
      await webbToken.mintTokens(ganacheWallet2.address, '100000000000000000000000');
      webbTokenSrc3 = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: destChainID3}))!;
      webbToken = await MintableToken.tokenFromAddress(webbTokenSrc3, ganacheWallet3);
      await webbToken.mintTokens(ganacheWallet3.address, '100000000000000000000000');

      // make deposits so edges exists
      await bridge.deposit(destChainID2, webbTokenName, '1000000000000000000', signers[1]);
      await bridge.deposit(destChainID3, webbTokenName, '1000000000000000000', ganacheWallet2);
      await bridge.deposit(31337, webbTokenName, '1000000000000000000', ganacheWallet3);
    })

    it.skip('should withdraw successfully from latest deposits on all chains', async () => {
      // Fetch information about the anchor to be updated.
      const signers = await ethers.getSigners();
      const anchorSize = '1000000000000000000';
      console.log(`in the test: ${webbTokenName}`);

      const controlledAnchor1: Anchor = bridge.getAnchor(chainId1, webbTokenName, anchorSize)!;
      let edgeIndex = await controlledAnchor1.contract.edgeIndex(chainId1);
      const destAnchorEdge1Before = await controlledAnchor1.contract.edgeList(edgeIndex);
      const webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, signers[1]);
      const startingBalanceDest = await webbToken.getBalance(signers[1].address);

      // Make a deposit on both chains
      const depositNote1 = await bridge.deposit(chainId1, webbTokenName, anchorSize, ganacheWallet2);

      // Check the leaf index is incremented
      const destAnchorEdge1After = await controlledAnchor1.contract.edgeList(edgeIndex);
      assert.deepStrictEqual(destAnchorEdge1Before.latestLeafIndex.add(1), destAnchorEdge1After.latestLeafIndex);

      // Withdraw from the bridge
      console.log('deposit: ', depositNote1);
      await bridge.withdraw(depositNote1!, webbTokenName, anchorSize, signers[1].address, signers[1].address, signers[1]);

      // Check the balance of the signer
      const endingBalanceAfterOneWithdraw = await webbToken.getBalance(signers[1].address);
      assert.deepStrictEqual(endingBalanceAfterOneWithdraw, startingBalanceDest.add(anchorSize));

      // make another deposit and withdraw from the third connected chain
      edgeIndex = await controlledAnchor1.contract.edgeIndex(destChainID3);
      const destAnchorEdge3Before = await controlledAnchor1.contract.edgeList(edgeIndex);

      const depositNote3 = await bridge.deposit(chainId1, webbTokenName, anchorSize, ganacheWallet3);

      // Check the leaf index is incremented
      const destAnchorEdge3After = await controlledAnchor1.contract.edgeList(edgeIndex);
      assert.deepStrictEqual(destAnchorEdge3Before.latestLeafIndex.add(1), destAnchorEdge3After.latestLeafIndex);

      // Withdraw from the bridge
      await bridge.withdraw(depositNote3!, webbTokenName, anchorSize, signers[1].address, signers[1].address, signers[1]);

      // Check the balance of the signer
      const endingBalanceAfterTwoWithdraw = await webbToken.getBalance(signers[1].address);
      assert.deepStrictEqual(endingBalanceAfterTwoWithdraw, endingBalanceAfterOneWithdraw.add(anchorSize));
    }).timeout(60000);

    it.skip('should verify snarkjs on 3 side build', async () => {
      // Fetch information about the anchor to be updated.
      const signers = await ethers.getSigners();
      const anchorSize = '1000000000000000000';

      const controlledAnchor2: Anchor = bridge.getAnchor(destChainID2, webbTokenName, anchorSize)!;
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainId1);
      const destAnchorEdge1Before = await controlledAnchor2.contract.edgeList(edgeIndex);
      const webbToken = await MintableToken.tokenFromAddress(webbTokenSrc2, ganacheWallet2);
      const startingBalanceDest = await webbToken.getBalance(signers[1].address);

      // Make a deposit
      const depositNote1 = await bridge.deposit(destChainID2, webbTokenName, anchorSize, signers[1]);

      // start making a proof for the anchor:
      // get the merkle proof from anchor1.
      const anchor1 = bridge.getAnchor(chainId1, webbTokenName, anchorSize)!;
      const anchor1Roots = await anchor1.populateRootsForProof();

      const { merkleRoot, pathElements, pathIndices } = anchor1.tree.path(depositNote1.index);

      const roots = await controlledAnchor2.populateRootsForProof();

      // populate the rest of the proof from anchor2
      const input = await controlledAnchor2.generateWitnessInput(
        depositNote1.deposit,
        depositNote1.originChainId,
        '0',
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
        roots,
        pathElements,
        pathIndices
      );

      const createWitness = async (data: any) => {
        const wtns = {type: "mem"};
        await snarkjs.wtns.calculate(data, path.join(
          "test",
          "fixtures/3",
          "poseidon_bridge_3.wasm"
        ), wtns);
        return wtns;
      }
      
      const wtns = await createWitness(input);

      let res = await snarkjs.groth16.prove('test/fixtures/3/circuit_final.zkey', wtns);
      const proof = res.proof;
      let publicSignals = res.publicSignals;
      let tempProof = proof;
      let tempSignals = publicSignals;
      const vKey = await snarkjs.zKey.exportVerificationKey('test/fixtures/3/circuit_final.zkey');

      res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      assert.strictEqual(res, true);
    }).timeout(60000);

    it.skip('should verify snarkjs on 3 side build with parsed solidity', async () => {
      // Fetch information about the anchor to be updated.
      const signers = await ethers.getSigners();
      const anchorSize = '1000000000000000000';

      const controlledAnchor2: Anchor = bridge.getAnchor(destChainID2, webbTokenName, anchorSize)!;
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainId1);
      const destAnchorEdge1Before = await controlledAnchor2.contract.edgeList(edgeIndex);
      const webbToken = await MintableToken.tokenFromAddress(webbTokenSrc2, ganacheWallet2);
      const startingBalanceDest = await webbToken.getBalance(signers[1].address);

      // Make a deposit
      const depositNote1 = await bridge.deposit(destChainID2, webbTokenName, anchorSize, signers[1]);

      // start making a proof for the anchor:
      // get the merkle proof from anchor1.
      const anchor1 = bridge.getAnchor(chainId1, webbTokenName, anchorSize)!;
      const anchor1Roots = await anchor1.populateRootsForProof();

      const { merkleRoot, pathElements, pathIndices } = anchor1.tree.path(depositNote1.index);

      const roots = await controlledAnchor2.populateRootsForProof();

      // populate the rest of the proof from anchor2
      const input = await controlledAnchor2.generateWitnessInput(
        depositNote1.deposit,
        depositNote1.originChainId,
        '0',
        BigInt(0),
        BigInt(0),
        BigInt(0),
        BigInt(0),
        roots,
        pathElements,
        pathIndices
      );

      const createWitness = async (data: any) => {
        const wtns = {type: "mem"};
        await snarkjs.wtns.calculate(data, path.join(
          "test",
          "fixtures/3",
          "poseidon_bridge_3.wasm"
        ), wtns);
        return wtns;
      }
      
      const wtns = await createWitness(input);

      let res = await snarkjs.groth16.prove('test/fixtures/3/circuit_final.zkey', wtns);
      const proof = res.proof;
      let publicSignals = res.publicSignals;
      let tempProof = proof;
      let tempSignals = publicSignals;
      const vKey = await snarkjs.zKey.exportVerificationKey('test/fixtures/3/circuit_final.zkey');

      res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
      
      // assert native verification before solidity export data
      assert.strictEqual(res, true);

      // convert the proof to groth 16 solidity calldata
      const groth16ProofCallData = await Anchor.groth16ExportSolidityCallData(tempProof, tempSignals);

      // convert the proof to solidityWithdrawCalldata
      const withdrawProofCalldata = await Anchor.generateWithdrawProofCallData(groth16ProofCallData, tempSignals);

      // parse the (proof, signals) back from solidity to typescript
      // const { parsedProof: proof, parsedSignals: signals } = await Anchor.parseProofCalldata(proofCallData);



      // check the groth16 verification again

    }).timeout(60000);
  });

  describe('4 sided bridge existing token use', () => {
    // ERC20 compliant contracts that can easily create balances for test
    let tokenName = 'existingERC20';
    let existingTokenSrc: MintableToken;
    let existingTokenSrc2: MintableToken;
    let existingTokenSrc3: MintableToken;
    let existingTokenSrc4: MintableToken;

    // TODO: Remove these variables when contracts updated with wrap/unwrap functionality
    let webbTokenName = 'webbexistingERC20';
    let webbTokenSrc: string;
    let webbTokenSrc2: string;
    let webbTokenSrc3: string;
    let webbTokenSrc4: string;

    let bridge: Bridge;
    let chainId1 = 31337;
    let ganacheProvider2 = new ethers.providers.JsonRpcProvider('http://localhost:8545');
    let ganacheWallet2 = new ethers.Wallet('c0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e', ganacheProvider2);
    const destChainID2 = 1337;

    let ganacheProvider3 = new ethers.providers.JsonRpcProvider('http://localhost:9999');
    let ganacheWallet3 = new ethers.Wallet('745ee040ef2b087f075dc7d314fa06797ed2ffd4ab59a4cc35c0a33e8d2b7791', ganacheProvider3);
    const destChainID3 = 9999;

    let ganacheProvider4 = new ethers.providers.JsonRpcProvider('http://localhost:4444');
    let ganacheWallet4 = new ethers.Wallet('d897ca733460ea2c7cda5150926ade4a40e6828bb1cb0d38f097102530b3ef42', ganacheProvider4);
    const destChainID4 = 4444;

    before(async () => {
      const signers = await ethers.getSigners();

      existingTokenSrc = await MintableToken.createToken(tokenName, 'EXIST', signers[7]);
      existingTokenSrc2 = await MintableToken.createToken(tokenName, 'EXIST', ganacheWallet2);
      existingTokenSrc3 = await MintableToken.createToken(tokenName, 'EXIST', ganacheWallet3);
      existingTokenSrc4 = await MintableToken.createToken(tokenName, 'EXIST', ganacheWallet4);

      // mint some tokens to the user of the bridge
      await existingTokenSrc.mintTokens(signers[1].address, '100000000000000000000000000');
      await existingTokenSrc2.mintTokens(ganacheWallet2.address, '100000000000000000000000000');
      await existingTokenSrc3.mintTokens(ganacheWallet3.address, '100000000000000000000000000');
      await existingTokenSrc4.mintTokens(ganacheWallet4.address, '100000000000000000000000000');
    })

    beforeEach(async () => {
      const signers = await ethers.getSigners();

      // create the config for the bridge
      const existingTokenBridgeConfig = {
        anchorInputs: [
          {
            asset: {
              31337: existingTokenSrc.contract.address,
              [destChainID2]: existingTokenSrc2.contract.address,
              [destChainID3]: existingTokenSrc3.contract.address,
              [destChainID4]: existingTokenSrc4.contract.address,
            },
            anchorSizes: ['1000000000000000000', '100000000000000000000'],
          }
        ],
        chainIDs: [31337, destChainID2, destChainID3, destChainID4]
      };

      // setup the config for deployers of contracts (admins)
      const deploymentConfig = {
        31337: signers[1],
        [destChainID2]: ganacheWallet2,
        [destChainID3]: ganacheWallet3,
        [destChainID4]: ganacheWallet4,
      }
      
      // deploy the bridge
      bridge = await Bridge.deployBridge(existingTokenBridgeConfig, deploymentConfig);

      // Should be able to retrieve the token address (so we can mint tokens for test scenario)
      webbTokenSrc = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: 31337}))!;
      let webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, signers[1]);
      await webbToken.mintTokens(signers[1].address, '100000000000000000000000');
      webbTokenSrc2 = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: destChainID2}))!;
      webbToken = await MintableToken.tokenFromAddress(webbTokenSrc2, ganacheWallet2);
      await webbToken.mintTokens(ganacheWallet2.address, '100000000000000000000000');
      webbTokenSrc3 = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: destChainID3}))!;
      webbToken = await MintableToken.tokenFromAddress(webbTokenSrc3, ganacheWallet3);
      await webbToken.mintTokens(ganacheWallet3.address, '100000000000000000000000');
      webbTokenSrc4 = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: destChainID4}))!;
      webbToken = await MintableToken.tokenFromAddress(webbTokenSrc4, ganacheWallet4);
      await webbToken.mintTokens(ganacheWallet4.address, '100000000000000000000000');

      // make deposits so edges exists
      await bridge.deposit(destChainID2, webbTokenName, '1000000000000000000', signers[1]);
      await bridge.deposit(destChainID3, webbTokenName, '1000000000000000000', ganacheWallet2);
      await bridge.deposit(destChainID4, webbTokenName, '1000000000000000000', ganacheWallet3);
      await bridge.deposit(31337, webbTokenName, '1000000000000000000', ganacheWallet4);
    })

    it('should withdraw successfully from latest deposits on all chains', async () => {
      // Fetch information about the anchor to be updated.
      const signers = await ethers.getSigners();
      const anchorSize = '1000000000000000000';
      console.log(`in the test: ${webbTokenName}`);

      const controlledAnchor1: Anchor = bridge.getAnchor(chainId1, webbTokenName, anchorSize)!;
      let edgeIndex = await controlledAnchor1.contract.edgeIndex(chainId1);
      const destAnchorEdge1Before = await controlledAnchor1.contract.edgeList(edgeIndex);
      const webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, signers[1]);
      const startingBalanceDest = await webbToken.getBalance(signers[1].address);

      // Make a deposit on the second chain
      const depositNote1 = await bridge.deposit(chainId1, webbTokenName, anchorSize, ganacheWallet2);

      // Check the leaf index is incremented
      const destAnchorEdge1After = await controlledAnchor1.contract.edgeList(edgeIndex);
      assert.deepStrictEqual(destAnchorEdge1Before.latestLeafIndex.add(1), destAnchorEdge1After.latestLeafIndex);

      // Withdraw from the first chain
      console.log('deposit: ', depositNote1);
      await bridge.withdraw(depositNote1!, webbTokenName, anchorSize, signers[1].address, signers[1].address, signers[1]);

      // Check the balance of the signer
      const endingBalanceAfterOneWithdraw = await webbToken.getBalance(signers[1].address);
      assert.deepStrictEqual(endingBalanceAfterOneWithdraw, startingBalanceDest.add(anchorSize));

      // make a deposit from the third connected chain
      edgeIndex = await controlledAnchor1.contract.edgeIndex(destChainID3);
      const destAnchorEdge3Before = await controlledAnchor1.contract.edgeList(edgeIndex);
      const depositNote3 = await bridge.deposit(chainId1, webbTokenName, anchorSize, ganacheWallet3);

      // Check the leaf index is incremented
      const destAnchorEdge3After = await controlledAnchor1.contract.edgeList(edgeIndex);
      assert.deepStrictEqual(destAnchorEdge3Before.latestLeafIndex.add(1), destAnchorEdge3After.latestLeafIndex);

      // Withdraw from the third connected chain
      await bridge.withdraw(depositNote3!, webbTokenName, anchorSize, signers[1].address, signers[1].address, signers[1]);

      const endingBalanceAfterTwoWithdraw = await webbToken.getBalance(signers[1].address);
      assert.deepStrictEqual(endingBalanceAfterTwoWithdraw, endingBalanceAfterOneWithdraw.add(anchorSize));

      // make a deposit from the fourth connected chain
      edgeIndex = await controlledAnchor1.contract.edgeIndex(destChainID4);
      const destAnchorEdge4Before = await controlledAnchor1.contract.edgeList(edgeIndex);
      const depositNote4 = await bridge.deposit(chainId1, webbTokenName, anchorSize, ganacheWallet4);

      // Check the leaf index is incremented
      const destAnchorEdge4After = await controlledAnchor1.contract.edgeList(edgeIndex);
      assert.deepStrictEqual(destAnchorEdge4Before.latestLeafIndex.add(1), destAnchorEdge4After.latestLeafIndex);

      // Withdraw from the third connected chain
      await bridge.withdraw(depositNote4!, webbTokenName, anchorSize, signers[1].address, signers[1].address, signers[1]);

      // Check the balance of the signer
      const endingBalanceAfterThreeWithdraw = await webbToken.getBalance(signers[1].address);
      assert.deepStrictEqual(endingBalanceAfterThreeWithdraw, endingBalanceAfterTwoWithdraw.add(anchorSize));
    }).timeout(60000);
  });

  after('terminate networks', () => {
    ganacheServer2.close(console.error);
    ganacheServer3.close(console.error);
  });
});