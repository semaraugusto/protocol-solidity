pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/bitify.circom";
include "../../node_modules/circomlib/circuits/sha256/sha256.circom";

// Computes a SHA256 hash of all inputs packed into a byte array
// Field elements are padded to 256 bits with zeroes
template ShaHasher(nArgs) {
    signal input in[nArgs];
    signal output out;
    component bitsIn[nArgs];

    var index = 0;
    var bitsize = 256*nArgs;
    component hasher = Sha256(bitsize);

    for(var n = 0; n < nArgs; n++) {
        bitsIn[n] = Num2Bits_strict();
        bitsIn[n].in <== in[n];
        hasher.in[index] <== 0;
        index = index + 1;
        hasher.in[index] <== 0;
        index = index + 1;
        for(var i = 0; i < 254; i++) {
            hasher.in[index] <== bitsIn[n].out[253 - i];
            index = index + 1;
        }
    }

    component b2n = Bits2Num(256);
    for (var i = 0; i < 256; i++) {
        b2n.in[i] <== hasher.out[255 - i];
    }
   
    out <== b2n.out;
}
