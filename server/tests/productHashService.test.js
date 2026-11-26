const assert = require("node:assert/strict");
const { generateProductHash } = require("../src/services/productHashService");

const product = {
  productId: "CT-TEST-008",
  name: "Organic Cotton T-Shirt",
  description: "",
  category: "Clothing",
  location: "Greater Noida, India",
  ipfsHash: "",
};

const originalHash = generateProductHash(product);

assert.equal(
  generateProductHash({ ...product }),
  originalHash,
  "Same details must produce the same hash"
);

assert.notEqual(
  generateProductHash({ ...product, name: "Tampered T-Shirt" }),
  originalHash,
  "Changed name must produce a different hash"
);

assert.notEqual(
  generateProductHash({ ...product, category: "Electronics" }),
  originalHash,
  "Changed category must produce a different hash"
);

assert.notEqual(
  generateProductHash({ ...product, location: "Mumbai, India" }),
  originalHash,
  "Changed location must produce a different hash"
);

console.log("PASS: All 4 product hash tests passed.");

const transferred = { ...product, registrationLocation: product.location, location: "Mumbai, India", status: "IN_TRANSIT" };
assert.equal(generateProductHash({ ...transferred, location: transferred.registrationLocation }), originalHash);
assert.notEqual(generateProductHash({ ...transferred, location: transferred.registrationLocation, name: "Tampered" }), originalHash);
console.log("PASS: Transfer location and tampering hash regression checks");
