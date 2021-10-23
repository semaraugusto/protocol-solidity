/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const assert = require('assert');
import { ethers } from 'hardhat';

// Convenience wrapper classes for contract classes
import BridgeSide from '../../lib/darkwebb/BridgeSide';
import Anchor from '../../lib/darkwebb/Anchor';
import MintableToken from '../../lib/darkwebb/MintableToken';
import { getVerifierFactory, getHasherFactory } from '../../lib/darkwebb/utils';

describe('BridgeSideConstruction', () => {

  it('should create the bridge side which can affect the anchor state', async () => {
    const signers = await ethers.getSigners();
    const admin = signers[1];
    const relayer = signers[1];
    const recipient = signers[1];

    const bridgeSide = BridgeSide.createBridgeSide([relayer.address], 1, 0, 100, admin);

    // Create the Hasher and Verifier for the chain
    const hasherFactory = await getHasherFactory(admin);
    let hasherInstance = await hasherFactory.deploy({ gasLimit: '0x5B8D80' });
    await hasherInstance.deployed();

    const verifierFactory = await getVerifierFactory(admin);
    let verifierInstance = await verifierFactory.deploy({ gasLimit: '0x5B8D80' });
    await verifierInstance.deployed();

    const tokenInstance = await MintableToken.createToken('testToken', 'TEST', admin);
    await tokenInstance.mintTokens(admin.address, '100000000000000000000000');

    const anchor = await Anchor.createAnchor(
      verifierInstance.address,
      hasherInstance.address,
      '1000000000000',
      30,
      tokenInstance.contract.address,
      admin.address,
      admin.address,
      admin.address,
      5,
      admin
    );

    await tokenInstance.approveSpending(anchor.contract.address);
  })

})