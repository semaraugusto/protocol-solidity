/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import { Provider, TransactionRequest } from "@ethersproject/providers";
import type {
  SignatureBridge,
  SignatureBridgeInterface,
} from "../SignatureBridge";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "initialGovernor",
        type: "address",
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
    name: "EVM_CHAIN_ID_TYPE",
    outputs: [
      {
        internalType: "bytes2",
        name: "",
        type: "bytes2",
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
        internalType: "bytes32[]",
        name: "resourceIDs",
        type: "bytes32[]",
      },
      {
        internalType: "address",
        name: "newBridge",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "adminMigrateBridgeWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
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
    name: "executeProposalWithSignature",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getChainId",
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
    name: "refreshNonce",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
      },
    ],
    stateMutability: "view",
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
      {
        internalType: "uint32",
        name: "nonce",
        type: "uint32",
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
        internalType: "uint32",
        name: "nonce",
        type: "uint32",
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
        internalType: "bytes",
        name: "publicKey",
        type: "bytes",
      },
      {
        internalType: "uint32",
        name: "nonce",
        type: "uint32",
      },
      {
        internalType: "bytes",
        name: "sig",
        type: "bytes",
      },
    ],
    name: "transferOwnershipWithSignaturePubKey",
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
  "0x60806040526000805463ffffffff60a81b1916905534801561002057600080fd5b50604051611af7380380611af783398101604081905261003f9161009d565b600080546001600160a81b0319166101006001600160a01b03848116820292909217808455604051859492909104909216917f1f323489f404e3bad762215fc05447f9a77bb7f3b630a6f08a2851b999db41f7908290a350506100cd565b6000602082840312156100af57600080fd5b81516001600160a01b03811681146100c657600080fd5b9392505050565b611a1b806100dc6000396000f3fe608060405234801561001057600080fd5b50600436106101215760003560e01c80638755bcad116100ad578063a6e94c9111610071578063a6e94c9114610282578063c7af335214610295578063d4066f4c146102ad578063d75a0683146102c0578063f1835db71461030357600080fd5b80638755bcad1461021257806387ac4f51146102255780638b7e878214610238578063911005e71461025c5780639d2b1ed71461026f57600080fd5b80633408e470116100f45780633408e470146101a95780635c975abb146101b7578063715018a6146101ce5780637296b5d8146101d657806384db809f146101e957600080fd5b80630c340a241461012657806313cb01f9146101555780631ed13d1b146101815780631eee6bc814610196575b600080fd5b60005461010090046001600160a01b03165b6040516001600160a01b0390911681526020015b60405180910390f35b60005461016c90600160a81b900463ffffffff1681565b60405163ffffffff909116815260200161014c565b61019461018f3660046115ba565b610316565b005b6101946101a4366004611325565b610366565b60405146815260200161014c565b60005460ff165b604051901515815260200161014c565b6101946104b0565b6101946101e436600461161e565b61052e565b6101386101f73660046114bd565b6003602052600090815260409020546001600160a01b031681565b6101be6102203660046115ba565b610694565b61019461023336600461141e565b6106ca565b610243600160f81b81565b6040516001600160f01b0319909116815260200161014c565b61019461026a3660046113c0565b61080b565b61019461027d36600461155b565b610996565b61019461029036600461138d565b610be9565b60005461010090046001600160a01b031633146101be565b6101be6102bb366004611519565b610cbf565b6102ea6102ce3660046114bd565b60026020526000908152604090205467ffffffffffffffff1681565b60405167ffffffffffffffff909116815260200161014c565b6101be6103113660046114d6565b610cf5565b8151602083012060006103298284610dea565b6040519091506001600160a01b038216907f391f5edd7209ba797e8055bce97cab2d1a480a2849b0c7fe965c370457166dc490600090a250505050565b6040516001600160601b0319606086811b821660208401526034830186905284901b166054820152606801604051602081830303815290604052805190602001208160006040518060400160405280601c81526020016000805160206119c683398151915281525090506103fb81846040516020016103e6929190611705565b60405160208183030381529060405283610694565b6104205760405162461bcd60e51b8152600401610417906117d7565b60405180910390fd5b6000868152600360205260409081902080546001600160a01b0319166001600160a01b038a81169182179092559151635c7d1b9b60e11b815260048101899052908716602482015288919063b8fa373690604401600060405180830381600087803b15801561048e57600080fd5b505af11580156104a2573d6000803e3d6000fd5b505050505050505050505050565b60005461010090046001600160a01b031633146104df5760405162461bcd60e51b815260040161041790611791565b600080546040516101009091046001600160a01b0316907f1f323489f404e3bad762215fc05447f9a77bb7f3b630a6f08a2851b999db41f7908390a360008054610100600160a81b0319169055565b60005463ffffffff808416600160a81b909204161061055f5760405162461bcd60e51b815260040161041790611826565b60005461057a90600160a81b900463ffffffff1660016118ae565b63ffffffff168263ffffffff1611156105a55760405162461bcd60e51b81526004016104179061184d565b604080518082018252601c81526000805160206119c683398151915260208083019190915285518682012092519192916000916105e691879189910161173b565b60408051808303601f190181528282528051602091820120908301819052925083916106429186910160408051601f198184030181529082905261062d929160200161171e565b60405160208183030381529060405286610694565b61065e5760405162461bcd60e51b815260040161041790611791565b61066781610e0e565b50506000805463ffffffff909516600160a81b0263ffffffff60a81b199095169490941790935550505050565b81516020830120600090816106a98285610dea565b60005461010090046001600160a01b03908116911614925050505b92915050565b8383836040516020016106df939291906116b6565b604051602081830303815290604052805190602001208160006040518060400160405280601c81526020016000805160206119c6833981519152815250905061073481846040516020016103e6929190611705565b6107505760405162461bcd60e51b8152600401610417906117d7565b60005b86811015610801576000600360008a8a8581811061077357610773611999565b60209081029290920135835250810191909152604090810160002054905163d7f5b35960e01b81526001600160a01b0389811660048301529091169150819063d7f5b35990602401600060405180830381600087803b1580156107d557600080fd5b505af11580156107e9573d6000803e3d6000fd5b505050505080806107f990611952565b915050610753565b5050505050505050565b60005463ffffffff808416600160a81b909204161061083c5760405162461bcd60e51b815260040161041790611826565b60005461085790600160a81b900463ffffffff1660016118ae565b63ffffffff168263ffffffff1611156108825760405162461bcd60e51b81526004016104179061184d565b60006040518060400160405280601c81526020016000805160206119c68339815191528152509050600083856040516020016108e492919060e09290921b6001600160e01b031916825260601b6001600160601b031916600482015260180190565b604051602081830303815290604052805190602001209050610946828260405160200161091391815260200190565b60408051601f1981840301815290829052610931929160200161171e565b60405160208183030381529060405284610694565b6109625760405162461bcd60e51b815260040161041790611791565b61096b85610e0e565b50506000805463ffffffff909316600160a81b0263ffffffff60a81b19909316929092179091555050565b82826040516109a69291906116f5565b60405180910390208160006040518060400160405280601c81526020016000805160206119c683398151915281525090506109ed81846040516020016103e6929190611705565b610a095760405162461bcd60e51b8152600401610417906117d7565b366000610a19602082898b611884565b90925090506000610a2a8284611906565b90506000610a3c601c601a8587611884565b610a45916118d6565b905061010060f082901c14610ab85760405162461bcd60e51b815260206004820152603360248201527f6578656375746550726f706f73616c576974685369676e61747572653a204e6f6044820152727420616e2045564d20636861696e207479706560681b6064820152608401610417565b6000610ac86020601c8688611884565b610ad191611924565b905060e081901c4663ffffffff1614610b485760405162461bcd60e51b815260206004820152603360248201527f6578656375746550726f706f73616c576974685369676e61747572653a204e6f6044820152723a103a34329031b7b93932b1ba1031b430b4b760691b6064820152608401610417565b60006003600085815260200190815260200160002060009054906101000a90046001600160a01b031690506000819050806001600160a01b031663e248cff2868f8f6040518463ffffffff1660e01b8152600401610ba89392919061175b565b600060405180830381600087803b158015610bc257600080fd5b505af1158015610bd6573d6000803e3d6000fd5b5050505050505050505050505050505050565b60005461010090046001600160a01b03163314610c185760405162461bcd60e51b815260040161041790611791565b60005463ffffffff808316600160a81b9092041610610c495760405162461bcd60e51b815260040161041790611826565b600054610c6490600160a81b900463ffffffff1660016118ae565b63ffffffff168163ffffffff161115610c8f5760405162461bcd60e51b81526004016104179061184d565b610c9882610e0e565b6000805463ffffffff909216600160a81b0263ffffffff60a81b1990921691909117905550565b6000336001600160a01b03168383604051610cdb9291906116f5565b6040519081900390206001600160a01b0316149392505050565b6000806040518060400160405280601c81526020016000805160206119c6833981519152815250905060008187604051602001610d33929190611705565b604051602081830303815290604052805190602001209050610d636000546001600160a01b036101009091041690565b6001600160a01b031660018288888860405160008152602001604052604051610da8949392919093845260ff9290921660208401526040830152606082015260800190565b6020604051602081039080840390855afa158015610dca573d6000803e3d6000fd5b505050602060405103516001600160a01b03161492505050949350505050565b6000806000610df98585610edc565b91509150610e0681610f4c565b509392505050565b6001600160a01b038116610e765760405162461bcd60e51b815260206004820152602960248201527f476f7665726e61626c653a206e6577206f776e657220697320746865207a65726044820152686f206164647265737360b81b6064820152608401610417565b600080546040516001600160a01b038085169361010090930416917f1f323489f404e3bad762215fc05447f9a77bb7f3b630a6f08a2851b999db41f791a3600080546001600160a01b0390921661010002610100600160a81b0319909216919091179055565b600080825160411415610f135760208301516040840151606085015160001a610f078782858561110a565b94509450505050610f45565b825160401415610f3d5760208301516040840151610f328683836111f7565b935093505050610f45565b506000905060025b9250929050565b6000816004811115610f6057610f60611983565b1415610f695750565b6001816004811115610f7d57610f7d611983565b1415610fcb5760405162461bcd60e51b815260206004820152601860248201527f45434453413a20696e76616c6964207369676e617475726500000000000000006044820152606401610417565b6002816004811115610fdf57610fdf611983565b141561102d5760405162461bcd60e51b815260206004820152601f60248201527f45434453413a20696e76616c6964207369676e6174757265206c656e677468006044820152606401610417565b600381600481111561104157611041611983565b141561109a5760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202773272076616c604482015261756560f01b6064820152608401610417565b60048160048111156110ae576110ae611983565b14156111075760405162461bcd60e51b815260206004820152602260248201527f45434453413a20696e76616c6964207369676e6174757265202776272076616c604482015261756560f01b6064820152608401610417565b50565b6000807f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a083111561114157506000905060036111ee565b8460ff16601b1415801561115957508460ff16601c14155b1561116a57506000905060046111ee565b6040805160008082526020820180845289905260ff881692820192909252606081018690526080810185905260019060a0016020604051602081039080840390855afa1580156111be573d6000803e3d6000fd5b5050604051601f1901519150506001600160a01b0381166111e7576000600192509250506111ee565b9150600090505b94509492505050565b6000806001600160ff1b03831660ff84901c601b016112188782888561110a565b935093505050935093915050565b80356001600160a01b038116811461123d57600080fd5b919050565b60008083601f84011261125457600080fd5b50813567ffffffffffffffff81111561126c57600080fd5b602083019150836020828501011115610f4557600080fd5b600082601f83011261129557600080fd5b813567ffffffffffffffff808211156112b0576112b06119af565b604051601f8301601f19908116603f011681019082821181831017156112d8576112d86119af565b816040528381528660208588010111156112f157600080fd5b836020870160208301376000602085830101528094505050505092915050565b803563ffffffff8116811461123d57600080fd5b6000806000806080858703121561133b57600080fd5b61134485611226565b93506020850135925061135960408601611226565b9150606085013567ffffffffffffffff81111561137557600080fd5b61138187828801611284565b91505092959194509250565b600080604083850312156113a057600080fd5b6113a983611226565b91506113b760208401611311565b90509250929050565b6000806000606084860312156113d557600080fd5b6113de84611226565b92506113ec60208501611311565b9150604084013567ffffffffffffffff81111561140857600080fd5b61141486828701611284565b9150509250925092565b6000806000806060858703121561143457600080fd5b843567ffffffffffffffff8082111561144c57600080fd5b818701915087601f83011261146057600080fd5b81358181111561146f57600080fd5b8860208260051b850101111561148457600080fd5b6020830196508095505061149a60208801611226565b935060408701359150808211156114b057600080fd5b5061138187828801611284565b6000602082840312156114cf57600080fd5b5035919050565b600080600080608085870312156114ec57600080fd5b84359350602085013560ff8116811461150457600080fd5b93969395505050506040820135916060013590565b6000806020838503121561152c57600080fd5b823567ffffffffffffffff81111561154357600080fd5b61154f85828601611242565b90969095509350505050565b60008060006040848603121561157057600080fd5b833567ffffffffffffffff8082111561158857600080fd5b61159487838801611242565b909550935060208601359150808211156115ad57600080fd5b5061141486828701611284565b600080604083850312156115cd57600080fd5b823567ffffffffffffffff808211156115e557600080fd5b6115f186838701611284565b9350602085013591508082111561160757600080fd5b5061161485828601611284565b9150509250929050565b60008060006060848603121561163357600080fd5b833567ffffffffffffffff8082111561164b57600080fd5b61165787838801611284565b945061166560208701611311565b935060408601359150808211156115ad57600080fd5b6000815160005b8181101561169c5760208185018101518683015201611682565b818111156116ab576000828601525b509290920192915050565b60006001600160fb1b038411156116cc57600080fd5b8360051b8086843760609390931b6001600160601b031916919092019081526014019392505050565b8183823760009101908152919050565b6000611711828561167b565b9283525050602001919050565b600061173361172d838661167b565b8461167b565b949350505050565b60e083901b6001600160e01b03191681526000611733600483018461167b565b83815260406020820152816040820152818360608301376000818301606090810191909152601f909201601f1916010192915050565b60208082526026908201527f476f7665726e61626c653a2063616c6c6572206973206e6f742074686520676f6040820152653b32b93737b960d11b606082015260800190565b6020808252602f908201527f7369676e656420627920676f7665726e6f723a204e6f742076616c696420736960408201526e3390333937b69033b7bb32b93737b960891b606082015260800190565b6020808252600d908201526c496e76616c6964206e6f6e636560981b604082015260600190565b60208082526019908201527f4e6f6e6365206d75737420696e6372656d656e74206279203100000000000000604082015260600190565b6000808585111561189457600080fd5b838611156118a157600080fd5b5050820193919092039150565b600063ffffffff8083168185168083038211156118cd576118cd61196d565b01949350505050565b6001600160f01b031981358181169160028510156118fe5780818660020360031b1b83161692505b505092915050565b803560208310156106c457600019602084900360031b1b1692915050565b6001600160e01b031981358181169160048510156118fe5760049490940360031b84901b1690921692915050565b60006000198214156119665761196661196d565b5060010190565b634e487b7160e01b600052601160045260246000fd5b634e487b7160e01b600052602160045260246000fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052604160045260246000fdfe19457468657265756d205369676e6564204d6573736167653a0a333200000000a2646970667358221220da56d9213db53a8ac4b7da3a19999fb1924c904fb4e8d2a43c4abf70323a1f8464736f6c63430008050033";

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
    initialGovernor: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<SignatureBridge> {
    return super.deploy(
      initialGovernor,
      overrides || {}
    ) as Promise<SignatureBridge>;
  }
  getDeployTransaction(
    initialGovernor: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(initialGovernor, overrides || {});
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
