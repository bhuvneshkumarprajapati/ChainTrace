import { network } from "hardhat";

const { ethers } = await network.connect();

const contract = await ethers.getContractAt(
  "ProductVerification",
  "0x7911B8774C79047F5D78A9E42189adAc9a631Ef3"
);

for (const id of ["CT-2026-019", "CT-TEST-004"]) {
  const product = await contract.getProduct(id);
  console.log(`Product ${id}:`, product);
}
