const { keccak256, toUtf8Bytes } = require("ethers");

const generateProductHash = ({
  productId,
  name,
  description = "",
  category,
  location = "",
  ipfsHash = "",
}) => {
  const canonicalData = JSON.stringify({
    productId: String(productId).trim().toUpperCase(),
    name: String(name).trim(),
    description: String(description).trim(),
    category: String(category).trim(),
    location: String(location).trim(),
    ipfsHash: String(ipfsHash).trim(),
  });

  return keccak256(toUtf8Bytes(canonicalData));
};

module.exports = { generateProductHash };
