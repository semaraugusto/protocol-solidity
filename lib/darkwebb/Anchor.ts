import { BigNumberish, ethers } from "ethers";
import { Anchor2__factory } from '../../typechain/factories/Anchor2__factory';
import { Anchor2 } from '../../typechain/Anchor2';
import { rbigint, p256 } from "./utils";
import { toFixedHex, toHex } from '../../lib/darkwebb/utils';
import PoseidonHasher from './Poseidon';
import { MerkleTree } from './MerkleTree';

const path = require('path');
const snarkjs = require('snarkjs');
const F = require('circomlib').babyJub.F;
const Scalar = require('ffjavascript').Scalar;

interface AnchorDepositInfo {
  chainID: BigInt,
  secret: BigInt,
  nullifier: BigInt,
  commitment: string,
  nullifierHash: string,
};

export type AnchorDeposit = {
  deposit: AnchorDepositInfo,
  index: number,
  originChainId: number;
};

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods 
class Anchor {
  signer: ethers.Signer;
  contract: Anchor2;
  tree: MerkleTree;
  // hex string of the connected root
  latestSyncedBlock: number;
  circuitZkeyPath: string;
  circuitWASMPath: string;

  // The depositHistory stores leafIndex => information to create proposals (new root)
  depositHistory: Record<number, string>;

  private constructor(
    contract: Anchor2,
    signer: ethers.Signer,
    treeHeight: number,
    circuitZkeyPath?: string,
    circuitWASMPath?: string,
  ) {
    this.signer = signer;
    this.contract = contract;
    this.tree = new MerkleTree('', treeHeight);
    this.latestSyncedBlock = 0;
    this.circuitZkeyPath = circuitZkeyPath || 'test/fixtures/2/circuit_final.zkey';
    this.circuitWASMPath = circuitZkeyPath || 'test/fixtures/2/poseidon_bridge_2.wasm';
    this.depositHistory = {};
  }

  // public static anchorFromAddress(
  //   contract: string,
  //   signer: ethers.Signer,
  // ) {
  //   const anchor = Anchor2__factory.connect(contract, signer);
  //   return new Anchor(anchor, signer);
  // }

  // Deploys an anchor2 contract and sets the signer for deposit and withdraws on this contract.
  public static async createAnchor(
    verifier: string,
    hasher: string,
    denomination: BigNumberish,
    merkleTreeHeight: number,
    token: string,
    bridge: string,
    admin: string,
    handler: string,
    signer: ethers.Signer,
  ) {
    const factory = new Anchor2__factory(signer);
    const anchor2 = await factory.deploy(verifier, hasher, denomination, merkleTreeHeight, token, bridge, admin, handler, {});
    await anchor2.deployed();
    const createdAnchor = new Anchor(anchor2, signer, merkleTreeHeight);
    createdAnchor.latestSyncedBlock = anchor2.deployTransaction.blockNumber!;
    return createdAnchor;
  }

  public static async connect(
    // connect via factory method
    // build up tree by querying provider for logs
    address: string,
    signer: ethers.Signer,
  ) {
    const anchor2 = Anchor2__factory.connect(address, signer);
    const treeHeight = await anchor2.levels();
    const createdAnchor = new Anchor(anchor2, signer, treeHeight);

    return createdAnchor;
  }

  public static generateDeposit(destinationChainId: number, secretBytesLen: number = 31, nullifierBytesLen: number = 31): AnchorDepositInfo {
    const chainID = BigInt(destinationChainId);
    const secret = rbigint(secretBytesLen);
    const nullifier = rbigint(nullifierBytesLen);

    const hasher = new PoseidonHasher();
    const commitment = hasher.hash3([chainID, nullifier, secret]).toString();
    const nullifierHash = hasher.hash(null, nullifier, nullifier);

    const deposit: AnchorDepositInfo = {
      chainID,
      secret,
      nullifier,
      commitment,
      nullifierHash
    };
  
    return deposit
  }

  public static createRootsBytes(rootArray: string[]) {
    let rootsBytes = "0x";
    for (let i = 0; i < rootArray.length; i++) {
      rootsBytes += toFixedHex(rootArray[i]).substr(2);
    }
    return rootsBytes; // root byte string (32 * array.length bytes) 
  };

  public static async groth16ExportSolidityCallData(proof: any, pub: any) {
    let inputs = "";
    for (let i = 0; i < pub.length; i++) {
      if (inputs != "") inputs = inputs + ",";
      inputs = inputs + p256(pub[i]);
    }
  
    let S;
    S=`[${p256(proof.pi_a[0])}, ${p256(proof.pi_a[1])}],` +
      `[[${p256(proof.pi_b[0][1])}, ${p256(proof.pi_b[0][0])}],[${p256(proof.pi_b[1][1])}, ${p256(proof.pi_b[1][0])}]],` +
      `[${p256(proof.pi_c[0])}, ${p256(proof.pi_c[1])}],` +
      `[${inputs}]`;
  
    return S;
  }
  
