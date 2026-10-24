import { network } from "hardhat";

const { ethers } = await network.connect();

const provider = ethers.provider;

const txHash =
  "0x4ef3ebfec1c16177d52a53ae1e88ea35eac8476646dfacad0105eedaeb61028d";

const receipt = await provider.getTransactionReceipt(txHash);

if (!receipt) {
  console.log("Transaction receipt not found on Sepolia.");
} else {
  console.log("Transaction status:", receipt.status);
  console.log("Transaction block:", receipt.blockNumber);
  console.log("Contract address:", receipt.to);
  console.log("Transaction hash:", receipt.hash);
}