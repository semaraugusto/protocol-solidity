/**
 * Copyright 2021 Webb Technologies
 * SPDX-License-Identifier: GPL-3.0-or-later-only
 */
const TruffleAssert = require('truffle-assertions');
const assert = require('assert');

const Anchor = artifacts.require("Anchor");
const Hasher = artifacts.require("PoseidonT3");
const Verifier = artifacts.require('Verifier');
const Verifier2 = artifacts.require('Verifier2');
const Verifier3 = artifacts.require('Verifier3');
const Verifier4 = artifacts.require('Verifier4');
const Verifier5 = artifacts.require('Verifier5');
const Verifier6 = artifacts.require('Verifier6');
const Token = artifacts.require("ERC20Mock");

 // This test does NOT include all getter methods, just
 // getters that should work with only the constructor called
 contract('LinkableAnchor - [update edges]', async accounts => {
  let AnchorInstance;
  let hasher;
  let v2, v3, v4, v5, v6;
  let verifier;
  let token;
  const merkleTreeHeight = 31;
  const sender = accounts[0];
  let tokenDenomination = '1000000000000000000' // 1 ether
  // function stubs
  let setHandler;
  let setBridge;
  let addEdge;
  let updateEdge;
  const MAX_EDGES = 1;

  beforeEach(async () => {
    hasher = await Hasher.new();
    await Promise.all([
      Verifier2.new().then(instance => v2 = instance),
      Verifier3.new().then(instance => v3 = instance),
      Verifier4.new().then(instance => v4 = instance),
      Verifier5.new().then(instance => v5 = instance),
      Verifier6.new().then(instance => v6 = instance),
    ]);
    verifier = await Verifier.new(
      v2.address,
      v3.address,
      v4.address,
      v5.address,
      v6.address
    );
    token = await Token.new();
    await token.mint(sender, tokenDenomination);
    AnchorInstance = await Anchor.new(
      verifier.address,
      hasher.address,
      tokenDenomination,
      merkleTreeHeight,
      token.address,
      accounts[0],
      accounts[0],
      accounts[0],
      MAX_EDGES,
    );

    setHandler = (handler, sender) => AnchorInstance.setHandler(handler, {
      from: sender
    });

    setBridge = (bridge, sender) => AnchorInstance.setBridge(bridge, {
      from: sender
    });

    addEdge = (edge, sender) => AnchorInstance.addEdge(
      edge.sourceChainID,
      edge.root,
      edge.latestLeafIndex,
      { from: sender }
    )

    updateEdge = (edge, sender) => AnchorInstance.updateEdge(
      edge.sourceChainID,
      edge.root,
      edge.latestLeafIndex,
      { from: sender }
    )
  });

  it('LinkablechorAn should have same bridge & admin & handler on init', async () => {
    assert(await AnchorInstance.admin() == accounts[0]);
    assert(await AnchorInstance.bridge() == accounts[0]);
    assert(await AnchorInstance.handler() == accounts[0]);
  });

  it('LinkableAnchor handler should only be updatable by bridge only', async () => {
    await TruffleAssert.passes(setHandler(accounts[1], accounts[0]));
    await TruffleAssert.reverts(setHandler(accounts[0], accounts[1]), "sender is not the bridge");
  });

  it('LinkableAnchor bridge should only be updatable by admin only', async () => {
    await TruffleAssert.passes(setBridge(accounts[1], accounts[0]));
    await TruffleAssert.reverts(setBridge(accounts[0], accounts[1]), "sender is not the admin");
  });

  it('LinkableAnchor edges should be modifiable by handler only (checks newHeight > oldHeight)', async () => {
    const edge = {
      sourceChainID: '0x01',
      root: '0x1111111111111111111111111111111111111111111111111111111111111111',
      latestLeafIndex: 100,
    };
    const edgeUpdated = {
      sourceChainID: '0x01',
      root: '0x2222111111111111111111111111111111111111111111111111111111111111',
      latestLeafIndex: 101,
    };

    await TruffleAssert.passes(addEdge(edge, accounts[0]));
    await TruffleAssert.passes(updateEdge(edgeUpdated, accounts[0]));
    await TruffleAssert.reverts(updateEdge(edgeUpdated, accounts[1]), "sender is not the handler");
  });

  it('LinkableAnchor edges should be modifiable only if edge exists beforehand', async () => {
    const edge = {
      sourceChainID: '0x01',
      root: '0x1111111111111111111111111111111111111111111111111111111111111111',
      latestLeafIndex: 100,
    };
    const edgeUpdated = {
      sourceChainID: '0x02',
      root: '0x2222111111111111111111111111111111111111111111111111111111111111',
      latestLeafIndex: 101,
    };
    await TruffleAssert.passes(addEdge(edge, accounts[0]));
    await TruffleAssert.reverts(updateEdge(edgeUpdated, accounts[0]));
  });

  it('getLatestNeighborRoots should return updated values', async () => {
    const edge = {
      sourceChainID: '0x01',
      root: '0x1111111111111111111111111111111111111111111111111111111111111111',
      latestLeafIndex: 100,
    };
    const edgeUpdated = {
    sourceChainID: '0x01',
      root: '0x2222111111111111111111111111111111111111111111111111111111111111',
      latestLeafIndex: 101,
    };
    await TruffleAssert.passes(addEdge(edge, accounts[0]));

    const roots = await AnchorInstance.getLatestNeighborRoots();
    assert.strictEqual(roots.length, 1);
    assert.strictEqual(roots[0], edge.root);

    await TruffleAssert.passes(updateEdge(edgeUpdated, accounts[0]));

    const rootsUpdated = await AnchorInstance.getLatestNeighborRoots();
    assert.strictEqual(rootsUpdated.length, 1);
    assert.strictEqual(rootsUpdated[0], edgeUpdated.root);
  });

  it('Updating edge should emit correct EdgeUpdate event', async () => {
    const edge = {
      sourceChainID: '0x01',
      root: '0x1111111111111111111111111111111111111111111111111111111111111111',
      latestLeafIndex: 100,
    };
    const edgeUpdated = {
      sourceChainID: '0x01',
      root: '0x2222111111111111111111111111111111111111111111111111111111111111',
      latestLeafIndex: 101,
    };
    await addEdge(edge, accounts[0]);
    const result = await updateEdge(edgeUpdated, accounts[0]);
    TruffleAssert.eventEmitted(result, 'EdgeUpdate', (ev) => {
      return ev.chainID == parseInt(edgeUpdated.sourceChainID, 16) &&
      ev.height == edgeUpdated.height && ev.merkleRoot == edgeUpdated.root
    });
  });
});
