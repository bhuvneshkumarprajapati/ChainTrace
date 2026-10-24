import { network } from "hardhat";

const { ethers } = await network.connect();

const [manufacturer, owner] = await ethers.getSigners();

const Factory = await ethers.getContractFactory("ProductVerification");
const contract = await Factory.deploy();
await contract.waitForDeployment();

const id = "CT-2026-019";
const hash = "0xd8b18c21eed27c7149e2e7a617bf5bf406b3de3c406a67c868af6c9ee4d15044";

await (await contract.registerProduct(id, hash)).wait();

let product = await contract.getProduct(id);
console.log("Registration exists:", product[4]);
console.log("Initial owner is manufacturer:", product[3] === manufacturer.address);

await (
  await contract.transferProduct(
    id,
    owner.address,
    "Noida, India",
    "Ownership assigned to current product owner"
  )
).wait();

product = await contract.getProduct(id);
console.log("Transfer successful:", product[3] === owner.address);
console.log("Manufacturer preserved:", product[2] === manufacturer.address);
console.log("Final owner:", product[3]);
