import { BigNumber, BigNumberish, ethers } from "ethers";
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

// This convenience wrapper class is used in tests -
// It represents a deployed contract throughout its life (e.g. maintains merkle tree state)
// Functionality relevant to anchors in general (proving, verifying) is implemented in static methods
// Functionality relevant to a particular anchor deployment (deposit, withdraw) is implemented in instance methods 
class Anchor {
  signer: ethers.Signer;
  contract: Anchor2;
  tree: MerkleTree;
  // hex string of the connected root
  linkedRoot: string;
  latestSyncedBlock: number;

  // The depositHistory stores leafIndex => information to create proposals (new root)
  depositHistory: Record<number, string>;

  private constructor(
    contract: Anchor2,
    signer: ethers.Signer,
    treeHeight: number,
  ) {
    this.signer = signer;
    this.contract = contract;
    this.tree = new MerkleTree('', treeHeight);
    this.linkedRoot = "0x0";
    this.latestSyncedBlock = 0;
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

  public static generateDeposit(destinationChainID: number, secretBytesLen: number = 31, nullifierBytesLen: number = 31): AnchorDepositInfo {
    let chainID = BigInt(destinationChainID);
    let secret = rbigint(secretBytesLen);
    let nullifier = rbigint(nullifierBytesLen);

    const hasher = new PoseidonHasher();
    let commitment = hasher.hash3([chainID, nullifier, secret]).toString();
    let nullifierHash = hasher.hash(null, nullifier, nullifier);

    let deposit: AnchorDepositInfo = {
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
    return toHex(this.contract.address + toHex((await this.signer.getChainId()).toString(), 4).substr(2), 32);
  }

  public async setHandler(handlerAddress: string) {
    const tx = await this.contract.setHandler(handlerAddress);
    await tx.wait();
  }

  public async setBridge(bridgeAddress: string) {
    const tx = await this.contract.setBridge(bridgeAddress);
    await tx.wait();
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
      toHex(chainID.toString(), 32).substr(2) + 
      toHex(leafIndex.toString(), 32).substr(2) + 
      toHex(merkleRoot, 32).substr(2);
  }

  // Makes a deposit into the contract and return the parameters and index of deposit
  public async deposit(): Promise<{deposit: AnchorDepositInfo, index: number}> {

    const chainID = await this.signer.getChainId();
    const deposit = Anchor.generateDeposit(chainID);
    
    const tx = await this.contract.deposit(toFixedHex(deposit.commitment), { gasLimit: '0x5B8D80' });
    const receipt = await tx.wait();

    // decode the event
    const filter = this.contract.filters.Deposit(toFixedHex(deposit.commitment));
    const events = await this.contract.queryFilter(filter, receipt.blockNumber);

    const root = await this.contract.getLastRoot();
    const index = events[0].args.leafIndex;

    this.depositHistory[index] = root;
    console.log(this.depositHistory);

    return { deposit, index };
  }

  // sync the local tree with the tree on chain.
  // Start syncing at the given block number, otherwise zero.
  public async update(blockNumber?: number) {
    const filter = this.contract.filters.Deposit();
    const currentBlockNumber = await this.signer.provider!.getBlockNumber();
    const events = await this.contract.queryFilter(filter, blockNumber || 0);
    const commitments = events.map((event) => event.args.commitment);
    this.tree.batch_insert(commitments);

    this.latestSyncedBlock = currentBlockNumber;
  }

  public async withdraw(
    deposit: AnchorDepositInfo,
    index: number,
    recipient: string,
    relayer: string,
    fee: bigint,
  ) {
    // first, check if the merkle root is known on chain - if not, then update
    const isKnownRoot = await this.contract.isKnownRoot(toFixedHex(await this.tree.get_root()));
    
    if (!isKnownRoot) {
      await this.update(this.latestSyncedBlock);
    }

    const { root, pathElements, pathIndex } = await this.tree.path(index);

    const input = {
      // public
      nullifierHash: deposit.nullifierHash,
      recipient: recipient,
      relayer,
      fee,
      refund: BigInt(0),
      chainID: deposit.chainID,
      roots: [root as string, '0'],
      // private
      nullifier: deposit.nullifier,
      secret: deposit.secret,
      pathElements: pathElements,
      pathIndices: pathIndex,
      diffs: [root, 0].map(r => {
        return F.sub(
          Scalar.fromString(`${r}`),
          Scalar.fromString(`${root}`),
        ).toString();
      }),
    };

    const createWitness = async (data: any) => {
      const wtns = {type: "mem"};
      await snarkjs.wtns.calculate(data, path.join(
        "test",
        "fixtures",
        "poseidon_bridge_2.wasm"
      ), wtns);
      return wtns;
    }

    const wtns = await createWitness(input);

    let res = await snarkjs.groth16.prove('test/fixtures/circuit_final.zkey', wtns);
    let proof = res.proof;
    let publicSignals = res.publicSignals;

    const args = [
      Anchor.createRootsBytes(input.roots),
      toFixedHex(input.nullifierHash),
      toFixedHex(input.recipient, 20),
      toFixedHex(input.relayer, 20),
      toFixedHex(input.fee),
      toFixedHex(input.refund),
    ]

    const vKey = await snarkjs.zKey.exportVerificationKey('test/fixtures/circuit_final.zkey');
    res = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    let proofEncoded = await Anchor.generateWithdrawProofCallData(proof, publicSignals);

    //@ts-ignore
    let tx = await this.contract.withdraw(`0x${proofEncoded}`, ...args, { gasLimit: '0x5B8D80' });
    const receipt = await tx.wait();

    const filter = this.contract.filters.Withdrawal(null, null, relayer, null);
    const events = await this.contract.queryFilter(filter, receipt.blockHash);
    return events[0];
  }
}

export default Anchor;
