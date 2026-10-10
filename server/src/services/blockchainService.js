const { ethers } = require("ethers");

// ==========================================
// Environment
// ==========================================
const RPC_URL =
  process.env.BLOCKCHAIN_RPC_URL ||
  "http://127.0.0.1:8545";

const CONTRACT_ADDRESS =
  process.env.BLOCKCHAIN_CONTRACT_ADDRESS;

const PRIVATE_KEY =
  process.env.BLOCKCHAIN_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  throw new Error(
    "BLOCKCHAIN_PRIVATE_KEY is missing"
  );
}

// ==========================================
// Provider
// ==========================================
const provider =
  new ethers.JsonRpcProvider(RPC_URL);

// ==========================================
// Default Wallet
// Account #0 = Manufacturer
// ==========================================
const wallet = new ethers.Wallet(
  PRIVATE_KEY,
  provider
);

// ==========================================
// Contract ABI
// ==========================================
const contractABI = [
  "function registerProduct(string _productId, string _productHash) external",

  "function transferProduct(string _productId, address _newOwner, string _location, string _description) external",

  "function verifyProduct(string _productId, string _productHash) external view returns (bool valid, address manufacturer, address currentOwner)",

  "function getProduct(string _productId) external view returns (string productId, string productHash, address manufacturer, address currentOwner, bool exists, uint256 registeredAt)",

  "function productExists(string _productId) external view returns (bool)",
];

// ==========================================
// Get Contract
// ==========================================
function getContract(signer = wallet) {
  if (!CONTRACT_ADDRESS) {
    throw new Error(
      "BLOCKCHAIN_CONTRACT_ADDRESS is missing"
    );
  }

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    contractABI,
    signer
  );
}

// ==========================================
// Get Wallet For User
// ==========================================
function getWalletForAddress(walletAddress) {
  const address = String(
    walletAddress || ""
  ).trim();

  if (!address) {
    throw new Error(
      "User blockchain wallet address is missing"
    );
  }

  if (!ethers.isAddress(address)) {
    throw new Error(
      `Invalid user blockchain wallet address: ${address}`
    );
  }

  const normalizedAddress =
    address.toLowerCase();

  const privateKeys = [
    process.env.BLOCKCHAIN_PRIVATE_KEY,
    process.env.BLOCKCHAIN_PRIVATE_KEY_1,
    process.env.BLOCKCHAIN_PRIVATE_KEY_2,
    process.env.BLOCKCHAIN_PRIVATE_KEY_3,
    process.env.BLOCKCHAIN_PRIVATE_KEY_4,
  ].filter(Boolean);

  for (const privateKey of privateKeys) {
    const userWallet = new ethers.Wallet(
      privateKey,
      provider
    );

    if (
      userWallet.address.toLowerCase() ===
      normalizedAddress
    ) {
      return userWallet;
    }
  }

  throw new Error(
    `No private key configured for wallet address: ${address}`
  );
}

// ==========================================
// Register Product
// ==========================================
async function registerProductOnBlockchain(
  productId,
  productHash
) {
  const normalizedProductId =
    String(productId || "")
      .trim()
      .toUpperCase();

  const normalizedProductHash =
    String(productHash || "").trim();

  if (!normalizedProductId) {
    throw new Error(
      "Product ID is required"
    );
  }

  if (!normalizedProductHash) {
    throw new Error(
      "Product hash is required"
    );
  }

  const contract = getContract();

  console.log(
    "================================="
  );

  console.log(
    "BLOCKCHAIN PRODUCT REGISTRATION"
  );

  console.log(
    "================================="
  );

  console.log(
    "Product:",
    normalizedProductId
  );

  console.log(
    "Blockchain sender:",
    wallet.address
  );

  const transaction =
    await contract.registerProduct(
      normalizedProductId,
      normalizedProductHash
    );

  console.log(
    "Registration transaction:",
    transaction.hash
  );

  const receipt =
    await transaction.wait();

  console.log(
    "Registration confirmed in block:",
    receipt.blockNumber
  );

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
  };
}

