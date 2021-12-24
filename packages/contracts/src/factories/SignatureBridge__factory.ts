/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  Signer,
  utils,
  BigNumberish,
  Contract,
  ContractFactory,
  Overrides,
} from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  SignatureBridge,
  SignatureBridgeInterface,
} from "../SignatureBridge";

const _abi = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainID",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "initialGovernor",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "expiry",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "GovernanceOwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Paused",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "originChainID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "nonce",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "enum SignatureBridge.ProposalStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "dataHash",
        type: "bytes32",
      },
    ],
    name: "ProposalEvent",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "originChainID",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint64",
        name: "nonce",
        type: "uint64",
      },
      {
        indexed: false,
        internalType: "enum SignatureBridge.ProposalStatus",
        name: "status",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "dataHash",
        type: "bytes32",
      },
    ],
    name: "ProposalVote",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "recovered",
        type: "address",
      },
    ],
    name: "RecoveredAddress",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "Unpaused",
    type: "event",
  },
  {
    inputs: [],
    name: "RELAYER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_chainID",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "_counts",
    outputs: [
      {
        internalType: "uint64",
        name: "",
        type: "uint64",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_expiry",
    outputs: [
      {
        internalType: "uint40",
        name: "",
        type: "uint40",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "_fee",
    outputs: [
      {
        internalType: "uint128",
        name: "",
        type: "uint128",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "_resourceIDToHandlerAddress",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "handlerAddress",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "resourceID",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "executionContextAddress",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "adminSetResourceWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "pubkey",
        type: "bytes",
      },
    ],
    name: "checkPubKey",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "chainID",
        type: "uint256",
      },
      {
        internalType: "uint64",
        name: "nonce",
        type: "uint64",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "bytes32",
        name: "resourceID",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "executeProposalWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "governor",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "isGovernor",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "isSignatureFromGovernor",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "recover",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "transferOwnershipWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "hash",
        type: "bytes32",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "verify",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const _bytecode =
<<<<<<< Updated upstream
  "0x60806040523480156200001157600080fd5b506040516200167b3803806200167b833981016040819052620000349162000170565b600080546001600160a81b0319166101006001600160a01b03868116820292909217808455604051879492909104909216917f1f323489f404e3bad762215fc05447f9a77bb7f3b630a6f08a2851b999db41f7908290a35083600281905550620000a9826200011160201b620008d21760201c565b600360006101000a8154816001600160801b0302191690836001600160801b03160217905550620000e5816200014660201b620008ff1760201c565b600360106101000a81548164ffffffffff021916908364ffffffffff1602179055505050505062000229565b6000600160801b8210620001425760405162461bcd60e51b81526004016200013990620001bb565b60405180910390fd5b5090565b6000650100000000008210620001425760405162461bcd60e51b81526004016200013990620001f2565b6000806000806080858703121562000186578384fd5b845160208601519094506001600160a01b0381168114620001a5578384fd5b6040860151606090960151949790965092505050565b6020808252601e908201527f76616c756520646f6573206e6f742066697420696e2031323820626974730000604082015260600190565b6020808252601d908201527f76616c756520646f6573206e6f742066697420696e2034302062697473000000604082015260600190565b61144280620002396000396000f3fe608060405234801561001057600080fd5b50600436106101165760003560e01c8063beab7131116100a2578063c7af335211610071578063c7af335214610211578063d4066f4c14610219578063d75a06831461022c578063f1835db71461024c578063f2fde38b1461025f57610116565b8063beab7131146101cc578063c1520359146101d4578063c5b37c22146101e7578063c5ec8970146101fc57610116565b80635c975abb116100e95780635c975abb14610174578063715018a61461018957806384db809f146101915780638755bcad146101a4578063926d7d7f146101b757610116565b80630bf711751461011b5780630c340a24146101305780631ed13d1b1461014e5780631eee6bc814610161575b600080fd5b61012e610129366004610de1565b610272565b005b610138610327565b60405161014591906110a3565b60405180910390f35b61012e61015c366004610ec6565b61033b565b61012e61016f366004610d7b565b61038b565b61017c6104a9565b60405161014591906110b7565b61012e6104b2565b61013861019f366004610e2d565b610525565b61017c6101b2366004610ec6565b610540565b6101bf610575565b60405161014591906110c2565b6101bf610599565b61012e6101e2366004610f1d565b61059f565b6101ef610739565b6040516101459190611374565b610204610748565b60405161014591906113cf565b61017c61075c565b61017c610227366004610e86565b610772565b61023f61023a366004610e2d565b6107a8565b60405161014591906113e1565b61017c61025a366004610e45565b6107c4565b61012e61026d366004610d5a565b6108a2565b60006040518060400160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a32300000000081525090506102f481846040516020016102c19190610fe7565b60408051601f19818403018152908290526102df9291602001611086565b60405160208183030381529060405283610540565b6103195760405162461bcd60e51b81526004016103109061116d565b60405180910390fd5b61032283610926565b505050565b60005461010090046001600160a01b031690565b81516020830120600061034e82846109b2565b6040519091506001600160a01b038216907f391f5edd7209ba797e8055bce97cab2d1a480a2849b0c7fe965c370457166dc490600090a250505050565b8383836040516020016103a093929190611004565b6040516020818303038152906040528160006040518060400160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a373200000000815250905061040081846040516020016102df929190611086565b61041c5760405162461bcd60e51b8152600401610310906111b3565b6000868152600560205260409081902080546001600160a01b0319166001600160a01b038a169081179091559051635c7d1b9b60e11b815288919063b8fa37369061046d908a908a906004016110cb565b600060405180830381600087803b15801561048757600080fd5b505af115801561049b573d6000803e3d6000fd5b505050505050505050505050565b60005460ff1690565b6104ba61075c565b6104d65760405162461bcd60e51b81526004016103109061116d565b600080546040516101009091046001600160a01b0316907f1f323489f404e3bad762215fc05447f9a77bb7f3b630a6f08a2851b999db41f7908390a360008054610100600160a81b0319169055565b6005602052600090815260409020546001600160a01b031681565b815160208301206000908161055582856109b2565b905061055f610327565b6001600160a01b03918216911614949350505050565b7fe2b7fb3b832174769106daebcfd6d1970523240dda11281102db9363b83b0dc481565b60025481565b83838080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525050604080518082018252601d81527f19457468657265756d205369676e6564204d6573736167653a0a3132380000006020808301919091529151869450909250610624916102df918491879101611086565b6106405760405162461bcd60e51b8152600401610310906111b3565b60008581526005602090815260408083205490516001600160a01b0390911692916106719184918c918c9101611031565b60408051601f1981840301815290829052805160209091012063712467f960e11b8252915082906001600160a01b0382169063e248cff2906106bb908b908e908e906004016110e2565b600060405180830381600087803b1580156106d557600080fd5b505af11580156106e9573d6000803e3d6000fd5b505050507f4cb7956f27653ed00ab0902269b3f51178752f9eb2b4ec82146afdddc5a0d41c8c8c6003856040516107239493929190611388565b60405180910390a1505050505050505050505050565b6003546001600160801b031681565b600354600160801b900464ffffffffff1681565b60005461010090046001600160a01b0316331490565b6000336001600160a01b0316838360405161078e92919061105d565b6040519081900390206001600160a01b0316149392505050565b60046020526000908152604090205467ffffffffffffffff1681565b6000806040518060400160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a33320000000081525090506000818760405160200161081492919061106d565b604051602081830303815290604052805190602001209050610834610327565b6001600160a01b0316600182888888604051600081526020016040526040516108609493929190611118565b6020604051602081039080840390855afa158015610882573d6000803e3d6000fd5b505050602060405103516001600160a01b03161492505050949350505050565b6108aa61075c565b6108c65760405162461bcd60e51b81526004016103109061116d565b6108cf81610926565b50565b6000600160801b82106108f75760405162461bcd60e51b815260040161031090611202565b50805b919050565b60006501000000000082106108f75760405162461bcd60e51b815260040161031090611270565b6001600160a01b03811661094c5760405162461bcd60e51b8152600401610310906112e9565b600080546040516001600160a01b038085169361010090930416917f1f323489f404e3bad762215fc05447f9a77bb7f3b630a6f08a2851b999db41f791a3600080546001600160a01b0390921661010002610100600160a81b0319909216919091179055565b60008060006109c185856109d6565b915091506109ce81610a46565b509392505050565b600080825160411415610a0d5760208301516040840151606085015160001a610a0187828585610b73565b94509450505050610a3f565b825160401415610a375760208301516040840151610a2c868383610c53565b935093505050610a3f565b506000905060025b9250929050565b6000816004811115610a6857634e487b7160e01b600052602160045260246000fd5b1415610a73576108cf565b6001816004811115610a9557634e487b7160e01b600052602160045260246000fd5b1415610ab35760405162461bcd60e51b815260040161031090611136565b6002816004811115610ad557634e487b7160e01b600052602160045260246000fd5b1415610af35760405162461bcd60e51b815260040161031090611239565b6003816004811115610b1557634e487b7160e01b600052602160045260246000fd5b1415610b335760405162461bcd60e51b8152600401610310906112a7565b6004816004811115610b5557634e487b7160e01b600052602160045260246000fd5b14156108cf5760405162461bcd60e51b815260040161031090611332565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610baa5750600090506003610c4a565b8460ff16601b14158015610bc257508460ff16601c14155b15610bd35750600090506004610c4a565b600060018787878760405160008152602001604052604051610bf89493929190611118565b6020604051602081039080840390855afa158015610c1a573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116610c4357600060019250925050610c4a565b9150600090505b94509492505050565b6000806001600160ff1b03831660ff84901c601b01610c7487828885610b73565b935093505050935093915050565b80356001600160a01b03811681146108fa57600080fd5b60008083601f840112610caa578081fd5b50813567ffffffffffffffff811115610cc1578182fd5b602083019150836020828501011115610a3f57600080fd5b600082601f830112610ce9578081fd5b813567ffffffffffffffff80821115610d0457610d046113f6565b604051601f8301601f191681016020018281118282101715610d2857610d286113f6565b604052828152848301602001861015610d3f578384fd5b82602086016020830137918201602001929092529392505050565b600060208284031215610d6b578081fd5b610d7482610c82565b9392505050565b60008060008060808587031215610d90578283fd5b610d9985610c82565b935060208501359250610dae60408601610c82565b9150606085013567ffffffffffffffff811115610dc9578182fd5b610dd587828801610cd9565b91505092959194509250565b60008060408385031215610df3578182fd5b610dfc83610c82565b9150602083013567ffffffffffffffff811115610e17578182fd5b610e2385828601610cd9565b9150509250929050565b600060208284031215610e3e578081fd5b5035919050565b60008060008060808587031215610e5a578384fd5b84359350602085013560ff81168114610e71578384fd5b93969395505050506040820135916060013590565b60008060208385031215610e98578182fd5b823567ffffffffffffffff811115610eae578283fd5b610eba85828601610c99565b90969095509350505050565b60008060408385031215610ed8578182fd5b823567ffffffffffffffff80821115610eef578384fd5b610efb86838701610cd9565b93506020850135915080821115610f10578283fd5b50610e2385828601610cd9565b60008060008060008060a08789031215610f35578182fd5b86359550602087013567ffffffffffffffff8082168214610f54578384fd5b90955060408801359080821115610f69578384fd5b610f758a838b01610c99565b9096509450606089013593506080890135915080821115610f94578283fd5b50610fa189828a01610cd9565b9150509295509295509295565b60008151815b81811015610fce5760208185018101518683015201610fb4565b81811115610fdc5782828601525b509290920192915050565b60609190911b6bffffffffffffffffffffffff1916815260140190565b6bffffffffffffffffffffffff19606094851b811682526014820193909352921b16603482015260480190565b60006bffffffffffffffffffffffff198560601b16825282846014840137910160140190815292915050565b6000828483379101908152919050565b60006110798285610fae565b9283525050602001919050565b600061109b6110958386610fae565b84610fae565b949350505050565b6001600160a01b0391909116815260200190565b901515815260200190565b90815260200190565b9182526001600160a01b0316602082015260400190565b60008482526040602083015282604083015282846060840137818301606090810191909152601f909201601f1916010192915050565b93845260ff9290921660208401526040830152606082015260800190565b60208082526018908201527f45434453413a20696e76616c6964207369676e61747572650000000000000000604082015260600190565b60208082526026908201527f476f7665726e61626c653a2063616c6c6572206973206e6f742074686520676f6040820152653b32b93737b960d11b606082015260800190565b6020808252602f908201527f7369676e656420627920676f7665726e6f723a204e6f742076616c696420736960408201526e3390333937b69033b7bb32b93737b960891b606082015260800190565b6020808252601e908201527f76616c756520646f6573206e6f742066697420696e2031323820626974730000604082015260600190565b6020808252601f908201527f45434453413a20696e76616c6964207369676e6174757265206c656e67746800604082015260600190565b6020808252601d908201527f76616c756520646f6573206e6f742066697420696e2034302062697473000000604082015260600190565b60208082526022908201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604082015261756560f01b606082015260800190565b60208082526029908201527f476f7665726e61626c653a206e6577206f776e657220697320746865207a65726040820152686f206164647265737360b81b606082015260800190565b60208082526022908201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604082015261756560f01b606082015260800190565b6001600160801b0391909116815260200190565b84815267ffffffffffffffff8416602082015260808101600584106113bd57634e487b7160e01b600052602160045260246000fd5b60408201939093526060015292915050565b64ffffffffff91909116815260200190565b67ffffffffffffffff91909116815260200190565b634e487b7160e01b600052604160045260246000fdfea26469706673582212200c49a842e187d5a555fbf4fa1eeb93dd7195f2e727ea51f97479f867d9709d4364736f6c63430008000033";
=======
  "0x60806040523480156200001157600080fd5b50604051620017f0380380620017f0833981016040819052620000349162000170565b600080546001600160a81b0319166101006001600160a01b03868116820292909217808455604051879492909104909216917f1f323489f404e3bad762215fc05447f9a77bb7f3b630a6f08a2851b999db41f7908290a35083600281905550620000a9826200011160201b620009e11760201c565b600360006101000a8154816001600160801b0302191690836001600160801b03160217905550620000e5816200014660201b62000a0e1760201c565b600360106101000a81548164ffffffffff021916908364ffffffffff1602179055505050505062000229565b6000600160801b8210620001425760405162461bcd60e51b81526004016200013990620001bb565b60405180910390fd5b5090565b6000650100000000008210620001425760405162461bcd60e51b81526004016200013990620001f2565b6000806000806080858703121562000186578384fd5b845160208601519094506001600160a01b0381168114620001a5578384fd5b6040860151606090960151949790965092505050565b6020808252601e908201527f76616c756520646f6573206e6f742066697420696e2031323820626974730000604082015260600190565b6020808252601d908201527f76616c756520646f6573206e6f742066697420696e2034302062697473000000604082015260600190565b6115b780620002396000396000f3fe608060405234801561001057600080fd5b50600436106101215760003560e01c8063926d7d7f116100ad578063c7af335211610071578063c7af33521461022f578063d4066f4c14610237578063d75a06831461024a578063f1835db71461026a578063f2fde38b1461027d57610121565b8063926d7d7f146101d5578063beab7131146101ea578063c1520359146101f2578063c5b37c2214610205578063c5ec89701461021a57610121565b80633db4acf6116100f45780633db4acf61461017f5780635c975abb14610192578063715018a6146101a757806384db809f146101af5780638755bcad146101c257610121565b80630bf71175146101265780630c340a241461013b5780631ed13d1b146101595780631eee6bc81461016c575b600080fd5b610139610134366004610ef0565b610290565b005b610143610345565b60405161015091906111ea565b60405180910390f35b610139610167366004610fd5565b610359565b61013961017a366004610e8a565b6103a9565b61013961018d36600461102c565b6104c7565b61019a6105b8565b60405161015091906111fe565b6101396105c1565b6101436101bd366004610f3c565b610634565b61019a6101d0366004610fd5565b61064f565b6101dd610684565b60405161015091906111e1565b6101dd6106a8565b61013961020036600461105b565b6106ae565b61020d610848565b60405161015091906114e9565b610222610857565b6040516101509190611544565b61019a61086b565b61019a610245366004610f95565b610881565b61025d610258366004610f3c565b6108b7565b6040516101509190611556565b61019a610278366004610f54565b6108d3565b61013961028b366004610e69565b6109b1565b60006040518060400160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a323000000000815250905061031281846040516020016102df9190611125565b60408051601f19818403018152908290526102fd92916020016111c4565b6040516020818303038152906040528361064f565b6103375760405162461bcd60e51b815260040161032e906112ab565b60405180910390fd5b61034083610a35565b505050565b60005461010090046001600160a01b031690565b81516020830120600061036c8284610ac1565b6040519091506001600160a01b038216907f391f5edd7209ba797e8055bce97cab2d1a480a2849b0c7fe965c370457166dc490600090a250505050565b8383836040516020016103be93929190611142565b6040516020818303038152906040528160006040518060400160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a373200000000815250905061041e81846040516020016102fd9291906111c4565b61043a5760405162461bcd60e51b815260040161032e906112f1565b6000868152600560205260409081902080546001600160a01b0319166001600160a01b038a169081179091559051635c7d1b9b60e11b815288919063b8fa37369061048b908a908a90600401611209565b600060405180830381600087803b1580156104a557600080fd5b505af11580156104b9573d6000803e3d6000fd5b505050505050505050505050565b816040516020016104d891906111e1565b6040516020818303038152906040528160006040518060400160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a333200000000815250905061053881846040516020016102fd9291906111c4565b6105545760405162461bcd60e51b815260040161032e906112f1565b6003546001600160801b031685141561057f5760405162461bcd60e51b815260040161032e906114b2565b610588856109e1565b600380546fffffffffffffffffffffffffffffffff19166001600160801b03929092169190911790555050505050565b60005460ff1690565b6105c961086b565b6105e55760405162461bcd60e51b815260040161032e906112ab565b600080546040516101009091046001600160a01b0316907f1f323489f404e3bad762215fc05447f9a77bb7f3b630a6f08a2851b999db41f7908390a360008054610100600160a81b0319169055565b6005602052600090815260409020546001600160a01b031681565b81516020830120600090816106648285610ac1565b905061066e610345565b6001600160a01b03918216911614949350505050565b7fe2b7fb3b832174769106daebcfd6d1970523240dda11281102db9363b83b0dc481565b60025481565b83838080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525050604080518082018252601c81527f19457468657265756d205369676e6564204d6573736167653a0a3936000000006020808301919091529151869450909250610733916102fd9184918791016111c4565b61074f5760405162461bcd60e51b815260040161032e906112f1565b60008581526005602090815260408083205490516001600160a01b0390911692916107809184918c918c910161116f565b60408051601f1981840301815290829052805160209091012063712467f960e11b8252915082906001600160a01b0382169063e248cff2906107ca908b908e908e90600401611220565b600060405180830381600087803b1580156107e457600080fd5b505af11580156107f8573d6000803e3d6000fd5b505050507f4cb7956f27653ed00ab0902269b3f51178752f9eb2b4ec82146afdddc5a0d41c8c8c60038560405161083294939291906114fd565b60405180910390a1505050505050505050505050565b6003546001600160801b031681565b600354600160801b900464ffffffffff1681565b60005461010090046001600160a01b0316331490565b6000336001600160a01b0316838360405161089d92919061119b565b6040519081900390206001600160a01b0316149392505050565b60046020526000908152604090205467ffffffffffffffff1681565b6000806040518060400160405280601c81526020017f19457468657265756d205369676e6564204d6573736167653a0a3332000000008152509050600081876040516020016109239291906111ab565b604051602081830303815290604052805190602001209050610943610345565b6001600160a01b03166001828888886040516000815260200160405260405161096f9493929190611256565b6020604051602081039080840390855afa158015610991573d6000803e3d6000fd5b505050602060405103516001600160a01b03161492505050949350505050565b6109b961086b565b6109d55760405162461bcd60e51b815260040161032e906112ab565b6109de81610a35565b50565b6000600160801b8210610a065760405162461bcd60e51b815260040161032e90611340565b50805b919050565b6000650100000000008210610a065760405162461bcd60e51b815260040161032e906113ae565b6001600160a01b038116610a5b5760405162461bcd60e51b815260040161032e90611427565b600080546040516001600160a01b038085169361010090930416917f1f323489f404e3bad762215fc05447f9a77bb7f3b630a6f08a2851b999db41f791a3600080546001600160a01b0390921661010002610100600160a81b0319909216919091179055565b6000806000610ad08585610ae5565b91509150610add81610b55565b509392505050565b600080825160411415610b1c5760208301516040840151606085015160001a610b1087828585610c82565b94509450505050610b4e565b825160401415610b465760208301516040840151610b3b868383610d62565b935093505050610b4e565b506000905060025b9250929050565b6000816004811115610b7757634e487b7160e01b600052602160045260246000fd5b1415610b82576109de565b6001816004811115610ba457634e487b7160e01b600052602160045260246000fd5b1415610bc25760405162461bcd60e51b815260040161032e90611274565b6002816004811115610be457634e487b7160e01b600052602160045260246000fd5b1415610c025760405162461bcd60e51b815260040161032e90611377565b6003816004811115610c2457634e487b7160e01b600052602160045260246000fd5b1415610c425760405162461bcd60e51b815260040161032e906113e5565b6004816004811115610c6457634e487b7160e01b600052602160045260246000fd5b14156109de5760405162461bcd60e51b815260040161032e90611470565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0831115610cb95750600090506003610d59565b8460ff16601b14158015610cd157508460ff16601c14155b15610ce25750600090506004610d59565b600060018787878760405160008152602001604052604051610d079493929190611256565b6020604051602081039080840390855afa158015610d29573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b038116610d5257600060019250925050610d59565b9150600090505b94509492505050565b6000806001600160ff1b03831660ff84901c601b01610d8387828885610c82565b935093505050935093915050565b80356001600160a01b0381168114610a0957600080fd5b60008083601f840112610db9578081fd5b50813567ffffffffffffffff811115610dd0578182fd5b602083019150836020828501011115610b4e57600080fd5b600082601f830112610df8578081fd5b813567ffffffffffffffff80821115610e1357610e1361156b565b604051601f8301601f191681016020018281118282101715610e3757610e3761156b565b604052828152848301602001861015610e4e578384fd5b82602086016020830137918201602001929092529392505050565b600060208284031215610e7a578081fd5b610e8382610d91565b9392505050565b60008060008060808587031215610e9f578283fd5b610ea885610d91565b935060208501359250610ebd60408601610d91565b9150606085013567ffffffffffffffff811115610ed8578182fd5b610ee487828801610de8565b91505092959194509250565b60008060408385031215610f02578182fd5b610f0b83610d91565b9150602083013567ffffffffffffffff811115610f26578182fd5b610f3285828601610de8565b9150509250929050565b600060208284031215610f4d578081fd5b5035919050565b60008060008060808587031215610f69578384fd5b84359350602085013560ff81168114610f80578384fd5b93969395505050506040820135916060013590565b60008060208385031215610fa7578182fd5b823567ffffffffffffffff811115610fbd578283fd5b610fc985828601610da8565b90969095509350505050565b60008060408385031215610fe7578182fd5b823567ffffffffffffffff80821115610ffe578384fd5b61100a86838701610de8565b9350602085013591508082111561101f578283fd5b50610f3285828601610de8565b6000806040838503121561103e578182fd5b82359150602083013567ffffffffffffffff811115610f26578182fd5b60008060008060008060a08789031215611073578182fd5b86359550602087013567ffffffffffffffff8082168214611092578384fd5b909550604088013590808211156110a7578384fd5b6110b38a838b01610da8565b90965094506060890135935060808901359150808211156110d2578283fd5b506110df89828a01610de8565b9150509295509295509295565b60008151815b8181101561110c57602081850181015186830152016110f2565b8181111561111a5782828601525b509290920192915050565b60609190911b6bffffffffffffffffffffffff1916815260140190565b6bffffffffffffffffffffffff19606094851b811682526014820193909352921b16603482015260480190565b60006bffffffffffffffffffffffff198560601b16825282846014840137910160140190815292915050565b6000828483379101908152919050565b60006111b782856110ec565b9283525050602001919050565b60006111d96111d383866110ec565b846110ec565b949350505050565b90815260200190565b6001600160a01b0391909116815260200190565b901515815260200190565b9182526001600160a01b0316602082015260400190565b60008482526040602083015282604083015282846060840137818301606090810191909152601f909201601f1916010192915050565b93845260ff9290921660208401526040830152606082015260800190565b60208082526018908201527f45434453413a20696e76616c6964207369676e61747572650000000000000000604082015260600190565b60208082526026908201527f476f7665726e61626c653a2063616c6c6572206973206e6f742074686520676f6040820152653b32b93737b960d11b606082015260800190565b6020808252602f908201527f7369676e656420627920676f7665726e6f723a204e6f742076616c696420736960408201526e3390333937b69033b7bb32b93737b960891b606082015260800190565b6020808252601e908201527f76616c756520646f6573206e6f742066697420696e2031323820626974730000604082015260600190565b6020808252601f908201527f45434453413a20696e76616c6964207369676e6174757265206c656e67746800604082015260600190565b6020808252601d908201527f76616c756520646f6573206e6f742066697420696e2034302062697473000000604082015260600190565b60208082526022908201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604082015261756560f01b606082015260800190565b60208082526029908201527f476f7665726e61626c653a206e6577206f776e657220697320746865207a65726040820152686f206164647265737360b81b606082015260800190565b60208082526022908201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604082015261756560f01b606082015260800190565b6020808252601f908201527f43757272656e742066656520697320657175616c20746f206e65772066656500604082015260600190565b6001600160801b0391909116815260200190565b84815267ffffffffffffffff84166020820152608081016005841061153257634e487b7160e01b600052602160045260246000fd5b60408201939093526060015292915050565b64ffffffffff91909116815260200190565b67ffffffffffffffff91909116815260200190565b634e487b7160e01b600052604160045260246000fdfea26469706673582212200513d07c2d7dfec718f6e580e9e4eb04ade829067e71c82eb148511dcbb15ece64736f6c63430008000033";
>>>>>>> Stashed changes

export class SignatureBridge__factory extends ContractFactory {
  constructor(
    ...args: [signer: Signer] | ConstructorParameters<typeof ContractFactory>
  ) {
    if (args.length === 1) {
      super(_abi, _bytecode, args[0]);
    } else {
      super(...args);
    }
  }

  deploy(
    chainID: BigNumberish,
    initialGovernor: string,
    fee: BigNumberish,
    expiry: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SignatureBridge> {
    return super.deploy(
      chainID,
      initialGovernor,
      fee,
      expiry,
      overrides || {}
    ) as Promise<SignatureBridge>;
  }
  getDeployTransaction(
    chainID: BigNumberish,
    initialGovernor: string,
    fee: BigNumberish,
    expiry: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(
      chainID,
      initialGovernor,
      fee,
      expiry,
      overrides || {}
    );
  }
  attach(address: string): SignatureBridge {
    return super.attach(address) as SignatureBridge;
  }
  connect(signer: Signer): SignatureBridge__factory {
    return super.connect(signer) as SignatureBridge__factory;
  }
  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): SignatureBridgeInterface {
    return new utils.Interface(_abi) as SignatureBridgeInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): SignatureBridge {
    return new Contract(address, _abi, signerOrProvider) as SignatureBridge;
  }
}
