import { ethers } from "ethers";
import BridgeSide from './BridgeSide';
import Anchor, { AnchorDeposit } from './Anchor';
import AnchorHandler from "./AnchorHandler";
import MintableToken from "./MintableToken";
import { getHasherFactory, getVerifierFactory } from './utils';

// Deployer config matches the chainId to the signer for that chain
export type DeployerConfig = Record<number, ethers.Signer>;

type AnchorIdentifier = {
  tokenName: string;
  anchorSize: ethers.BigNumberish;
  chainId: number;
};

type TokenIdentifier = {
  tokenName: string;
  chainId: number;
}

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
  // {tokenIdentifier} => tokenAddresses
  tokenAddresses: Map<string, string[]>;

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

    public tokenAddresses: Map<string, string>,

    // Mapping of resourceID => linkedAnchor[]; so we know which
    // anchors need updating when the anchor for resourceID changes state.
    public linkedAnchors: Map<string, Anchor[]>,

    // Mapping of anchorIdString => Anchor for easy anchor access
    public anchors: Map<string, Anchor>,
  ) {}

  public static createAnchorIdString(anchorIdentifier: AnchorIdentifier): string {
    return `${anchorIdentifier.chainId.toString()}-${anchorIdentifier.tokenName}-${anchorIdentifier.anchorSize.toString()}`;
  }

  public static createTokenIdString(tokenIdentifier: TokenIdentifier): string {
    return `${tokenIdentifier.tokenName}-${tokenIdentifier.chainId}`;
  }

  // Takes as input a 2D array [[anchors to link together], [...]]
  // And returns a map of resourceID => linkedAnchor[]
  public static async createLinkedAnchorMap(createdAnchors: Anchor[][]): Promise<Map<string, Anchor[]>> {
    let linkedAnchorMap = new Map<string, Anchor[]>();
    for (let groupedAnchors of createdAnchors) {
      for (let i=0; i<groupedAnchors.length; i++) {
        // create the resourceID of this anchor
        let resourceID = await groupedAnchors[i].createResourceID();
        let linkedAnchors = [];
        for (let j = 0; j < groupedAnchors.length; j++) {
          if (i != j) {
            linkedAnchors.push(groupedAnchors[j]);
          }
        }

        // insert the linked anchors into the linked map
        linkedAnchorMap.set(resourceID, linkedAnchors);
      }
    }

    return linkedAnchorMap;
  }

  public static async deployBridge(bridgeInput: BridgeInput, deployers: DeployerConfig): Promise<Bridge> {
    
    let tokenAddresses: Map<string, string> = new Map();
    let bridgeSides: Map<number, BridgeSide> = new Map();
    let anchors: Map<string, Anchor> = new Map();
    // createdAnchors have the form of [[Anchors created on chainID], [...]]
    // and anchors in the subArrays of thhe same index should be linked together
    let createdAnchors: Anchor[][] = [];

    for (let chainID of bridgeInput.chainIDs) {
      console.log('chain ID for the bridge input: ', chainID);
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
          console.log('inside create fresh token');
          tokenInstance = await MintableToken.createToken(token.asset.assetName, token.asset.assetSymbol, deployers[chainID]);
        }
        else {
          // Should create the new webbToken, and pass this address down to the Anchor.
          // Set some flag on the Anchor to mark it to use wrapAndDeposit / withdrawAndUnwrap
          originalToken = await MintableToken.tokenFromAddress(token.asset[chainID], deployers[chainID]);
          tokenInstance = await MintableToken.createToken(`webb${originalToken.name}`, `webb${originalToken.symbol}`, deployers[chainID])
        }

        // append each token
        tokenAddresses.set(
          Bridge.createTokenIdString({tokenName: tokenInstance.name, chainId: chainID}),
          tokenInstance.contract.address
        )
        
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

        await Bridge.setPermissions(bridgeInstance, chainGroupedAnchors);
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
    return new Bridge(bridgeSides, tokenAddresses, linkedAnchorMap, anchors);
  }

  // The setPermissions method accepts initialized bridgeSide and anchors.
  // it creates the anchor handler and sets the appropriate permissions
  // for the bridgeSide/anchorHandler/anchor
  public static async setPermissions(bridgeSide: BridgeSide, anchors: Anchor[]): Promise<void> {

    let resourceIDs: string[] = [];
    let anchorAddresses: string[] = [];
    for (let anchor of anchors) {
      resourceIDs.push(await anchor.createResourceID());
      anchorAddresses.push(anchor.contract.address);
    }

    const handler = await AnchorHandler.createAnchorHandler(bridgeSide.contract.address, resourceIDs, anchorAddresses, bridgeSide.admin);
    await bridgeSide.setAnchorHandler(handler);
    
    for (let anchor of anchors) {
      await bridgeSide.connectAnchor(anchor);
    }
  }

  /** Update the state of BridgeSides and Anchors, when
  *** state changes for the @param linkedAnchor 
  **/
  public async updateLinkedAnchors(linkedAnchor: Anchor) {
    // Find the bridge sides that are connected to this Anchor
    const linkedResourceID = await linkedAnchor.createResourceID();
    const anchorsToUpdate = this.linkedAnchors.get(linkedResourceID);
    if (!anchorsToUpdate) {
      return;
    }

    // update the sides
    for (let anchor of anchorsToUpdate) {
      console.log('voting and executing');
      // get the bridge side which corresponds to this anchor
      const chainId = await anchor.signer.getChainId();
      const bridgeSide = this.bridgeSides.get(chainId);
      await bridgeSide!.voteProposal(linkedAnchor, anchor);
      await bridgeSide!.executeProposal(linkedAnchor, anchor);
    }
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

  public async deposit(destinationChainId: number, tokenName: string, anchorSize: ethers.BigNumberish, signer: ethers.Signer) {
    const chainId = await signer.getChainId();
    const signerAddress = await signer.getAddress();
    const anchor = this.getAnchor(chainId, tokenName, anchorSize);
    if (!anchor) {
      throw new Error("Anchor is not supported for the given token and size");
    }

    const tokenAddress = this.tokenAddresses.get(Bridge.createTokenIdString({tokenName, chainId}));

    if (!tokenAddress) {
      throw new Error("Token not supported");
    }

    // Check if appropriate balance from user
    const tokenInstance = await MintableToken.tokenFromAddress(tokenAddress, signer);
    const userTokenBalance = await tokenInstance.getBalance(signerAddress);
    if (userTokenBalance.lt(anchorSize)) {
      throw new Error("Not enough token balance");
    }

    // Approve spending if needed
    const userTokenAllowance = await tokenInstance.getAllowance(signerAddress, anchor.contract.address);
    if (userTokenAllowance.lt(anchorSize)) {
      await tokenInstance.approveSpending(anchor.contract.address);
    }

    // return some error code value for deposit note if signer invalid
    if (!(await anchor.setSigner(signer))) {
      throw new Error("Invalid signer for deposit, check the signer's chainID");
    }
    const deposit = await anchor.deposit(destinationChainId);
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
    // Construct the proof from the origin anchor
    const anchorToProve = this.getAnchor(depositInfo.originChainId, tokenName, anchorSize);
    if (!anchorToProve) {
      throw new Error("Could not find anchor to prove against");
    }
    
    const merkleProof = anchorToProve.tree.path(depositInfo.index);

    // Submit the proof and arguments on the destination anchor
    const anchorToWithdraw = this.getAnchor(Number(depositInfo.deposit.chainID.toString()), tokenName, anchorSize);

    if (!anchorToWithdraw) {
      throw new Error("Could not find anchor to withdraw from");
    }

    if (!(await anchorToWithdraw.setSigner(signer))) {
      throw new Error("Could not set signer");
    }
    await anchorToWithdraw.bridgedWithdraw(depositInfo, merkleProof, recipient, relayer, '0', '0');
    return true;
  }
}

export default Bridge;