// ==========================================
// Verify Product
// ==========================================
async function verifyProductOnBlockchain(
  productId,
  productHash
) {
  const normalizedProductId =
    String(productId || "")
      .trim()
      .toUpperCase();

  const normalizedProductHash =
    String(productHash || "").trim();

  const contract = getContract();

  const result =
    await contract.verifyProduct(
      normalizedProductId,
      normalizedProductHash
    );

  return {
    valid: result[0],
    manufacturer: result[1],
    currentOwner: result[2],
  };
}

// ==========================================
// Transfer Product
// ==========================================
async function transferProductOnBlockchain(
  productId,
  senderWalletAddress,
  newOwner,
  location,
  description
) {
  // ========================================
  // Normalize values
  // ========================================
  const normalizedProductId =
    String(productId || "")
      .trim()
      .toUpperCase();

  const senderAddress =
    String(senderWalletAddress || "").trim();

  const receiverAddress =
    String(newOwner || "").trim();

  const transferLocation =
    String(location || "").trim();

  const transferDescription =
    String(description || "").trim();

  // ========================================
  // Validate Product ID
  // ========================================
  if (!normalizedProductId) {
    throw new Error(
      "Product ID is required"
    );
  }

  // ========================================
  // Validate Sender
  // ========================================
  if (!senderAddress) {
    throw new Error(
      "Sender wallet address is required"
    );
  }

  if (!ethers.isAddress(senderAddress)) {
    throw new Error(
      `Invalid sender wallet address: ${senderAddress}`
    );
  }

  // ========================================
  // Validate Receiver
  // ========================================
  if (!receiverAddress) {
    throw new Error(
      "Receiver wallet address is required"
    );
  }

  if (!ethers.isAddress(receiverAddress)) {
    throw new Error(
      `Invalid receiver wallet address: ${receiverAddress}`
    );
  }

  // ========================================
  // Get Sender Wallet
  // ========================================
  const senderWallet =
    getWalletForAddress(
      senderAddress
    );

  // ========================================
  // Safety Check
  // ========================================
  if (
    senderWallet.address.toLowerCase() !==
    senderAddress.toLowerCase()
  ) {
    throw new Error(
      "Sender wallet does not match configured wallet"
    );
  }

  // ========================================
  // Connect Contract With Sender
  // ========================================
  const contract =
    getContract(senderWallet);

  // ========================================
  // Logs
  // ========================================
  console.log(
    "================================="
  );

  console.log(
    "BLOCKCHAIN PRODUCT TRANSFER"
  );

  console.log(
    "================================="
  );

  console.log(
    "Product:",
    normalizedProductId
  );

  console.log(
    "Blockchain sender:",
    senderWallet.address
  );

  console.log(
    "Blockchain receiver:",
    receiverAddress
  );

  console.log(
    "Location:",
    transferLocation
  );

  console.log(
    "Description:",
    transferDescription
  );

  // ========================================
  // Send Blockchain Transaction
  // ========================================
  const transaction =
    await contract.transferProduct(
      normalizedProductId,
      receiverAddress,
      transferLocation,
      transferDescription
    );

  console.log(
    "Transfer transaction:",
    transaction.hash
  );

  // ========================================
  // Wait For Confirmation
  // ========================================
  const receipt =
    await transaction.wait();

  console.log(
    "Transfer confirmed in block:",
    receipt.blockNumber
  );

  // ========================================
  // Return Result
  // ========================================
  return {
    transactionHash: receipt.hash,

    blockNumber:
      receipt.blockNumber,

    from:
      senderWallet.address,

    to:
      receiverAddress,
  };
}

// ==========================================
// Export
// ==========================================
module.exports = {
  provider,

  wallet,

  getContract,

  getWalletForAddress,

  registerProductOnBlockchain,

  verifyProductOnBlockchain,

  transferProductOnBlockchain,
};