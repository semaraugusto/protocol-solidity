require('dotenv').config();
import { ethers } from 'ethers';
import { mintCompTokens } from './tokens/mintCompTokens';
import { getTokenBalance } from './tokens/getTokenBalance';

let provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

async function run() {
  // const tokenTx = await mintCompTokens('0x9d609F54536Cef34f5F612BD976ca632F1fa208E', "0xc2eb6995266649D2C8bbD228fc41e232C8BEca3C", '1000000000000000000000', wallet);
  const tokenTx = await getTokenBalance('0x9d609F54536Cef34f5F612BD976ca632F1fa208E', '0xc2eb6995266649D2C8bbD228fc41e232C8BEca3C', provider);
  
  console.log(tokenTx);
}

run();

