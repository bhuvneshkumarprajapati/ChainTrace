import { network } from "hardhat";

const { ethers } = await network.connect();

console.log("Deploying ProductVerification...");

const ProductVerification =
  await ethers.getContractFactory(
    "ProductVerification"
  );

const contract =
  await ProductVerification.deploy();

await contract.waitForDeployment();

const contractAddress =
  await contract.getAddress();

console.log(
  "ProductVerification deployed to:",
  contractAddress
);