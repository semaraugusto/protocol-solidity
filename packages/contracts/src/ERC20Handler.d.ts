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
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import type { TypedEventFilter, TypedEvent, TypedListener } from "./common";

interface ERC20HandlerInterface extends ethers.utils.Interface {
  functions: {
    "_bridgeAddress()": FunctionFragment;
    "_burnList(address)": FunctionFragment;
    "_contractAddressToResourceID(address)": FunctionFragment;
    "_contractWhitelist(address)": FunctionFragment;
    "_depositRecords(uint32,uint64)": FunctionFragment;
    "_resourceIDToContractAddress(bytes32)": FunctionFragment;
    "deposit(bytes32,uint32,uint64,address,bytes)": FunctionFragment;
    "executeProposal(bytes32,bytes)": FunctionFragment;
    "fundERC20(address,address,uint256)": FunctionFragment;
    "getDepositRecord(uint64,uint8)": FunctionFragment;
    "setBurnable(address)": FunctionFragment;
    "setResource(bytes32,address)": FunctionFragment;
    "withdraw(address,address,uint256)": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "_bridgeAddress",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "_burnList", values: [string]): string;
  encodeFunctionData(
    functionFragment: "_contractAddressToResourceID",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "_contractWhitelist",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "_depositRecords",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "_resourceIDToContractAddress",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BytesLike, BigNumberish, BigNumberish, string, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "executeProposal",
    values: [BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "fundERC20",
    values: [string, string, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositRecord",
    values: [BigNumberish, BigNumberish]
  ): string;
  encodeFunctionData(functionFragment: "setBurnable", values: [string]): string;
  encodeFunctionData(
    functionFragment: "setResource",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [string, string, BigNumberish]
  ): string;

  decodeFunctionResult(
    functionFragment: "_bridgeAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "_burnList", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_contractAddressToResourceID",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_contractWhitelist",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_depositRecords",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_resourceIDToContractAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "executeProposal",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "fundERC20", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getDepositRecord",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setBurnable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setResource",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;

  events: {};
}

export class ERC20Handler extends BaseContract {
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

  interface: ERC20HandlerInterface;

  functions: {
    _bridgeAddress(overrides?: CallOverrides): Promise<[string]>;

    _burnList(arg0: string, overrides?: CallOverrides): Promise<[boolean]>;

    _contractAddressToResourceID(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[string]>;

    _contractWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[boolean]>;

    _depositRecords(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, number, string, string, string, BigNumber] & {
        _tokenAddress: string;
        _destinationChainID: number;
        _resourceID: string;
        _destinationRecipientAddress: string;
        _depositer: string;
        _amount: BigNumber;
      }
    >;

    _resourceIDToContractAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<[string]>;

    deposit(
      resourceID: BytesLike,
      destinationChainID: BigNumberish,
      depositNonce: BigNumberish,
      depositer: string,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    executeProposal(
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    fundERC20(
      tokenAddress: string,
      owner: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getDepositRecord(
      depositNonce: BigNumberish,
      destId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [
        [string, number, string, string, string, BigNumber] & {
          _tokenAddress: string;
          _destinationChainID: number;
          _resourceID: string;
          _destinationRecipientAddress: string;
          _depositer: string;
          _amount: BigNumber;
        }
      ]
    >;

    setBurnable(
      contractAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdraw(
      tokenAddress: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  _bridgeAddress(overrides?: CallOverrides): Promise<string>;

  _burnList(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  _contractAddressToResourceID(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<string>;

  _contractWhitelist(arg0: string, overrides?: CallOverrides): Promise<boolean>;

  _depositRecords(
    arg0: BigNumberish,
    arg1: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, number, string, string, string, BigNumber] & {
      _tokenAddress: string;
      _destinationChainID: number;
      _resourceID: string;
      _destinationRecipientAddress: string;
      _depositer: string;
      _amount: BigNumber;
    }
  >;

  _resourceIDToContractAddress(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  deposit(
    resourceID: BytesLike,
    destinationChainID: BigNumberish,
    depositNonce: BigNumberish,
    depositer: string,
    data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  executeProposal(
    resourceID: BytesLike,
    data: BytesLike,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  fundERC20(
    tokenAddress: string,
    owner: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getDepositRecord(
    depositNonce: BigNumberish,
    destId: BigNumberish,
    overrides?: CallOverrides
  ): Promise<
    [string, number, string, string, string, BigNumber] & {
      _tokenAddress: string;
      _destinationChainID: number;
      _resourceID: string;
      _destinationRecipientAddress: string;
      _depositer: string;
      _amount: BigNumber;
    }
  >;

  setBurnable(
    contractAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  setResource(
    resourceID: BytesLike,
    contractAddress: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdraw(
    tokenAddress: string,
    recipient: string,
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    _bridgeAddress(overrides?: CallOverrides): Promise<string>;

    _burnList(arg0: string, overrides?: CallOverrides): Promise<boolean>;

    _contractAddressToResourceID(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<string>;

    _contractWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<boolean>;

    _depositRecords(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, number, string, string, string, BigNumber] & {
        _tokenAddress: string;
        _destinationChainID: number;
        _resourceID: string;
        _destinationRecipientAddress: string;
        _depositer: string;
        _amount: BigNumber;
      }
    >;

    _resourceIDToContractAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    deposit(
      resourceID: BytesLike,
      destinationChainID: BigNumberish,
      depositNonce: BigNumberish,
      depositer: string,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    executeProposal(
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    fundERC20(
      tokenAddress: string,
      owner: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    getDepositRecord(
      depositNonce: BigNumberish,
      destId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<
      [string, number, string, string, string, BigNumber] & {
        _tokenAddress: string;
        _destinationChainID: number;
        _resourceID: string;
        _destinationRecipientAddress: string;
        _depositer: string;
        _amount: BigNumber;
      }
    >;

    setBurnable(
      contractAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: CallOverrides
    ): Promise<void>;

    withdraw(
      tokenAddress: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;
  };

  filters: {};

  estimateGas: {
    _bridgeAddress(overrides?: CallOverrides): Promise<BigNumber>;

    _burnList(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    _contractAddressToResourceID(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _contractWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _depositRecords(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    _resourceIDToContractAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deposit(
      resourceID: BytesLike,
      destinationChainID: BigNumberish,
      depositNonce: BigNumberish,
      depositer: string,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    executeProposal(
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    fundERC20(
      tokenAddress: string,
      owner: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getDepositRecord(
      depositNonce: BigNumberish,
      destId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    setBurnable(
      contractAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdraw(
      tokenAddress: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _bridgeAddress(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    _burnList(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _contractAddressToResourceID(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _contractWhitelist(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _depositRecords(
      arg0: BigNumberish,
      arg1: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _resourceIDToContractAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposit(
      resourceID: BytesLike,
      destinationChainID: BigNumberish,
      depositNonce: BigNumberish,
      depositer: string,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    executeProposal(
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    fundERC20(
      tokenAddress: string,
      owner: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getDepositRecord(
      depositNonce: BigNumberish,
      destId: BigNumberish,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    setBurnable(
      contractAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    setResource(
      resourceID: BytesLike,
      contractAddress: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdraw(
      tokenAddress: string,
      recipient: string,
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}