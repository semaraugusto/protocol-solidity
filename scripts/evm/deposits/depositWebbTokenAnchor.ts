require('dotenv').config({ path: '../.env' });
import { ethers } from 'ethers';
import { AnchorBase__factory } from '../../../typechain/factories/AnchorBase__factory';
import { approveTokenSpend } from '../tokens/approveTokenSpend';
import { getTokenAllowance } from '../tokens/getTokenAllowance';
const helpers = require('../../test/helpers');

export async function depositWebbTokenAnchor(anchorAddress: string, tokenAddress: string, passedWallet: ethers.Signer) {
  const chainId = await passedWallet.getChainId();
  const walletAddress = await passedWallet.getAddress();
  const deposit = helpers.generateDeposit(chainId);
  console.log(`commitment: ${deposit.commitment}`);

  const anchor = AnchorBase__factory.connect(anchorAddress, passedWallet);
  const anchorDenomination = (await anchor.functions.denomination())[0];
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
  let tx = await anchor.deposit(helpers.toFixedHex(deposit.commitment), { gasLimit: '0x5B8D80' });
  let receipt = await tx.wait();
  console.log(receipt);

  return receipt;
}
