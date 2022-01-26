/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later-only
 */

import { artifacts, contract, web3 } from "hardhat";
import { getChainIdType } from "packages/utils/lib";
const TruffleAssert = require('truffle-assertions');
const BridgeContract = artifacts.require("SignatureBridge");

contract('SignatureBridge - [constructor]', async accounts => {
  const chainID = getChainIdType(1);
  const initialRelayers = accounts.slice(0, 3);
  const initialRelayerThreshold = 2;
  let ADMIN_ROLE;
  let BridgeInstance;

  const BN = (num) => {
    return web3.utils.toBN(num);
  };

  beforeEach(async () => {
    BridgeInstance = await BridgeContract.new(chainID, initialRelayers, initialRelayerThreshold, 0, 100);
    ADMIN_ROLE = await BridgeInstance.DEFAULT_ADMIN_ROLE()
  });

  it('Bridge should not allow to set initialRelayerThreshold above 255', async () => {
    return TruffleAssert.reverts(BridgeContract.new(chainID, initialRelayers, 256, 0, 100), "value does not fit in 8 bits");
  });

  it('Bridge should not allow to set fee above 2**128 - 1', async () => {
    return TruffleAssert.reverts(BridgeContract.new(
      chainID, initialRelayers, initialRelayerThreshold, BN(2).pow(BN(128)), 100), "value does not fit in 128 bits");
  });

  it('Bridge should not allow to set expiry above 2**40 - 1', async () => {
    return TruffleAssert.reverts(BridgeContract.new(chainID, initialRelayers, initialRelayerThreshold, 0, BN(2).pow(BN(40))), "value does not fit in 40 bits");
  });
});
