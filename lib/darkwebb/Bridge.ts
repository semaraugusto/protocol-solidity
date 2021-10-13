import { ethers } from "ethers";
import BridgeSide from './BridgeSide';
import Anchor, { AnchorDeposit } from './Anchor';
import AnchorHandler from "./AnchorHandler";
import MintableToken from "./MintableToken";

const HasherContract = require('../../artifacts/contracts/trees/Hashers.sol/PoseidonT3.json');
const VerifierContract = require('../../artifacts/contracts/verifiers/Verifier2.sol/Verifier2.json');

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

type AnchorIdentifier = {
  tokenName: string;
  anchorSize: ethers.BigNumberish;
  chainId: number;
};

type NewAssetDetails = {
  assetName: string;
  assetSymbol: string;
};

export type NewAssetInput = {
  // The name of the asset that will be created for the bridge.
  // It will be ERC20 compliant - 18 decimals
  asset: NewAssetDetails;
  // An array for anchors which should be created with given size for the asset
  anchorSizes: ethers.BigNumberish[];
};

export type ExistingAssetInput = {
  // A record of chainId => address
  asset: Record<number, string>;
  anchorSizes: ethers.BigNumberish[];
}

// Users define an input for a completely new bridge
export type BridgeInput = {

  // The tokens and anchors which should be supported after deploying from this bridge input
  anchorInputs: (NewAssetInput|ExistingAssetInput)[],

  // The IDs of the chains to deploy to
  chainIDs: number[],
};

export type BridgeConfig = {

  // The addresses of tokens available to be transferred over this bridge config
  // chainID => tokenAddresses
  tokenAddresses: Map<number, string[]>;

  // The addresses of the anchors for a token
  // {anchorIdentifier} => anchorAddress
  anchorAddresses: Map<AnchorIdentifier, string>;

  // The addresses of the Bridge contracts (bridgeSides) to interact with
  bridgeSideAddresses: Map<number, string>;
}

// A bridge is 
class Bridge {
  private constructor(
    // Mapping of chainId => bridgeSide
    public bridgeSides: Map<number, BridgeSide>,

    // Mapping of resourceID => linkedAnchor[]; so we know which
    // anchors need updating when the anchor for resourceID changes state.
    public linkedAnchors: Map<string, Anchor[]>,

    // Mapping of anchorIdString => Anchor for easy anchor access
    public anchors: Map<string, Anchor>,
  ) {}

  public static createAnchorIdString(anchorIdentifier: AnchorIdentifier): string {
    return `${anchorIdentifier.chainId.toString()}-${anchorIdentifier.tokenName}-${anchorIdentifier.anchorSize.toString()}`
  }

  // Takes as input a 2D array [[anchors to link together], [...]]
  // And returns a map of resourceID => linkedAnchor[]
  public static async createLinkedAnchorMap(createdAnchors: Anchor[][]): Promise<Map<string, Anchor[]>> {
    let linkedAnchorMap = new Map<string, Anchor[]>();
    for (let groupedAnchors of createdAnchors) {
      groupedAnchors.forEach(async (entry, key) => {
        // create the resourceID of this anchor
        let resourceID = await entry.createResourceID();
        let linkedAnchors = [];
        for (let i = 0; i < groupedAnchors.length; i++) {
          if (i != key) {
            linkedAnchors.push(groupedAnchors[i]);
          }
        }

        // insert the linked anchors into the linked map
        linkedAnchorMap.set(resourceID, linkedAnchors);
      })
    }
    return linkedAnchorMap;
  }

  public static async deployBridge(bridgeInput: BridgeInput, deployers: DeployerConfig): Promise<Bridge> {
    
    let tokenAddresses: Map<number, string[]> = new Map();
    let bridgeSides: Map<number, BridgeSide> = new Map();
    let anchors: Map<string, Anchor> = new Map();
    // createdAnchors have the form of [[Anchors created on chainID], [...]]
    // and anchors in the subArrays of thhe same index should be linked together
    let createdAnchors: Anchor[][] = [];

    for (let chainID of bridgeInput.chainIDs) {
      const adminAddress = await deployers[chainID].getAddress();

      // Create the bridgeSide
      const bridgeInstance = await BridgeSide.createBridgeSide(
        [adminAddress],
        1,
        0,
        100,
        deployers[chainID],
      );

      bridgeSides.set(chainID, bridgeInstance);

      // Create the Hasher and Verifier for the chain
      const hasherFactory = await getHasherFactory(deployers[chainID]);
      let hasherInstance = await hasherFactory.deploy({ gasLimit: '0x5B8D80' });
      await hasherInstance.deployed();

      const verifierFactory = await getVerifierFactory(deployers[chainID]);
      let verifierInstance = await verifierFactory.deploy({ gasLimit: '0x5B8D80' });
      await verifierInstance.deployed();

      // loop through all the tokens defined in the config
      for (let token of bridgeInput.anchorInputs) {
        let originalToken: MintableToken | null = null;
        let tokenInstance: MintableToken;
        if ("assetName" in token.asset) {
          tokenInstance = await MintableToken.createToken(token.asset.assetName, token.asset.assetSymbol, deployers[chainID]);
        }
        else {
          // Should create the new webbToken, and pass this address down to the Anchor.
          // Set some flag on the Anchor to mark it to use wrapAndDeposit / withdrawAndUnwrap
          originalToken = await MintableToken.tokenFromAddress(token.asset[chainID], deployers[chainID]);
          tokenInstance = await MintableToken.createToken(`webb${originalToken.name}`, `webb${originalToken.symbol}`, deployers[chainID])
        }

        // append each token
        const tokenAddressArray = tokenAddresses.get(chainID);
        if (!tokenAddressArray) {
          tokenAddresses.set(chainID, [tokenInstance.contract.address]);
        } else {
          tokenAddresses.set(chainID, [...tokenAddressArray, tokenInstance.contract.address]);
        }
        
        let chainGroupedAnchors: Anchor[] = [];

        // loop through all the anchor sizes on the token
        for (let anchorSize of token.anchorSizes) {
          const anchorInstance = await Anchor.createAnchor(
            verifierInstance.address,
            hasherInstance.address,
            anchorSize,
            30,
            tokenInstance.contract.address,
            adminAddress,
            adminAddress,
            adminAddress,
            deployers[chainID]);

          // grant minting rights to the anchor
          await tokenInstance.grantMinterRole(anchorInstance.contract.address); 

          if (originalToken != null) {
            // Set the anchor to wrap/unwrap mode.
          }

          chainGroupedAnchors.push(anchorInstance);
          anchors.set(
            Bridge.createAnchorIdString({tokenName: tokenInstance.name, anchorSize, chainId: chainID}),
            anchorInstance
          );
        }

        Bridge.setPermissions(bridgeInstance, chainGroupedAnchors);
        createdAnchors.push(chainGroupedAnchors);
      }
    }

    // All anchors created, massage data to group anchors which should be linked together
    let groupLinkedAnchors: Anchor[][] = [];

    // all subarrays will have the same number of elements
    for(let i=0; i<createdAnchors[0].length; i++) {
      let linkedAnchors: Anchor[] = [];
      for(let j=0; j<createdAnchors.length; j++) {
        linkedAnchors.push(createdAnchors[j][i]);
      }
      groupLinkedAnchors.push(linkedAnchors);
    }

    // finally, link the anchors
    const linkedAnchorMap = await Bridge.createLinkedAnchorMap(groupLinkedAnchors);
    return new Bridge(bridgeSides, linkedAnchorMap, anchors);
  }

