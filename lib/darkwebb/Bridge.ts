import { ethers } from "ethers";
import BridgeSide from './BridgeSide';
import Anchor from './Anchor';
import AnchorHandler from "./AnchorHandler";
import { AnchorHandler__factory } from '../../typechain/factories/AnchorHandler__factory';
import MintableToken from "./MintableToken";

const HasherContract = require('../../artifacts/contracts/trees/Hashers.sol/PoseidonT3.json');
const VerifierContract = require('../../artifacts/contracts/VerifierPoseidonBridge.sol/VerifierPoseidonBridge.json');

// An instance of this Bridge class will



// export type BridgeAnchor = {
//   /// Anchor contract addresses Map
//   anchorAddresses: ChainRecordConfig;
//   amount: string;
// };

// export type BridgeConfigEntry = {
//   asset: BridgeCurrency;
  
//   /// Map of chainID => token address 
//   tokenAddresses: Record<number, string>;
//   anchors: BridgeAnchor[];
// };

// Hasher and Verifier ABIs for deployment
async function getHasherFactory(wallet: ethers.Signer): Promise<ethers.ContractFactory> {
  const hasherContractRaw = {
    contractName: 'PoseidonT3',
    abi: HasherContract.abi,
    bytecode: HasherContract.bytecode,
  };

  const hasherFactory = new ethers.ContractFactory(hasherContractRaw.abi, hasherContractRaw.bytecode, wallet);
  return hasherFactory;
};

async function getVerifierFactory(wallet: ethers.Signer): Promise<ethers.ContractFactory> {
  const VerifierContractRaw = {
    contractName: 'Verifier',
    abi: VerifierContract.abi,
    bytecode: VerifierContract.bytecode,
  };

  const verifierFactory = new ethers.ContractFactory(VerifierContractRaw.abi, VerifierContractRaw.bytecode, wallet);
  return verifierFactory;
};

// Deployer config matches the chainId to the signer for that chain
export type DeployerConfig = Record<number, ethers.Signer>;

export type BridgedAssetInput = {
  // The name of the asset that will be created for the bridge.
  // It will be ERC20 compliant - 18 decimals
  asset: {
    assetName: string,
    assetSymbol: string,
  }
  // An array for anchors which should be created with given size for the asset
  anchorSizes: ethers.BigNumberish[]
};

// Users define an input for a completely new bridge
export type BridgeInput = {

  // The tokens and anchors which should be supported after deploying from this bridge input
  anchorInputs: BridgedAssetInput[],

  // The IDs of the chains to deploy to
  chainIDs: number[],
};

export type BridgeConfig = {

  // The addresses of tokens available to be transferred over this bridge config
  // chainID => tokenAddresses
  tokenAddresses: Record<number, string[]>;

  // The addresses of the anchors for a token
  // chainID => tokenAddress => anchorAddress[]
  anchorAddresses: Record<number, Record<string, string[]>>;

  // The addresses of the Bridge contracts (bridgeSides) to interact with
  bridgeSideAddresses: Record<number, string>;
}

// A bridge is 
class Bridge {
  private constructor(
    // Mapping of chainId => bridgeSide
    public bridgeSides: Record<number, BridgeSide>,

    // Mapping of resourceID => linkedAnchors; so we know which
    // anchors need updating when the anchor for resourceID changes state.
    public linkedAnchors: Record<string, Anchor[]>,
  ) {}

  public static createLinkedAnchorMap(map: Record<number, Record<number, Anchor>>): Record<number, Anchor[]> {

    let linkedAnchorMap = new Map<number, Anchor[]>();

    map.forEach((entry, key) => {

      // create the resourceID of this anchor
      

      // get the rest of the anchors
      let linkedAnchors: Anchor[] = (Object.values(map) as Anchor[]).filter(anchor =>
        anchor != entry
      );

      // insert the linked anchors into the linked map
      linkedAnchorMap.set(key, linkedAnchors);
    })

    return linkedAnchorMap;
  }

  public static createLinkedBridgeSideMap(map: Map<number, BridgeSide>) {
    let linkedBridgeSideMap = new Map<number, BridgeSide[]>();

    map.forEach((entry, key) => {
      // get the rest of the bridge sides
      let linkedBridgeSides: BridgeSide[] = (Object.values(map) as BridgeSide[]).filter(side =>
        side != entry
      );

      // insert the linked bridge sides into the linked map
      linkedBridgeSideMap.set(key, linkedBridgeSides);
    })

    return linkedBridgeSideMap;
  }

