/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const assert = require('assert');
import { ethers } from 'hardhat';

// Convenience wrapper classes for contract classes
import Bridge, { BridgeInput } from '../../lib/darkwebb/Bridge';
import Anchor from '../../lib/darkwebb/Anchor';
import MintableToken from '../../lib/darkwebb/MintableToken';

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

  // config for ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"
  let ganacheProvider2 = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  let ganacheWallet2 = new ethers.Wallet('c0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e', ganacheProvider2);
  const destChainID2 = 1337;

  // config for `ganache-cli -m "aspect biology suit thought bottom popular custom rebuild recall sauce endless local" -p 9999 -i 9999 --chain-id 9999`
  let ganacheProvider3 = new ethers.providers.JsonRpcProvider('http://localhost:9999');
  let ganacheWallet3 = new ethers.Wallet('745ee040ef2b087f075dc7d314fa06797ed2ffd4ab59a4cc35c0a33e8d2b7791', ganacheProvider3);
  const destChainID3 = 9999;

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
    assert.equal('0x0000000000000000000000000000000000000000000000000000000000000000', destAnchorNeighborRoot[0]);

    // Deposit on the bridge
    const depositNote = await bridge.deposit(chainIdDest, tokenName, anchorSize, signers[2]);
    
    // Check the state of anchors after deposit
    let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);

    const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
    const destAnchorEdgeAfter = await controlledAnchor2.contract.edgeList(edgeIndex);

    // make sure the roots / anchors state have changed
    assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
    assert.notEqual('0x0000000000000000000000000000000000000000000000000000000000000000', destAnchorEdgeAfter.root);
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
    assert.equal('0x0000000000000000000000000000000000000000000000000000000000000000', destAnchorNeighborRoot[0]);

    // Deposit on the bridge
    const depositNote = await bridge.deposit(chainIdDest, tokenName, anchorSize, signers[2]);
    
    // Check the state of anchors after deposit
    let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainIdSource);

    const sourceAnchorRootAfter = await controlledAnchor1.contract.getLastRoot();
    const destAnchorEdgeAfter = await controlledAnchor2.contract.edgeList(edgeIndex);

    // make sure the roots / anchors state have changed
    assert.notEqual(sourceAnchorRootAfter, sourceAnchorRootBefore);
    assert.notEqual('0x0000000000000000000000000000000000000000000000000000000000000000', destAnchorEdgeAfter.root);
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
 
describe('2 sided bridge fresh token use', () => {
  beforeEach(async () => {
    // deploy the 
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

  // config for ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"
  let ganacheProvider2 = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  let ganacheWallet2 = new ethers.Wallet('c0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e', ganacheProvider2);
  const destChainID2 = 1337;

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
            1337: existingTokenDest.contract.address,
          },
          anchorSizes: ['1000000000000000000', '100000000000000000000', '10000000000000000000000'],
        }
      ],
      chainIDs: [31337, 1337]
    };

    // setup the config for deployers of contracts (admins)
    const deploymentConfig = {
      31337: signers[0],
      1337: ganacheWallet2,
    }
    
    // deploy the bridge
    bridge = await Bridge.deployBridge(existingTokenBridgeConfig, deploymentConfig);

    // Should be able to retrieve the token address (so we can mint tokens for test scenario)
    webbTokenSrc = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: 31337}))!;
    let webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, signers[0]);
    await webbToken.mintTokens(signers[1].address, '100000000000000000000000');

    webbTokenDest = bridge.tokenAddresses.get(Bridge.createTokenIdString({tokenName: webbTokenName, chainId: 1337}))!;
    webbToken = await MintableToken.tokenFromAddress(webbTokenDest, ganacheWallet2);
    await webbToken.mintTokens(ganacheWallet2.address, '100000000000000000000000');

    // make one deposit so the edge exists
    await bridge.deposit(1337, webbTokenName, '1000000000000000000', signers[1]);
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

    it.only('should withdraw on hardhat from ganache deposit', async () => {
      // Fetch information about the anchor to be updated.
      const signers = await ethers.getSigners();
      const anchorSize = '1000000000000000000';
      console.log(`in the test: ${webbTokenName}`);

      const controlledAnchor2: Anchor = bridge.getAnchor(chainId1, webbTokenName, anchorSize)!;
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(destChainID2);
      const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);
      const webbToken = await MintableToken.tokenFromAddress(webbTokenSrc, ganacheWallet2);
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
      const signers = await ethers.getSigners();
      const anchorSize = '1000000000000000000';

      // Check the balanceOf of the existing tokens.
      const startingBalanceSource = await existingTokenSrc.getBalance(signers[1].address);
      const startingBalanceDest = await existingTokenDest.getBalance(await ganacheWallet2.getAddress());

      // Deposit and withdraw
      const depositNote = await bridge.deposit(chainId1, tokenName, anchorSize, signers[1]);
      await bridge.withdraw(depositNote!, tokenName, anchorSize, signers[1].address, ganacheWallet2.address, ganacheWallet2);

      // Verify the balanceOf existing tokens
      const endingBalanceSource = await existingTokenSrc.getBalance(signers[1].address);
      const endingBalanceDest = await existingTokenDest.getBalance(ganacheWallet2.address);
      assert.equal(startingBalanceSource.sub(anchorSize), endingBalanceSource);
      assert.equal(startingBalanceDest, endingBalanceDest + anchorSize);
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

    it('should update with Anchor interaction', async () => {
      const anchorSize = '1000000000000000000';
      const controlledAnchor1: Anchor = bridge.getAnchor(chainId1, tokenName, anchorSize)!;
      const controlledAnchor2: Anchor = bridge.getAnchor(destChainID2, tokenName, anchorSize)!;
      let edgeIndex = await controlledAnchor2.contract.edgeIndex(chainId1);
      const destAnchorEdge2Before = await controlledAnchor2.contract.edgeList(edgeIndex);

      // Do a deposit on the Anchor directly
      const deposit = await controlledAnchor1.deposit(destChainID2);

      // Call update on the bridge

      // Verify the linkedAnchor is properly updated
      const destAnchorEdge2After = await controlledAnchor2.contract.edgeList(edgeIndex);
      assert.equal(destAnchorEdge2Before.latestLeafIndex.add(1), destAnchorEdge2After.latestLeafIndex);
    })
  });
});