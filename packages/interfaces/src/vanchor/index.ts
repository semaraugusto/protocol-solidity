import { BigNumberish, BigNumber } from 'ethers';
import { Keypair } from '@webb-tools/utils';

export interface IMerkleProofData {
  pathElements: BigNumberish[],
  pathIndex: BigNumberish,
  merkleRoot: BigNumberish;
}

export interface IUTXOInput {
  chainId: BigNumber;
  amount: BigNumber;
  keypair: Keypair;
  blinding: BigNumber;
  index: number;
}

export interface IVariableAnchorPublicInputs {
  proof: string;
  roots: string;
  inputNullifiers: string[];
  outputCommitments: [string, string];
  publicAmount: string;
  extDataHash: string;
}

export interface IExtData {
  recipient: string;
  extAmount: string;
  relayer: string;
  fee: string;
  encryptedOutput1: string;
  encryptedOutput2: string;
}

export interface IWitnessInput {
  input: {
    roots: BigNumberish[],
    diffs: BigNumberish[][],
    chainID: BigNumberish,
    inputNullifier: BigNumberish[],
    outputCommitment: BigNumberish[],
    publicAmount: BigNumberish,
    extDataHash: BigNumberish,

    // data for 2 transaction inputs
    inAmount: BigNumberish[],
    inPrivateKey: string[],
    inBlinding: BigNumberish[],
    inPathIndices: BigNumberish[],
    inPathElements: BigNumberish[][],

    // data for 2 transaction outputs
    outChainID: BigNumberish[],
    outAmount: BigNumberish[],
    outBlinding: BigNumberish[],
    outPubkey: BigNumberish[],
  };
  extData: IExtData
}