  public static async generateWithdrawProofCallData(proof: any, publicSignals: any) {
    const result = await Anchor.groth16ExportSolidityCallData(proof, publicSignals);
    const fullProof = JSON.parse("[" + result + "]");
    const pi_a = fullProof[0];
    const pi_b = fullProof[1];
    const pi_c = fullProof[2];

    let proofEncoded = [
      pi_a[0],
      pi_a[1],
      pi_b[0][0],
      pi_b[0][1],
      pi_b[1][0],
      pi_b[1][1],
      pi_c[0],
      pi_c[1],
    ]
    .map(elt => elt.substr(2))
    .join('');

    return proofEncoded;
  }

  // public static async createWitness(data: any): Promise<{type: string, data: Uint8Array}> {
  //   const wtns: {type: string, data: Uint8Array} = {type: "mem", data: new Uint8Array()};
  //   await snarkjs.wtns.calculate(data, path.join(
  //     "test",
  //     "fixtures",
  //     "poseidon_bridge_2.wasm"
  //   ), wtns);
  //   return wtns;
  // }

  // 
  public async createResourceID(): Promise<string> {
    const chainId = await this.signer.getChainId();
    return ethers.utils.hexZeroPad(this.contract.address + toHex(chainId, 4).substr(2), 32);
  }

  public async setHandler(handlerAddress: string) {
    const tx = await this.contract.setHandler(handlerAddress);
    await tx.wait();
  }

  public async setBridge(bridgeAddress: string) {
    const tx = await this.contract.setBridge(bridgeAddress);
    await tx.wait();
  }

  public async setSigner(newSigner: ethers.Signer) {
    const currentChainId = await this.signer.getChainId();
    const newChainId = await newSigner.getChainId();

    if (currentChainId === newChainId) {
      this.signer = newSigner;
      this.contract = this.contract.connect(newSigner);
      return true;
    }
    return false;
  }

  // Proposal data is used to update linkedAnchors via bridge proposals 
  // on other chains with this anchor's state
  public async getProposalData(leafIndex?: number): Promise<string> {

    // If no leaf index passed in, set it to the most recent one.
    if (!leafIndex) {
      leafIndex = this.tree.number_of_elements() - 1;
    }

    const chainID = await this.signer.getChainId();
    const merkleRoot = this.depositHistory[leafIndex];

    return '0x' +
      toHex(chainID, 32).substr(2) + 
      toHex(leafIndex, 32).substr(2) + 
      toHex(merkleRoot, 32).substr(2);
  }

  // Makes a deposit into the contract and return the parameters and index of deposit
  public async deposit(destinationChainId?: number): Promise<AnchorDeposit> {
    const originChainId = await this.signer.getChainId();
    const destChainId = (destinationChainId) ? destinationChainId : originChainId;
    const deposit = Anchor.generateDeposit(destChainId);
    
    const tx = await this.contract.deposit(toFixedHex(deposit.commitment), { gasLimit: '0x5B8D80' });
    const receipt = await tx.wait();

    // decode the event
    const filter = this.contract.filters.Deposit(toFixedHex(deposit.commitment));
    const events = await this.contract.queryFilter(filter, receipt.blockNumber);

    const root = await this.contract.getLastRoot();
    console.log('root: ', root)
    const index = events[0].args.leafIndex;

    this.depositHistory[index] = root;
    await this.tree.insert(deposit.commitment);

    return { deposit, index, originChainId };
  }

  // sync the local tree with the tree on chain.
  // Start syncing from the given block number, otherwise zero.
  public async update(blockNumber?: number) {
    const filter = this.contract.filters.Deposit();
    const currentBlockNumber = await this.signer.provider!.getBlockNumber();
    const events = await this.contract.queryFilter(filter, blockNumber || 0);
    const commitments = events.map((event) => event.args.commitment);
    this.tree.batch_insert(commitments);

    this.latestSyncedBlock = currentBlockNumber;
  }

  public generateWitnessInput(
    deposit: AnchorDepositInfo,
    originChain: number,
    refreshCommitment: BigInt,
    recipient: BigInt,
    relayer: BigInt,
    fee: BigInt,
    refund: BigInt,
    roots: string[],
    pathElements: any[],
    pathIndices: any[],
  ): any {
    const { chainID, nullifierHash, nullifier, secret } = deposit;
    let rootDiffIndex = (chainID != BigInt(originChain)) ? 1 : 0;
    console.log(`root diff index: ${rootDiffIndex}`);
    return {
      // public
      nullifierHash, refreshCommitment, recipient, relayer, fee, refund, chainID, roots,
      // private
      nullifier, secret, pathElements, pathIndices, diffs: roots.map(r => {
        return F.sub(
          Scalar.fromString(`${r}`),
          Scalar.fromString(`${roots[rootDiffIndex]}`),
        ).toString();
      }),
    };
  }

