pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/sha256/sha256.circom";

// Computes a SHA256 hash of all inputs packed into a byte array
// Field elements are padded to 256 bits with zeroes
template TreeUpdateArgsHasher(nLeaves, nIns, nOuts, length) {
    signal input publicAmount;
    signal input extDataHash;
    signal input inputNullifier[nIns];
    signal input outputCommitment[nOuts];
    signal input chainID;
    signal input roots[length];
    signal output out;

    component bitsPublicAmount = Num2Bits_strict();
    component bitsExtDataHash = Num2Bits_strict();
    component bitsInputNullifier[nIns];
    component bitsOutputCommitment[nOuts];
    component bitsRoots[length];

    bitsPublicAmount.in <== publicAmount;
    bitsExtDataHash.in <== extDataHash;

    var index = 0;
    
    // header = sizeof(publicAmount) + sizeof(extDataHash) + ... + sizeof(roots)
    var bitSize = 256 + 256 + 256*nIns + 256*nOuts + 256*length;
    /* var header = 256 + 256 + 256*nIns + 256*nOuts; */
    component hasher = Sha256(bitSize);

    hasher.in[index] <== 0;
    index = index + 1;
    hasher.in[index] <== 0;
    index = index + 1;
    for(var i = 0; i < 254; i++) {
        hasher.in[index] <== bitsPublicAmount.out[253 - i];
        index = index + 1;
    }
    hasher.in[index] <== 0;
    index = index + 1;
    hasher.in[index] <== 0;
    index = index + 1;
    for(var i = 0; i < 254; i++) {
        hasher.in[index] <== bitsExtDataHash.out[253 - i];
        index = index + 1;
    }
    for(var i = 0; i < nIns; i++) {
        bitsInputNullifier[i] = Num2Bits_strict();
        bitsInputNullifier[i].in <== inputNullifier[i];
        hasher.in[index] <== 0;
        index = index + 1;
        hasher.in[index] <== 0;
        index = index + 1;
        for(var b = 0; b < 254; b++) {
            hasher.in[index] <== bitsInputNullifier[i].out[253 - b];
            index = index + 1;
        }
    }
    for(var i = 0; i < nOuts; i++) {
        bitsOutputCommitment[i] = Num2Bits_strict();
        bitsOutputCommitment[i].in <== outputCommitment[i];
        hasher.in[index] <== 0;
        index = index + 1;
        hasher.in[index] <== 0;
        index = index + 1;
        for(var b = 0; b < 254; b++) {
            hasher.in[index] <== bitsOutputCommitment[i].out[253 - b];
            index = index + 1;
        }
    }
    for(var i = 0; i < length; i++) {
        bitsRoots[i] = Num2Bits_strict();
        bitsRoots[i].in <== roots[i];
        hasher.in[index] <== 0;
        index = index + 1;
        hasher.in[index] <== 0;
        index = index + 1;
        for(var b = 0; b < 254; b++) {
            hasher.in[index] <== bitsRoots[i].out[253 - b];
            index = index + 1;
        }
    }
    component b2n = Bits2Num(256);
    for (var i = 0; i < 256; i++) {
        b2n.in[i] <== hasher.out[255 - i];
    }

    out <== b2n.out;
}