  public static async deploy(bridgeInput: BridgeInput, deployers: DeployerConfig): Promise<Bridge> {
    
    let tokenAddresses: Record<number, string[]> = {};
    let bridgeSide: Record<number, string> = {};

    // Start with deploying the token on both chains
    bridgeInput.chainIDs.forEach(async (chainID) => {

      const adminAddress = await deployers[chainID].getAddress();

      // Create the bridgeSide
      const bridgeInstance = await BridgeSide.createBridgeSide(
        [adminAddress],
        1,
        0,
        100,
        deployers[chainID],
      );

      bridgeSide[chainID] = bridgeInstance.contract.address;

      // Create the Hasher and Verifier for the chain
      const hasherFactory = await getHasherFactory(deployers[chainID]);
      let hasherInstance = await hasherFactory.deploy({ gasLimit: '0x5B8D80' });
      await hasherInstance.deployed();

      const verifierFactory = await getVerifierFactory(deployers[chainID]);
      let verifierInstance = await verifierFactory.deploy({ gasLimit: '0x5B8D80' });
      await verifierInstance.deployed();

      // hold reference to all anchors created for this bridgeSide
      let createdAnchors: Anchor[] = [];

      // loop through all the tokens defined in the config
      bridgeInput.anchorInputs.forEach(async (token) => {
        const tokenInstance = await MintableToken.createToken(token.asset.assetName, token.asset.assetSymbol, deployers[chainID]);

        // For each token deployed, append to the end
        tokenAddresses[chainID].push(tokenInstance.contract.address);

        // loop through all the anchor sizes on the token
        token.anchorSizes.forEach(async (anchorSize) => {
          const anchorInstance = await Anchor.createAnchor(
            verifierInstance.address,
            hasherInstance.address,
            anchorSize,
            30,
            tokenInstance.contract.address,
            bridgeInstance.contract.address,
            adminAddress,
            adminAddress,
            deployers[chainID]);

          // grant minting rights to the anchor
          await tokenInstance.grantMinterRole(anchorInstance.contract.address); 

          createdAnchors.push(anchorInstance);
        })
      })

      // pass the anchors to the bridgeSide for connecting

    })

  }

  // The link method accepts initialized bridgeSides and anchors indexed by chainID.
  // it creates the anchor handlers and links the anchors together.
  // it re-indexes anchors under the appropriate resourceID.
  // finally, it creates the instance of the Bridge.
  public static async link(bridgeSides: Map<number, BridgeSide>, anchors: Map<number, Anchor>) {

    bridgeSides.forEach(async (entry, chainID) => {
      const chainAnchor = anchors.get(chainID);
      const resourceID = await chainAnchor.createResourceID();

      const handler = await AnchorHandler.createAnchorHandler(entry.contract.address, [resourceID], [chainAnchor.contract.address], entry.admin);
      
      await entry.setHandler(handler.contract);
      await entry.connectAnchor(chainAnchor);
    })

    const linkedBridgeSides = this.createLinkedBridgeSideMap(bridgeSides);
    const linkedAnchors = this.createLinkedAnchorMap(anchors);

    return new Bridge(linkedBridgeSides, linkedAnchors);
  }

  /** Update the state of BridgeSides and Anchors, when
  *** state changes for the @param linkedAnchor 
  **/
  public async update(linkedAnchor: Anchor) {
    // Find the bridge sides that are connected to this Anchor
    const changedChainID = await linkedAnchor.signer.getChainId();
    const bridgeSide = this.bridgeSides[changedChainID];
    const linkedResourceID = await linkedAnchor.createResourceID();
    const anchorsToUpdate = this.linkedAnchors[linkedResourceID];

    // update the sides
    anchorsToUpdate.forEach((anchor) => {
      bridgeSide.voteProposal(linkedAnchor, anchor);
    })
  };

  public async getBridgeSide(chainID: number) {
    return this.bridgeSides[chainID];
  }

  public exportConfig() {

  }

}

export default Bridge;