  public async withdraw(
    deposit: AnchorDepositInfo,
    index: number,
    recipient: string,
    relayer: string,
    fee: bigint,
    refreshCommitment: bigint,
  ) {
    // first, check if the merkle root is known on chain - if not, then update
    const isKnownRoot = await this.contract.isKnownRoot(toFixedHex(await this.tree.get_root()));
    if (!isKnownRoot) {
      await this.update(this.latestSyncedBlock);
    }

    const { merkleRoot, pathElements, pathIndices } = await this.tree.path(index);
    const chainId = await this.signer.getChainId();

    console.log('pathIndices: ', pathIndices);
    console.log('merkle root from withdraw: ', merkleRoot);

    const input = this.generateWitnessInput(
      deposit,
      chainId,
      refreshCommitment,
      BigInt(recipient),
      BigInt(relayer),
      BigInt(fee),
      BigInt(0),
      [merkleRoot as string, '0'],
      pathElements,
      pathIndices,
    );

    const createWitness = async (data: any) => {
      const wtns = {type: "mem"};
      await snarkjs.wtns.calculate(data, path.join('.', this.circuitWASMPath), wtns);
      return wtns;
    }

    const wtns = await createWitness(input);

    let res = await snarkjs.groth16.prove(this.circuitZkeyPath, wtns);
    let proof = res.proof;
    let publicSignals = res.publicSignals;

    const vKey = await snarkjs.zKey.exportVerificationKey(this.circuitZkeyPath);
    res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    console.log('public signals: ', publicSignals);

    let proofEncoded = await Anchor.generateWithdrawProofCallData(proof, publicSignals);

    const args = [
      Anchor.createRootsBytes(input.roots),
      toFixedHex(input.nullifierHash),
      toFixedHex(input.refreshCommitment, 32),
      toFixedHex(input.recipient, 20),
      toFixedHex(input.relayer, 20),
      toFixedHex(input.fee),
      toFixedHex(input.refund),
    ];

    console.log('args from normal withdraw', args);

    //@ts-ignore
    let tx = await this.contract.withdraw(`0x${proofEncoded}`, ...args, { gasLimit: '0x5B8D80' });
    const receipt = await tx.wait();

    const filter = this.contract.filters.Withdrawal(null, null, null, null);
    const events = await this.contract.queryFilter(filter, receipt.blockHash);
    return events[0];
  }

  // A bridgedWithdraw needs the merkle proof to be generated from an anchor other than this one,
  public async bridgedWithdraw(
    deposit: AnchorDeposit,
    merkleProof: any,
    recipient: string,
    relayer: string,
    fee: string,
    refund: string,
    refreshCommitment?: string,
  ) {
    const { pathElements, pathIndices, merkleRoot } = merkleProof;
    console.log('pathIndices: ', pathIndices);
    console.log('merkle root: ', merkleRoot);
    const isKnownNeighborRoot = await this.contract.isKnownNeighborRoot(deposit.originChainId, toFixedHex(merkleRoot));
    if (!isKnownNeighborRoot) {
      throw new Error("Neighbor root not found");
    }
    refreshCommitment = (refreshCommitment) ? refreshCommitment : '0';

    const lastRoot = await this.tree.get_root();
    console.log('lastRoot: ', lastRoot);

    const input = this.generateWitnessInput(
      deposit.deposit,
      deposit.originChainId,
      BigInt(refreshCommitment),
      BigInt(recipient),
      BigInt(relayer),
      BigInt(fee),
      BigInt(refund),
      [lastRoot as string, merkleRoot as string],
      pathElements,
      pathIndices,
    );

    const createWitness = async (data: any) => {
      const wtns = {type: "mem"};
      await snarkjs.wtns.calculate(data, path.join('.', this.circuitWASMPath), wtns);
      return wtns;
    }

    const wtns = await createWitness(input);

    let res = await snarkjs.groth16.prove(this.circuitZkeyPath, wtns);
    let proof = res.proof;
    let publicSignals = res.publicSignals;

    console.log('public signals: ', publicSignals);

    const vKey = await snarkjs.zKey.exportVerificationKey(this.circuitZkeyPath);
    res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    let proofEncoded = await Anchor.generateWithdrawProofCallData(proof, publicSignals);

    console.log('generated withdraw proof calldata');

    const args = [
      Anchor.createRootsBytes(input.roots),
      toFixedHex(input.nullifierHash),
      toFixedHex(input.refreshCommitment, 32),
      toFixedHex(input.recipient, 20),
      toFixedHex(input.relayer, 20),
      toFixedHex(input.fee),
      toFixedHex(input.refund),
    ];

    console.log('args from bridgeWithdraw', args);

    //@ts-ignore
    let tx = await this.contract.withdraw(`0x${proofEncoded}`, ...args, { gasLimit: '0x5B8D80' });
    const receipt = await tx.wait();

    const filter = this.contract.filters.Withdrawal(null, null, relayer, null);
    const events = await this.contract.queryFilter(filter, receipt.blockHash);
    return events[0];
  }
}

export default Anchor;
