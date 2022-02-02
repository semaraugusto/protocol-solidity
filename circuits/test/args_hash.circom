pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/poseidon.circom";
include "../set/membership.circom";
include "../vanchor/manyMerkleProof.circom";
include "../vanchor/keypair.circom";
include "../TreeUpdateArgsHasher.circom";

/*
UTXO structure:
{
    chainID, // destination chain identifier
    amount,
    pubkey,
    blinding, // random number
}

commitment = hash(chainID, amount, pubKey, blinding)
nullifier = hash(commitment, merklePath, sign(privKey, commitment, merklePath))
*/

// Universal JoinSplit transaction with nIns inputs and 2 outputs (2-2 & 16-2)
template TestHashArgs(levels, nIns, nOuts, zeroLeaf, length) {
    // extAmount = external amount used for deposits and withdrawals
    // correct extAmount range is enforced on the smart contract
    // publicAmount = extAmount - fee
    signal input argsHash; // Arguments hash
    signal input publicAmount;
    signal input extDataHash; // arbitrary

    // data for transaction inputs
    signal input inputNullifier[nIns];
    signal input inAmount[nIns];
    signal input inPrivateKey[nIns];
    signal input inBlinding[nIns];
    signal input inPathIndices[nIns];
    signal input inPathElements[nIns][levels];

    // data for transaction outputs
    signal input outputCommitment[nOuts];
    signal input outChainID[nOuts];
    signal input outAmount[nOuts];
    signal input outPubkey[nOuts];
    signal input outBlinding[nOuts];

    // roots and diffs for interoperability, one-of-many merkle membership proof
    signal input chainID;
    signal input roots[length];
    signal input diffs[nIns][length];

    component inKeypair[nIns];
    component inSignature[nIns];
    component inCommitmentHasher[nIns];
    component inNullifierHasher[nIns];
    component inTree[nIns];
    component inCheckRoot[nIns];
    var sumIns = 0;

    var nLeaves = 1 << levels;
    component argsHasher = TreeUpdateArgsHasher(nLeaves, nIns, nOuts, length);
    argsHasher.publicAmount <== publicAmount;
    argsHasher.extDataHash <== extDataHash;
    for(var i = 0; i < nIns; i++) {
        argsHasher.inputNullifier[i] <== inputNullifier[i];
    }
    for(var i = 0; i < nOuts; i++) {
        argsHasher.outputCommitment[i] <== outputCommitment[i];
    }
    argsHasher.chainID <== chainID;
    for(var i = 0; i < length; i++) {
        argsHasher.roots[i] <== roots[i];
    }
    argsHash === argsHasher.out;

}
// zeroLeaf = Poseidon(zero, zero)
// default `zero` value is keccak256("tornado") % FIELD_SIZE = 21663839004416932945382355908790599225266501822907911457504978515578255421292
component main {public [publicAmount, extDataHash, inputNullifier, outputCommitment, chainID, roots]} = TestHashArgs(5, 2, 2, 11850551329423159860688778991827824730037759162201783566284850822760196767874, 2);
