import { ethers } from "hardhat";
import Bridge, { BridgeInput, DeployerConfig } from '../../lib/darkwebb/Bridge';

const TruffleAssert = require('truffle-assertions');
import { toFixedHex, toHex } from '../../lib/darkwebb/utils';
const { toBN } = require('web3-utils')
const assert = require('assert');

const fs = require('fs')
const path = require('path');
const { NATIVE_AMOUNT } = process.env
const snarkjs = require('snarkjs');
const BN = require('bn.js');
const F = require('circomlib').babyJub.F;
const Scalar = require('ffjavascript').Scalar;

describe('E2E LinkableAnchors - Cross chain withdraw using historical root should work', async () => {
  const relayerThreshold = 1;
  const originChainID = 31337;
  let relayer1Address: string;
  let operatorAddress: string;
  let senderAddress: string;
  const fee = BigInt((new BN(`${NATIVE_AMOUNT}`).shrn(1)).toString()) || BigInt((new BN(`${1e17}`)).toString());
  const refund = BigInt((new BN('0')).toString());
  const recipient = "0x1111111111111111111111111111111111111111";

  let bridge: Bridge;

  // config for ganache-cli -m "congress island collect purity dentist team gas unlock nuclear pig combine sight"
  let ganacheProvider = new ethers.providers.JsonRpcProvider('http://localhost:8545');
  let ganacheWallet: ethers.Signer = new ethers.Wallet('c0d375903fd6f6ad3edafc2c5428900c0757ce1da10e5dd864fe387b32b91d7e', ganacheProvider);
  const destChainID = 8545;

  beforeEach(async () => {
    // setup the addresses for the tests
    const signers = await ethers.getSigners();
    senderAddress = signers[0].address;
    operatorAddress = signers[1].address;
    relayer1Address = signers[2].address;

    // setup the input for the bridge
    const input: BridgeInput = {
      anchorInputs: [{
        asset: {
          assetName: 'webbToken',
          assetSymbol: 'WEBB',
        },
        anchorSizes: ['10000000000', '10000000000000000000'],
      }],
      chainIDs: [originChainID, destChainID],
    };

    // setup the deployers (admins) for the bridge
    const deployers: DeployerConfig = {
      [originChainID]: signers[0],
      [destChainID]: ganacheWallet,
    };

    // deploy the bridge:
    //    - deploy all relevant contracts
    //    - deploy 
    bridge = await Bridge.deploy(input, deployers);
  });

  it('[sanity] dest chain bridge configured with threshold and relayers', async () => {
    const destBridgeSide = await bridge.getBridgeSide(destChainID);

    assert.equal(await destBridgeSide.contract.isRelayer(ganacheWallet.address));
    
    assert.equal(await destBridgeSide.contract._chainID(), destChainID)
    assert.equal(await destBridgeSide.contract._relayerThreshold(), relayerThreshold)
    assert.equal((await destBridgeSide.contract._totalRelayers()).toString(), '1')
  })

  it('withdrawing across bridge after two deposits should work', async () => {
    /*
    * sender deposits on origin chain anchor
    */
    // minting Tokens
    await originChainToken.mint(sender, initialTokenMintAmount);
    //increase allowance
    originChainToken.approve(OriginChainAnchorInstance.address, initialTokenMintAmount, { from: sender });
    // deposit on both chains and define nonces based on events emmited
    let firstOriginDeposit = helpers.generateDeposit(destChainID);
    let { logs } = await OriginChainAnchorInstance.deposit(
      helpers.toFixedHex(firstOriginDeposit.commitment), {from: sender});
    originUpdateNonce = logs[0].args.leafIndex;
    firstWithdrawlMerkleRoot = await OriginChainAnchorInstance.getLastRoot();
    // create correct update proposal data for the deposit on origin chain
    originUpdateData = helpers.createUpdateProposalData(originChainID, originBlockHeight, firstWithdrawlMerkleRoot);
    originUpdateDataHash = Ethers.utils.keccak256(DestAnchorHandlerInstance.address + originUpdateData.substr(2));

    // deposit on origin chain leads to update addEdge proposal on dest chain
    // relayer1 creates the deposit proposal for the deposit that occured in the before each loop
    await TruffleAssert.passes(DestBridgeInstance.voteProposal(
      originChainID,
      originUpdateNonce,
      resourceID,
      originUpdateDataHash,
      { from: relayer1Address }
    ));
    // relayer1 will execute the deposit proposal
    await TruffleAssert.passes(DestBridgeInstance.executeProposal(
      originChainID,
      originUpdateNonce,
      originUpdateData,
      resourceID,
      { from: relayer1Address }
    ));
    /*
    *  sender generate proof
    */
    // insert two commitments into the tree
    await tree.insert(firstOriginDeposit.commitment);
  
    let { root, path_elements, path_index } = await tree.path(0);

    const destNativeRoot = await DestChainAnchorInstance.getLastRoot();
    const firstWithdrawalNeighborRoots = await DestChainAnchorInstance.getLatestNeighborRoots();
    let input = {
      // public
      nullifierHash: firstOriginDeposit.nullifierHash,
      recipient,
      relayer: operator,
      fee,
      refund,
      chainID: firstOriginDeposit.chainID,
      roots: [destNativeRoot, ...firstWithdrawalNeighborRoots],
      // private
      nullifier: firstOriginDeposit.nullifier,
      secret: firstOriginDeposit.secret,
      pathElements: path_elements,
      pathIndices: path_index,
      diffs: [destNativeRoot, firstWithdrawalNeighborRoots[0]].map(r => {
        return F.sub(
          Scalar.fromString(`${r}`),
          Scalar.fromString(`${firstWithdrawalNeighborRoots[0]}`),
        ).toString();
      }),
    };

    let wtns = await createWitness(input);

    let res = await snarkjs.groth16.prove('test/fixtures/circuit_final.zkey', wtns);
    proof = res.proof;
    publicSignals = res.publicSignals;

    // Uncomment to measure gas usage
    // gas = await anchor.withdraw.estimateGas(proof, publicSignals, { from: relayer, gasPrice: '0' })
    // console.log('withdraw gas:', gas)
    let args = [
      helpers.createRootsBytes(input.roots),
      helpers.toFixedHex(input.nullifierHash),
      helpers.toFixedHex(input.recipient, 20),
      helpers.toFixedHex(input.relayer, 20),
      helpers.toFixedHex(input.fee),
      helpers.toFixedHex(input.refund),
    ];

    let proofEncoded = await helpers.generateWithdrawProofCallData(proof, publicSignals);
    /*
    *  sender's second deposit on origin chain anchor
    */
    // deposit on origin chain and define nonce based on events emmited
    originDeposit = helpers.generateDeposit(destChainID, 30);
    ({ logs } = await OriginChainAnchorInstance.deposit(helpers.toFixedHex(originDeposit.commitment), {from: sender}));
    originUpdateNonce = logs[0].args.leafIndex;
    secondWithdrawalMerkleRoot = await OriginChainAnchorInstance.getLastRoot();
    // create correct update proposal data for the deposit on origin chain
    originUpdateData = helpers.createUpdateProposalData(originChainID, originBlockHeight + 10, secondWithdrawalMerkleRoot);
    originUpdateDataHash = Ethers.utils.keccak256(DestAnchorHandlerInstance.address + originUpdateData.substr(2));
    /*
    * Relayers vote on dest chain
    */
    // a second deposit on origin chain leads to update edge proposal on dest chain
    // relayer1 creates the deposit proposal for the deposit that occured in the before each loop
    await TruffleAssert.passes(DestBridgeInstance.voteProposal(
      originChainID,
      originUpdateNonce,
      resourceID,
      originUpdateDataHash,
      { from: relayer1Address }
    ));
    // relayer1 will execute the deposit proposal
    await TruffleAssert.passes(DestBridgeInstance.executeProposal(
      originChainID,
      originUpdateNonce,
      originUpdateData,
      resourceID,
      { from: relayer1Address }
    ));

    // check initial balances before withdrawal
    let balanceOperatorBefore = await destChainToken.balanceOf(operator);
    let balanceReceiverBefore = await destChainToken.balanceOf(helpers.toFixedHex(recipient, 20));
    /*
    *  sender withdraws using first commitment
    */
    // mint to anchor and track balance
    await destChainToken.mint(DestChainAnchorInstance.address, initialTokenMintAmount);
    let balanceDestAnchorAfterDeposits = await destChainToken.balanceOf(DestChainAnchorInstance.address);
    // withdraw
    ({ logs } = await DestChainAnchorInstance.withdraw
      (`0x${proofEncoded}`, ...args, { from: input.relayer, gasPrice: '0' }));

    let balanceDestAnchorAfter = await destChainToken.balanceOf(DestChainAnchorInstance.address);
    let balanceOperatorAfter = await destChainToken.balanceOf(input.relayer);
    let balanceReceiverAfter = await destChainToken.balanceOf(helpers.toFixedHex(recipient, 20));
    const feeBN = toBN(fee.toString())
    assert.strictEqual(balanceDestAnchorAfter.toString(), balanceDestAnchorAfterDeposits.sub(toBN(tokenDenomination)).toString());
    assert.strictEqual(balanceOperatorAfter.toString(), balanceOperatorBefore.add(feeBN).toString());
    assert.strictEqual(balanceReceiverAfter.toString(), balanceReceiverBefore.add(toBN(tokenDenomination)).sub(feeBN).toString());
    isSpent = await DestChainAnchorInstance.isSpent(helpers.toFixedHex(input.nullifierHash));
    assert(isSpent);

    /*
    *  generate proof for second deposit
    */
    // insert second deposit in tree and get path for withdrawal proof
    await tree.insert(originDeposit.commitment);
    ({ root, path_elements, path_index } = await tree.path(1));
    const secondWithdrawalNeighborRoots = await DestChainAnchorInstance.getLatestNeighborRoots();
    input = {
      // public
      nullifierHash: originDeposit.nullifierHash,
      recipient,
      relayer: operator,
      fee,
      refund,
      chainID: originDeposit.chainID,
      roots: [destNativeRoot, ...secondWithdrawalNeighborRoots],
      // private
      nullifier: originDeposit.nullifier,
      secret: originDeposit.secret,
      pathElements: path_elements,
      pathIndices: path_index,
      diffs: [destNativeRoot, secondWithdrawalNeighborRoots[0]].map(r => {
        return F.sub(
          Scalar.fromString(`${r}`),
          Scalar.fromString(`${secondWithdrawalNeighborRoots[0]}`),
        ).toString();
      }),
    };

    wtns = await createWitness(input);

    res = await snarkjs.groth16.prove('test/fixtures/circuit_final.zkey', wtns);
    proof = res.proof;
    publicSignals = res.publicSignals;
    vKey = await snarkjs.zKey.exportVerificationKey('test/fixtures/circuit_final.zkey');
    res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    assert.strictEqual(res, true);

    args = [
      helpers.createRootsBytes(input.roots),
      helpers.toFixedHex(input.nullifierHash),
      helpers.toFixedHex(input.recipient, 20),
      helpers.toFixedHex(input.relayer, 20),
      helpers.toFixedHex(input.fee),
      helpers.toFixedHex(input.refund),
    ];

    proofEncoded = await helpers.generateWithdrawProofCallData(proof, publicSignals);
    /*
    *  create 30 new deposits on chain so history wraps around and forgets second deposit
    */
    let newBlockHeight = originBlockHeight + 100;
    for (var i = 0; i < 30; i++) {
      // deposit on origin chain and define nonce based on events emmited
      originDeposit = helpers.generateDeposit(destChainID, i);
      ({ logs } = await OriginChainAnchorInstance.deposit(helpers.toFixedHex(originDeposit.commitment), {from: sender}));
      originUpdateNonce = logs[0].args.leafIndex;
      originMerkleRoot = await OriginChainAnchorInstance.getLastRoot();
      // create correct update proposal data for the deposit on origin chain
      originUpdateData = helpers.createUpdateProposalData(originChainID, newBlockHeight + i, originMerkleRoot);
      originUpdateDataHash = Ethers.utils.keccak256(DestAnchorHandlerInstance.address + originUpdateData.substr(2));
      /*
      * Relayers vote on dest chain
      */
      // relayer1 creates the deposit proposal for the deposit that occured in the before each loop
      await TruffleAssert.passes(DestBridgeInstance.voteProposal(
        originChainID,
        originUpdateNonce,
        resourceID,
        originUpdateDataHash,
        { from: relayer1Address }
      ));
      // relayer1 will execute the deposit proposal
      await TruffleAssert.passes(DestBridgeInstance.executeProposal(
        originChainID,
        originUpdateNonce,
        originUpdateData,
        resourceID,
        { from: relayer1Address }
      ));
    }

    // withdraw should revert as historical root does not exist
    await TruffleAssert.reverts(DestChainAnchorInstance.withdraw
      (`0x${proofEncoded}`, ...args, { from: input.relayer, gasPrice: '0' }),
      'Neighbor root not found');
  }).timeout(0);      
})
