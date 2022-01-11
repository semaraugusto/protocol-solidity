require('dotenv').config();
import { ethers } from 'ethers';
import { addRelayer } from './addRelayer';

const providerRinkeby = new ethers.providers.JsonRpcProvider(`https://rinkeby.infura.io/v3/fff68ca474dd4764a8d54dd14fa5519e`);
const walletRinkeby = new ethers.Wallet(process.env.PRIVATE_KEY!, providerRinkeby);
const providerPolygon = new ethers.providers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com/');
const walletPolygon = new ethers.Wallet(process.env.PRIVATE_KEY!, providerPolygon);
const providerRopsten = new ethers.providers.JsonRpcProvider(`https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`);
const walletRopsten = new ethers.Wallet(process.env.PRIVATE_KEY!, providerRopsten);
const providerGoerli = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161`);
const walletGoerli = new ethers.Wallet(process.env.PRIVATE_KEY!, providerGoerli);
const providerOptimism = new ethers.providers.JsonRpcProvider('https://kovan.optimism.io');
const walletOptimism = new ethers.Wallet(process.env.PRIVATE_KEY!, providerOptimism);
const providerArbitrum = new ethers.providers.JsonRpcProvider('https://rinkeby.arbitrum.io/rpc');
const walletArbitrum = new ethers.Wallet(process.env.PRIVATE_KEY!, providerArbitrum);

async function run() { 
  await addRelayer('0x4ce15F1C42E6964ebD3D5f804c6285882740e3Ac', '0x48D41E139D3133F1879Ce5080b9C2CB4878332c2', walletRinkeby);
  await addRelayer('0xca2c45fe334fBb9d9356AaB291842b964DB9B0E3', '0x48D41E139D3133F1879Ce5080b9C2CB4878332c2', walletPolygon);
  await addRelayer('0x42389fEe65aF01c42B6c8d72aBf376E443F6D4b8', '0x48D41E139D3133F1879Ce5080b9C2CB4878332c2', walletRopsten);
  await addRelayer('0x6464BCd6eD9E73B4858bcD519DC89f257B23b8B6', '0x48D41E139D3133F1879Ce5080b9C2CB4878332c2', walletGoerli);
  await addRelayer('0x434488077030b430c2b60E1ec8B1713eC01Cc660', '0x48D41E139D3133F1879Ce5080b9C2CB4878332c2', walletOptimism);
  await addRelayer('0xc5084b0f1b0b344894EF2c9D810633103616E80c', '0x48D41E139D3133F1879Ce5080b9C2CB4878332c2', walletArbitrum);
}

run();
