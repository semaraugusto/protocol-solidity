/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  BaseContract,
  ContractTransaction,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface VAnchorEncodeInputsInterface extends ethers.utils.Interface {
  functions: {
    "EVM_CHAIN_ID_TYPE()": FunctionFragment;
    "_encodeInputs16((bytes,bytes,bytes32[],bytes32[2],uint256,bytes32),uint8)": FunctionFragment;
    "_encodeInputs2((bytes,bytes,bytes32[],bytes32[2],uint256,bytes32),uint8)": FunctionFragment;
    "getChainId()": FunctionFragment;
    "getChainIdType()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "EVM_CHAIN_ID_TYPE",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_encodeInputs16",
    values: [
      {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "_encodeInputs2",
    values: [
      {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      BigNumberish
    ]
  ): string;
  encodeFunctionData(
    functionFragment: "getChainId",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getChainIdType",
    values?: undefined
  ): string;

  decodeFunctionResult(
    functionFragment: "EVM_CHAIN_ID_TYPE",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_encodeInputs16",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_encodeInputs2",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "getChainId", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getChainIdType",
    data: BytesLike
  ): Result;

  events: {};
}

export class VAnchorEncodeInputs extends BaseContract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: VAnchorEncodeInputsInterface;

  functions: {
    EVM_CHAIN_ID_TYPE(overrides?: CallOverrides): Promise<[string]>;

    _encodeInputs16(
      _args: {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      maxEdges: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, string[]]>;

    _encodeInputs2(
      _args: {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      maxEdges: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, string[]]>;

    getChainId(overrides?: CallOverrides): Promise<[BigNumber]>;

    getChainIdType(overrides?: CallOverrides): Promise<[number]>;
  };

  EVM_CHAIN_ID_TYPE(overrides?: CallOverrides): Promise<string>;

  _encodeInputs16(
    _args: {
      proof: BytesLike;
      roots: BytesLike;
      inputNullifiers: BytesLike[];
      outputCommitments: [BytesLike, BytesLike];
      publicAmount: BigNumberish;
      extDataHash: BytesLike;
    },
    maxEdges: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[string, string[]]>;

  _encodeInputs2(
    _args: {
      proof: BytesLike;
      roots: BytesLike;
      inputNullifiers: BytesLike[];
      outputCommitments: [BytesLike, BytesLike];
      publicAmount: BigNumberish;
      extDataHash: BytesLike;
    },
    maxEdges: BigNumberish,
    overrides?: CallOverrides
  ): Promise<[string, string[]]>;

  getChainId(overrides?: CallOverrides): Promise<BigNumber>;

  getChainIdType(overrides?: CallOverrides): Promise<number>;

  callStatic: {
    EVM_CHAIN_ID_TYPE(overrides?: CallOverrides): Promise<string>;

    _encodeInputs16(
      _args: {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      maxEdges: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, string[]]>;

    _encodeInputs2(
      _args: {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      maxEdges: BigNumberish,
      overrides?: CallOverrides
    ): Promise<[string, string[]]>;

    getChainId(overrides?: CallOverrides): Promise<BigNumber>;

    getChainIdType(overrides?: CallOverrides): Promise<number>;
  };

  filters: {};

  estimateGas: {
    EVM_CHAIN_ID_TYPE(overrides?: CallOverrides): Promise<BigNumber>;

    _encodeInputs16(
      _args: {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      maxEdges: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _encodeInputs2(
      _args: {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      maxEdges: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    getChainId(overrides?: CallOverrides): Promise<BigNumber>;

    getChainIdType(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    EVM_CHAIN_ID_TYPE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _encodeInputs16(
      _args: {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      maxEdges: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _encodeInputs2(
      _args: {
        proof: BytesLike;
        roots: BytesLike;
        inputNullifiers: BytesLike[];
        outputCommitments: [BytesLike, BytesLike];
        publicAmount: BigNumberish;
        extDataHash: BytesLike;
      },
      maxEdges: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    getChainId(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    getChainIdType(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
