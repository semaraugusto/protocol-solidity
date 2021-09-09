require('dotenv').config({ path: '../.env' });
import { ethers } from 'ethers';
import { depositAnchor } from './depositAnchor';
import { getAnchorLeaves } from './getAnchorLeaves';
import { Note } from '@webb-tools/sdk-mixer';
import { withdrawAnchor } from './withdrawAnchor';

let provider = new ethers.providers.JsonRpcProvider(`${process.env.ENDPOINT}`);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

async function run() {

  // const note = "webb-4-0xa1c27f8a13a7dffa81366085d788ef1d67a321e8e1bb4442c959cab39c1368-0xe373319a3950041486348849a80c78ade17434ffd6515040bff22f317dd832";

  // const deposit = Note.deserialize(note);
  // console.log(deposit);

  // const withdraw = await withdrawAnchor("0x5aCF1A99945AeC335309Ff0662504c8ebbf5c000", "0xD6F1E78B5F1Ebf8fF5a60C9d52eabFa73E5c5220", note, "0x48D41E139D3133F1879Ce5080b9C2CB4878332c2", wallet);
  // console.log(withdraw);

  // const deposit = await depositAnchor("0x5aCF1A99945AeC335309Ff0662504c8ebbf5c000", "0xD6F1E78B5F1Ebf8fF5a60C9d52eabFa73E5c5220", wallet);
  // console.log(deposit);
}

run();
