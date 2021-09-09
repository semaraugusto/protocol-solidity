require('dotenv').config({ path: '../.env' });
import { ethers } from 'ethers';
import { AnchorBase2__factory } from '../../typechain/factories/AnchorBase2__factory';
import { ERC20__factory } from '../../typechain/factories/ERC20__factory';
import { approveTokenSpend } from './tokens/approveTokenSpend';
import { getTokenAllowance } from './tokens/getTokenAllowance';
import { Note, NoteGenInput } from '@webb-tools/sdk-mixer/note';
const helpers = require('../../test/helpers');

export async function depositAnchor(anchorAddress: string, tokenAddress: string, passedWallet: ethers.Signer) {
  const chainId = await passedWallet.getChainId();
  const token = ERC20__factory.connect(tokenAddress, passedWallet);
  const name = await token.name();
  const walletAddress = await passedWallet.getAddress();
  const deposit = helpers.generateDeposit(chainId);
  const secrets = helpers.toFixedHex(deposit.nullifier) + helpers.toFixedHex(deposit.secret).substr(2) + helpers.toFixedHex(deposit.chainID).substr(2);
  console.log(secrets);

  const anchor = AnchorBase2__factory.connect(anchorAddress, passedWallet);
  const anchorDenomination = (await anchor.functions.denomination())[0];
  const noteInput: NoteGenInput = {
    prefix: 'webb.mix',
    chain: String(chainId),
    amount: String(anchorDenomination),
    denomination: '18',
    hashFunction: 'Poseidon',
    curve: 'Bn254',
    backend: 'Circom',
    version: 'v1',
    tokenSymbol: name,
    secrets: secrets,
  };

  const note = await Note.generateNote(noteInput);
  console.log(note.serialize());

  console.log(`anchor denomination: ${anchorDenomination}`);
  const tokenAllowance = await getTokenAllowance(tokenAddress, walletAddress, anchorAddress, passedWallet.provider!);
  const tokenBig = ethers.BigNumber.from(tokenAllowance);
  console.log(`tokenBig: ${tokenBig}`);

  if (tokenBig.lt(anchorDenomination)) {
    // approve (infinite) tokens for the anchor
    console.log('less than approved amount');
    let tx = await approveTokenSpend(tokenAddress, anchorAddress, passedWallet);
  }

  // There is enough to make the call.
  console.log(`depositing with arg: ${helpers.toFixedHex(deposit.commitment)} `);
  let tx = await anchor.deposit(helpers.toFixedHex(deposit.commitment), { from: walletAddress, gasLimit: '0x989680' });
  let receipt = await tx.wait();
  console.log(receipt);

  return deposit;
}
