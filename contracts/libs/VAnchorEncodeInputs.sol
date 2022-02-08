// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

library VAnchorEncodeInputs {
  bytes2 public constant EVM_CHAIN_ID_TYPE = 0x0100;
  uint256 public constant SNARK_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

  struct Proof {
    bytes proof;
    bytes roots;
    bytes32[] inputNullifiers;
    bytes32[2] outputCommitments;
    uint256 publicAmount;
    bytes32 extDataHash;
  }

  function getChainId() public view returns (uint) {
    uint chainId;
    assembly { chainId := chainid() }
    return chainId;
  }

  function getChainIdType() public view returns (uint48) {
    // The chain ID and type pair is 6 bytes in length
    // The first 2 bytes are reserved for the chain type.
    // The last 4 bytes are reserved for a u32 (uint32) chain ID.
    bytes4 chainID = bytes4(uint32(getChainId()));
    bytes2 chainType = EVM_CHAIN_ID_TYPE;
    // We encode the chain ID and type pair into packed bytes which
    // should be 6 bytes using the encode packed method. We will
    // cast this as a bytes32 in order to encode as a uint256 for zkp verification.
    bytes memory chainIdWithType = abi.encodePacked(chainType, chainID);
    return uint48(bytes6(chainIdWithType));
  }

  function _encodeInputs2(
    Proof memory _args,
    uint8 maxEdges
  ) public view returns (bytes memory, bytes32[] memory, bytes memory) {
    uint256 _chainId = getChainIdType();
    bytes32[] memory result = new bytes32[](maxEdges + 1);
    bytes memory encodedInput;
    uint256 argsHash;
    bytes memory hashValue = new bytes(32);

    if (maxEdges == 1) {
      bytes memory data = new bytes(32*9);
      uint256[9] memory inputs;
      bytes32[2] memory roots = abi.decode(_args.roots, (bytes32[2]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      // assign input
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.outputCommitments[0]);
      inputs[5] = uint256(_args.outputCommitments[1]);
      inputs[6] = uint256(_chainId);
      inputs[7] = uint256(roots[0]);
      inputs[8] = uint256(roots[1]);
      {
          uint256 i0 = inputs[0];
          uint256 i1 = inputs[1];
          uint256 i2 = inputs[2];
          assembly {
              mstore(add(data, 0x60), i2)
              mstore(add(data, 0x40), i1)
              mstore(add(data, 0x20), i0)
          }
      }
      {
          uint256 i3 = inputs[3];
          uint256 i4 = inputs[4];
          assembly {
              mstore(add(data, 0xa0), i4)
              mstore(add(data, 0x80), i3)
          }
      }
      {
          uint256 i5 = inputs[5];
          uint256 i6 = inputs[6];
          assembly {
              mstore(add(data, 0xe0), i6)
              mstore(add(data, 0xc0), i5)
          }
      }
      { 
          uint256 i7 = inputs[7];
          uint256 i8 = inputs[8];
          assembly {
              mstore(add(data, 0x120), i8)
              mstore(add(data, 0x100), i7)
          }
      }
      encodedInput = abi.encodePacked(inputs);
      argsHash = uint256(sha256(data)) % SNARK_FIELD;
      assembly { mstore(add(hashValue, 32), argsHash) }

    } else if (maxEdges == 2) {
      uint256[10] memory inputs;
      bytes32[3] memory roots = abi.decode(_args.roots, (bytes32[3]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      result[2] = roots[2];
      // assign input
      //encodedInput = abi.encodePacked(inputs);
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.outputCommitments[0]);
      inputs[5] = uint256(_args.outputCommitments[1]);
      inputs[6] = uint256(_chainId);
      inputs[7] = uint256(roots[0]);
      inputs[8] = uint256(roots[1]);
      inputs[9] = uint256(roots[2]);
    } else if (maxEdges == 3) {
      uint256[11] memory inputs;
      bytes32[4] memory roots = abi.decode(_args.roots, (bytes32[4]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      result[2] = roots[2];
      result[3] = roots[3];
      // assign input
      //encodedInput = abi.encodePacked(inputs);
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.outputCommitments[0]);
      inputs[5] = uint256(_args.outputCommitments[1]);
      inputs[6] = uint256(_chainId);
      inputs[7] = uint256(roots[0]);
      inputs[8] = uint256(roots[1]);
      inputs[9] = uint256(roots[2]);
      inputs[10] = uint256(roots[3]);
    } else if (maxEdges == 4) {
      uint256[12] memory inputs;
      bytes32[5] memory roots = abi.decode(_args.roots, (bytes32[5]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      result[2] = roots[2];
      result[3] = roots[3];
      result[4] = roots[4];
      // assign input
      //encodedInput = abi.encodePacked(inputs);
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.outputCommitments[0]);
      inputs[5] = uint256(_args.outputCommitments[1]);
      inputs[6] = uint256(_chainId);
      inputs[7] = uint256(roots[0]);
      inputs[8] = uint256(roots[1]);
      inputs[9] = uint256(roots[2]);
      inputs[10] = uint256(roots[3]);
      inputs[11] = uint256(roots[4]);
    } else if (maxEdges == 5) {
      uint256[13] memory inputs;
      bytes32[6] memory roots = abi.decode(_args.roots, (bytes32[6]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      result[2] = roots[2];
      result[3] = roots[3];
      result[4] = roots[4];
      result[5] = roots[5];
      // assign input
      //encodedInput = abi.encodePacked(inputs);
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.outputCommitments[0]);
      inputs[5] = uint256(_args.outputCommitments[1]);
      inputs[6] = uint256(_chainId);
      inputs[7] = uint256(roots[0]);
      inputs[8] = uint256(roots[1]);
      inputs[9] = uint256(roots[2]);
      inputs[10] = uint256(roots[3]);
      inputs[11] = uint256(roots[4]);
      inputs[12] = uint256(roots[5]);
    } else {
      require(false, "Invalid edges");
    }

    return (encodedInput, result, hashValue);
  }



  function _encodeInputs16(
    Proof memory _args,
    uint8 maxEdges
  ) public view returns (bytes memory, bytes32[] memory, bytes memory) {
    uint256 _chainId = getChainIdType();
    bytes32[] memory result = new bytes32[](maxEdges + 1);
    bytes memory encodedInput;
    uint256 argsHash;
    bytes memory hashValue = new bytes(32);

    if (maxEdges == 1) {
      bytes memory data = new bytes(32*23);
      uint256[23] memory inputs;
      bytes32[2] memory roots = abi.decode(_args.roots, (bytes32[2]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      // assign input
      //encodedInput = abi.encodePacked(inputs);
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.inputNullifiers[2]);
      inputs[5] = uint256(_args.inputNullifiers[3]);
      inputs[6] = uint256(_args.inputNullifiers[4]);
      inputs[7] = uint256(_args.inputNullifiers[5]);
      inputs[8] = uint256(_args.inputNullifiers[6]);
      inputs[9] = uint256(_args.inputNullifiers[7]);
      inputs[10] = uint256(_args.inputNullifiers[8]);
      inputs[11] = uint256(_args.inputNullifiers[9]);
      inputs[12] = uint256(_args.inputNullifiers[10]);
      inputs[13] = uint256(_args.inputNullifiers[11]);
      inputs[14] = uint256(_args.inputNullifiers[12]);
      inputs[15] = uint256(_args.inputNullifiers[13]);
      inputs[16] = uint256(_args.inputNullifiers[14]);
      inputs[17] = uint256(_args.inputNullifiers[15]);
      inputs[18] = uint256(_args.outputCommitments[0]);
      inputs[19] = uint256(_args.outputCommitments[1]);
      inputs[20] = uint256(_chainId);
      inputs[21] = uint256(roots[0]);
      inputs[22] = uint256(roots[1]);
      {
          uint256 i0 = inputs[0];
          uint256 i1 = inputs[1];
          uint256 i2 = inputs[2];
          assembly {
              mstore(add(data, 0x60), i2)
              mstore(add(data, 0x40), i1)
              mstore(add(data, 0x20), i0)
          }
      }
      {
          uint256 i3 = inputs[3];
          uint256 i4 = inputs[4];
          uint256 i5 = inputs[5];
          assembly {
              mstore(add(data, 0xc0), i5)
              mstore(add(data, 0xa0), i4)
              mstore(add(data, 0x80), i3)
          }
      }
      {
          uint256 i6 = inputs[6];
          uint256 i7 = inputs[7];
          uint256 i8 = inputs[8];
          assembly {
              mstore(add(data, 0x120), i8)
              mstore(add(data, 0x100), i7)
              mstore(add(data, 0xe0), i6)
          }
      }
      {
          uint256 i9 = inputs[9];
          uint256 i10 = inputs[10];
          uint256 i11 = inputs[11];
          assembly {
              mstore(add(data, 0x180), i11)
              mstore(add(data, 0x160), i10)
              mstore(add(data, 0x140), i9)
          }
      }
      {
          uint256 i12 = inputs[12];
          uint256 i13 = inputs[13];
          uint256 i14 = inputs[14];
          assembly {
              mstore(add(data, 0x1e0), i14)
              mstore(add(data, 0x1c0), i13)
              mstore(add(data, 0x1a0), i12)
          }
      }
      {
          uint256 i15 = inputs[15];
          uint256 i16 = inputs[16];
          uint256 i17 = inputs[17];
          assembly {
              mstore(add(data, 0x240), i17)
              mstore(add(data, 0x220), i16)
              mstore(add(data, 0x200), i15)
          }
      }
      {
          uint256 i18 = inputs[18];
          uint256 i19 = inputs[19];
          uint256 i20 = inputs[20];
          assembly {
              mstore(add(data, 0x2a0), i20)
              mstore(add(data, 0x280), i19)
              mstore(add(data, 0x260), i18)
          }
      }
      {
          uint256 i21 = inputs[21];
          uint256 i22 = inputs[22];
          assembly {
              mstore(add(data, 0x2e0), i22)
              mstore(add(data, 0x2c0), i21)
          }
      }
      encodedInput = abi.encodePacked(inputs);
      argsHash = uint256(sha256(data)) % SNARK_FIELD;
      assembly { mstore(add(hashValue, 32), argsHash) }
      encodedInput = abi.encodePacked(inputs);
    } else if (maxEdges == 2) {
      uint256[24] memory inputs;
      bytes32[3] memory roots = abi.decode(_args.roots, (bytes32[3]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      result[2] = roots[2];
      // assign input
      //encodedInput = abi.encodePacked(inputs);
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.inputNullifiers[2]);
      inputs[5] = uint256(_args.inputNullifiers[3]);
      inputs[6] = uint256(_args.inputNullifiers[4]);
      inputs[7] = uint256(_args.inputNullifiers[5]);
      inputs[8] = uint256(_args.inputNullifiers[6]);
      inputs[9] = uint256(_args.inputNullifiers[7]);
      inputs[10] = uint256(_args.inputNullifiers[8]);
      inputs[11] = uint256(_args.inputNullifiers[9]);
      inputs[12] = uint256(_args.inputNullifiers[10]);
      inputs[13] = uint256(_args.inputNullifiers[11]);
      inputs[14] = uint256(_args.inputNullifiers[12]);
      inputs[15] = uint256(_args.inputNullifiers[13]);
      inputs[16] = uint256(_args.inputNullifiers[14]);
      inputs[17] = uint256(_args.inputNullifiers[15]);
      inputs[18] = uint256(_args.outputCommitments[0]);
      inputs[19] = uint256(_args.outputCommitments[1]);
      inputs[20] = uint256(_chainId);
      inputs[21] = uint256(roots[0]);
      inputs[22] = uint256(roots[1]);
      inputs[23] = uint256(roots[2]);
    } else if (maxEdges == 3) {
      uint256[25] memory inputs;
      bytes32[4] memory roots = abi.decode(_args.roots, (bytes32[4]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      result[2] = roots[2];
      result[3] = roots[3];
      // assign input
      //encodedInput = abi.encodePacked(inputs);
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.inputNullifiers[2]);
      inputs[5] = uint256(_args.inputNullifiers[3]);
      inputs[6] = uint256(_args.inputNullifiers[4]);
      inputs[7] = uint256(_args.inputNullifiers[5]);
      inputs[8] = uint256(_args.inputNullifiers[6]);
      inputs[9] = uint256(_args.inputNullifiers[7]);
      inputs[10] = uint256(_args.inputNullifiers[8]);
      inputs[11] = uint256(_args.inputNullifiers[9]);
      inputs[12] = uint256(_args.inputNullifiers[10]);
      inputs[13] = uint256(_args.inputNullifiers[11]);
      inputs[14] = uint256(_args.inputNullifiers[12]);
      inputs[15] = uint256(_args.inputNullifiers[13]);
      inputs[16] = uint256(_args.inputNullifiers[14]);
      inputs[17] = uint256(_args.inputNullifiers[15]);
      inputs[18] = uint256(_args.outputCommitments[0]);
      inputs[19] = uint256(_args.outputCommitments[1]);
      inputs[20] = uint256(_chainId);
      inputs[21] = uint256(roots[0]);
      inputs[22] = uint256(roots[1]);
      inputs[23] = uint256(roots[2]);
      inputs[24] = uint256(roots[3]);
    } else if (maxEdges == 4) {
      uint256[26] memory inputs;
      bytes32[5] memory roots = abi.decode(_args.roots, (bytes32[5]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      result[2] = roots[2];
      result[3] = roots[3];
      result[4] = roots[4];
      // assign input
      //encodedInput = abi.encodePacked(inputs);
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.inputNullifiers[2]);
      inputs[5] = uint256(_args.inputNullifiers[3]);
      inputs[6] = uint256(_args.inputNullifiers[4]);
      inputs[7] = uint256(_args.inputNullifiers[5]);
      inputs[8] = uint256(_args.inputNullifiers[6]);
      inputs[9] = uint256(_args.inputNullifiers[7]);
      inputs[10] = uint256(_args.inputNullifiers[8]);
      inputs[11] = uint256(_args.inputNullifiers[9]);
      inputs[12] = uint256(_args.inputNullifiers[10]);
      inputs[13] = uint256(_args.inputNullifiers[11]);
      inputs[14] = uint256(_args.inputNullifiers[12]);
      inputs[15] = uint256(_args.inputNullifiers[13]);
      inputs[16] = uint256(_args.inputNullifiers[14]);
      inputs[17] = uint256(_args.inputNullifiers[15]);
      inputs[18] = uint256(_args.outputCommitments[0]);
      inputs[19] = uint256(_args.outputCommitments[1]);
      inputs[20] = uint256(_chainId);
      inputs[21] = uint256(roots[0]);
      inputs[22] = uint256(roots[1]);
      inputs[23] = uint256(roots[2]);
      inputs[24] = uint256(roots[3]);
      inputs[25] = uint256(roots[4]);
    } else if (maxEdges == 5) {
      uint256[27] memory inputs;
      bytes32[6] memory roots = abi.decode(_args.roots, (bytes32[6]));
      // assign roots
      result[0] = roots[0];
      result[1] = roots[1];
      result[2] = roots[2];
      result[3] = roots[3];
      result[4] = roots[4];
      result[5] = roots[5];
      // assign input
      //encodedInput = abi.encodePacked(inputs);
      inputs[0] = uint256(_args.publicAmount);
      inputs[1] = uint256(_args.extDataHash);
      inputs[2] = uint256(_args.inputNullifiers[0]);
      inputs[3] = uint256(_args.inputNullifiers[1]);
      inputs[4] = uint256(_args.inputNullifiers[2]);
      inputs[5] = uint256(_args.inputNullifiers[3]);
      inputs[6] = uint256(_args.inputNullifiers[4]);
      inputs[7] = uint256(_args.inputNullifiers[5]);
      inputs[8] = uint256(_args.inputNullifiers[6]);
      inputs[9] = uint256(_args.inputNullifiers[7]);
      inputs[10] = uint256(_args.inputNullifiers[8]);
      inputs[11] = uint256(_args.inputNullifiers[9]);
      inputs[12] = uint256(_args.inputNullifiers[10]);
      inputs[13] = uint256(_args.inputNullifiers[11]);
      inputs[14] = uint256(_args.inputNullifiers[12]);
      inputs[15] = uint256(_args.inputNullifiers[13]);
      inputs[16] = uint256(_args.inputNullifiers[14]);
      inputs[17] = uint256(_args.inputNullifiers[15]);
      inputs[18] = uint256(_args.outputCommitments[0]);
      inputs[19] = uint256(_args.outputCommitments[1]);
      inputs[20] = uint256(_chainId);
      inputs[21] = uint256(roots[0]);
      inputs[22] = uint256(roots[1]);
      inputs[23] = uint256(roots[2]);
      inputs[24] = uint256(roots[3]);
      inputs[25] = uint256(roots[4]);
      inputs[26] = uint256(roots[5]);
    } else {
      require(false, "Invalid edges");
    }

      return (encodedInput, result, hashValue);
  }
}
