import { network } from "hardhat";
import artifact from "../artifacts/contracts/ProductVerification.sol/ProductVerification.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

async function main() {
  const { ethers } = await network.connect();

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    artifact.abi,
    (await ethers.getSigners())[0]
  );

  const productId = "CT-TEST-004";
  const product = await contract.getProduct(productId);

  const storedHash = product[1];

  const originalResult = await contract.verifyProduct(
    productId,
    storedHash
  );

  const tamperedHash = storedHash + "-MODIFIED";

  const tamperedResult = await contract.verifyProduct(
    productId,
    tamperedHash
  );

  console.log("Product ID:", productId);
  console.log("Registered:", product[4]);
  console.log("Original hash verification:", originalResult[0]);
  console.log("Modified hash verification:", tamperedResult[0]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});