  // The setPermissions method accepts initialized bridgeSide and anchors.
  // it creates the anchor handler and sets the appropriate permissions
  // for the bridgeSide/anchorHandler/anchor
  public static async setPermissions(bridgeSide: BridgeSide, anchors: Anchor[]): Promise<void> {

    let resourceIDs: string[] = [];
    let anchorAddresses: string[] = [];
    anchors.forEach(async (anchor) => {
      resourceIDs.push(await anchor.createResourceID());
      anchorAddresses.push(anchor.contract.address);
    })

    const handler = await AnchorHandler.createAnchorHandler(bridgeSide.contract.address, resourceIDs, anchorAddresses, bridgeSide.admin);
    await bridgeSide.setAnchorHandler(handler);
    
    anchors.forEach(async (anchor) => {
      await bridgeSide.connectAnchor(anchor);
    })
  }

  /** Update the state of BridgeSides and Anchors, when
  *** state changes for the @param linkedAnchor 
  **/
  public async updateLinkedAnchors(linkedAnchor: Anchor) {
    // Find the bridge sides that are connected to this Anchor
    const changedChainID = await linkedAnchor.signer.getChainId();
    const bridgeSide = this.bridgeSides.get(changedChainID);
    if (!bridgeSide) {
      return;
    }
    const linkedResourceID = await linkedAnchor.createResourceID();
    const anchorsToUpdate = this.linkedAnchors.get(linkedResourceID);
    if (!anchorsToUpdate) {
      return;
    }

    // update the sides
    anchorsToUpdate.forEach((anchor) => {
      bridgeSide.voteProposal(linkedAnchor, anchor);
      bridgeSide.executeProposal(linkedAnchor, anchor);
    })
  };

  public async update(chainId: number, tokenName: string, anchorSize: ethers.BigNumberish) {
    const anchor = this.getAnchor(chainId, tokenName, anchorSize);
    if (!anchor) {
      return;
    }
    await this.updateLinkedAnchors(anchor);
  }

  public getBridgeSide(chainID: number) {
    return this.bridgeSides.get(chainID);
  }

  public getAnchor(chainID: number, tokenName: string, anchorSize: ethers.BigNumberish) {
    return this.anchors.get(Bridge.createAnchorIdString({tokenName, anchorSize, chainId: chainID}));
  }

  public exportConfig() {

  }

  public async deposit(destinationChainId: number, bridgeTokenAddress: string, anchorSize: ethers.BigNumberish, signer: ethers.Signer) {
    const chainId = await signer.getChainId();
    const anchor = this.getAnchor(chainId, bridgeTokenAddress, anchorSize);

    if (!anchor) {
      return;
    }

    // return some error code value for deposit note if signer invalid
    if (!(await anchor.setSigner(signer))) {
      throw new Error("Invalid signer for deposit, check the signer's chainID");
    }
    const deposit = anchor.deposit(destinationChainId);
    await this.updateLinkedAnchors(anchor);
    return deposit;
  }

  public async withdraw(
    depositInfo: AnchorDeposit,
    tokenName: string,
    anchorSize: ethers.BigNumberish,
    recipient: string,
    relayer: string,
    signer: ethers.Signer
  ) {
    const anchor = this.getAnchor(Number(depositInfo.deposit.chainID.toString()), tokenName, anchorSize);

    if (!anchor) {
      return false;
    }

    if (!(await anchor.setSigner(signer))) {
      return false;
    }
    await anchor.withdraw(depositInfo.deposit, depositInfo.index, recipient, relayer, BigInt(0), BigInt(0));
    return true;
  }
}

export default Bridge;
