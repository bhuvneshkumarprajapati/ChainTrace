const assert = require("node:assert/strict");
const { generateProductHash } = require("../src/services/productHashService");

const registeredProduct = {
  productId: "CT-TEST-008",
  name: "Organic Cotton T-Shirt",
  description: "",
  category: "Clothing",
  location: "Greater Noida, India",
  ipfsHash: "",
};

const storedHash = generateProductHash(registeredProduct);

assert.equal(generateProductHash(registeredProduct), storedHash);
console.log("PASS: Original product details match the stored hash.");

const fieldsToTamper = [
  { name: "name", value: "Tampered T-Shirt" },
  { name: "category", value: "Electronics" },
  { name: "location", value: "Mumbai, India" },
  { name: "description", value: "Changed description" },
  { name: "ipfsHash", value: "tampered-ipfs-hash" },
];

for (const field of fieldsToTamper) {
  const tamperedProduct = {
    ...registeredProduct,
    [field.name]: field.value,
  };

  const recalculatedHash = generateProductHash(tamperedProduct);

  assert.notEqual(
    recalculatedHash,
    storedHash,
    `Tampering in ${field.name} should be detected`
  );

  console.log(`PASS: Changes to ${field.name} are detected.`);
}

console.log("PASS: All tampering scenarios passed.");
