
const Product = require("../models/Product");
const Verification = require("../models/Verification");
const Notification = require("../models/Notification");
const {
  generateProductHash,
} = require("../services/productHashService");

const {
  verifyProductOnBlockchain,
} = require("../services/blockchainService");

// Normalize wallet addresses before comparing them.
const normalizeWalletAddress = (address) => {
  if (address === null || address === undefined) {
    return null;
  }

  const normalized = String(address).trim().toLowerCase();
  return normalized || null;
};

// Identify temporary blockchain RPC/provider errors.
const isTemporaryBlockchainError = (error) => {
  const errorCode = String(
    error?.code ||
      error?.info?.error?.code ||
      error?.error?.code ||
      error?.cause?.code ||
      ""
  ).toUpperCase();

  const errorMessage = String(
    error?.shortMessage || error?.message || ""
  ).toLowerCase();

  const temporaryCodes = new Set([
    "TIMEOUT",
    "NETWORK_ERROR",
    "SERVER_ERROR",
    "ECONNRESET",
    "ECONNREFUSED",
    "ETIMEDOUT",
    "EAI_AGAIN",
  ]);

  return (
    temporaryCodes.has(errorCode) ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("timed out") ||
    errorMessage.includes("network error") ||
    errorMessage.includes("failed to fetch") ||
    errorMessage.includes("socket hang up") ||
    errorMessage.includes("connection reset") ||
    errorMessage.includes("connection refused") ||
    errorMessage.includes("could not detect network")
  );
};

// ====================
// VERIFY PRODUCT
// ====================
const verifyProduct = async (req, res) => {
  try {
    const { productId, scannedHash } = req.body;

    // Validate Product ID.
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const normalizedProductId = String(productId)
      .trim()
      .toUpperCase();

    const normalizedScannedValue = String(
      scannedHash || ""
    ).trim();

    // Find product and populate manufacturer/owner details.
    const product = await Product.findOne({
      productId: normalizedProductId,
    })
      .populate(
        "manufacturer",
        "name email organization role walletAddress"
      )
      .populate(
        "currentOwner",
        "name email organization role walletAddress"
      );

    // Product not found.
    if (!product) {
      const verification = await Verification.create({
        verificationMethod: normalizedScannedValue
          ? "QR_CODE"
          : "PRODUCT_ID",
        verificationResult: "NOT_VERIFIED",
        riskLevel: "HIGH",
        scannedProductId: normalizedProductId,
        scannedHash: normalizedScannedValue,
        blockchainVerified: false,
        ownershipValid: false,
        qrReuseDetected: false,
        notes:
          "Product ID was not found in the ChainTrace registry.",
        ipAddress: req.ip,
      });

      return res.status(404).json({
        success: false,
        message: "Product not verified",
        result: "NOT_VERIFIED",
        riskLevel: "HIGH",
        verification,
      });
    }

    // QR currently contains the Product ID.
    const qrCode = String(product.qrCode || "").trim();

    const qrMatches = qrCode
      ? (
          normalizedProductId === qrCode.toUpperCase() ||
          normalizedScannedValue === qrCode ||
          normalizedScannedValue === normalizedProductId
        )
      : (
          !normalizedScannedValue ||
          normalizedScannedValue === normalizedProductId
        );

    // Recalculate hash from the stored product details.
    const recalculatedProductHash = generateProductHash({
      productId: product.productId,
      name: product.name,
      description: product.description,
      category: product.category,
      location: product.location,
      ipfsHash: product.ipfsHash,
    });

    const hashMatches =
      recalculatedProductHash.toLowerCase() ===
      String(product.productHash || "").toLowerCase();

    // ========================================
    // REAL BLOCKCHAIN VERIFICATION
    // ========================================
    let blockchainVerified = false;
    let blockchainManufacturer = null;
    let blockchainCurrentOwner = null;

    try {
      const blockchainResult =
        await verifyProductOnBlockchain(
          normalizedProductId,
          recalculatedProductHash
        );

      blockchainVerified = Boolean(blockchainResult.valid);
      blockchainManufacturer = blockchainResult.manufacturer;
      blockchainCurrentOwner = blockchainResult.currentOwner;

      console.log("=================================");
      console.log("BLOCKCHAIN VERIFICATION");
      console.log("=================================");
      console.log("Product:", normalizedProductId);
      console.log("Valid:", blockchainVerified);
      console.log(
        "Blockchain manufacturer:",
        blockchainManufacturer
      );
      console.log(
        "Blockchain current owner:",
        blockchainCurrentOwner
      );
    } catch (blockchainError) {
      console.error(
        "Blockchain verification failed:",
        blockchainError.message
      );

      // A temporary RPC failure is not proof of counterfeiting.
      // Do not create a false WARNING record or notification.
      if (isTemporaryBlockchainError(blockchainError)) {
        return res.status(503).json({
          success: false,
          code: "BLOCKCHAIN_TEMPORARILY_UNAVAILABLE",
          message:
            "Blockchain verification is temporarily unavailable. Please retry in a few seconds.",
          retryable: true,
          productId: normalizedProductId,
        });
      }

      // Unexpected errors must not be silently treated as a
      // genuine blockchain mismatch.
      throw blockchainError;
    }

    // ========================================
    // NORMALIZE DATABASE AND BLOCKCHAIN WALLETS
    // ========================================
    const mongoOwnerWallet = normalizeWalletAddress(
      product.currentOwner?.walletAddress
    );

    const blockchainOwnerWallet = normalizeWalletAddress(
      blockchainCurrentOwner
    );

    const mongoManufacturerWallet = normalizeWalletAddress(
      product.manufacturer?.walletAddress
    );

    const blockchainManufacturerWallet =
      normalizeWalletAddress(blockchainManufacturer);

    // ========================================
    // OWNERSHIP AND MANUFACTURER VALIDATION
    // ========================================
    const ownerMatch = Boolean(
      mongoOwnerWallet &&
      blockchainOwnerWallet &&
      mongoOwnerWallet === blockchainOwnerWallet
    );

    const manufacturerMatch = Boolean(
      mongoManufacturerWallet &&
      blockchainManufacturerWallet &&
      mongoManufacturerWallet === blockchainManufacturerWallet
    );

    const ownershipValid = ownerMatch;
    const manufacturerValid = manufacturerMatch;

    console.log("OWNERSHIP DEBUG:", {
      productId: normalizedProductId,
      mongoOwnerWallet,
      blockchainOwnerWallet,
      ownerMatch,
      ownershipValid,
    });

    console.log("MANUFACTURER DEBUG:", {
      productId: normalizedProductId,
      mongoManufacturerWallet,
      blockchainManufacturerWallet,
      manufacturerMatch,
      manufacturerValid,
    });

    // ========================================
    // VERIFICATION RESULT
    // ========================================
    let verificationResult = "AUTHENTIC";
    let riskLevel = "LOW";

    // Product hash mismatch.
    if (!hashMatches) {
      verificationResult = "WARNING";
      riskLevel = "HIGH";
    }

    // QR mismatch.
    if (!qrMatches) {
      verificationResult = "WARNING";
      riskLevel = "HIGH";
    }

    // Blockchain mismatch.
    if (!blockchainVerified) {
      verificationResult = "WARNING";

      if (riskLevel !== "HIGH") {
        riskLevel = "MEDIUM";
      }
    }

    // Ownership mismatch.
    if (!ownershipValid) {
      verificationResult = "WARNING";

      if (riskLevel !== "HIGH") {
        riskLevel = "MEDIUM";
      }
    }

    // Manufacturer mismatch.
    if (!manufacturerValid) {
      verificationResult = "WARNING";

      if (riskLevel !== "HIGH") {
        riskLevel = "MEDIUM";
      }
    }

    // Flagged product.
    if (product.status === "FLAGGED") {
      verificationResult = "WARNING";
      riskLevel = "HIGH";
    }

    // ========================================
    // VERIFICATION NOTES
    // ========================================
    let verificationNotes =
      "Product record, QR data, blockchain proof, manufacturer and ownership matched.";

    if (verificationResult !== "AUTHENTIC") {
      verificationNotes =
        "Product verification requires additional review because one or more verification checks failed.";
    }

    // ========================================
    // SAVE VERIFICATION
    // ========================================
    const verification = await Verification.create({
      product: product._id,
      verifiedBy: req.user?._id,
      verificationMethod: normalizedScannedValue
        ? "QR_CODE"
        : "PRODUCT_ID",
      verificationResult,
      riskLevel,
      scannedProductId: product.productId,
      scannedHash: normalizedScannedValue,
      blockchainVerified,
      ownershipValid,
      qrReuseDetected: false,
      notes: verificationNotes,
      ipAddress: req.ip,
    });

    // ========================================
    // CREATE NOTIFICATION
    // ========================================
    try {
      const isAuthentic = verificationResult === "AUTHENTIC";

      await Notification.create({
        user: product.manufacturer._id,
        type: isAuthentic
          ? "PRODUCT_VERIFIED"
          : "PRODUCT_FLAGGED",
        title: isAuthentic
          ? "Product Verified"
          : "Product Verification Alert",
        message: isAuthentic
          ? `Product ${product.productId} was successfully verified as authentic.`
          : `Product ${product.productId} requires attention. Verification result: ${verificationResult}, risk level: ${riskLevel}.`,
        product: product._id,
      });

      console.log(
        `Verification notification created for manufacturer of ${product.productId}`
      );
    } catch (notificationError) {
      // Notification failure must not affect verification.
      console.error(
        "VERIFICATION NOTIFICATION ERROR:",
        notificationError.message
      );
    }

    // ========================================
    // FINAL RESPONSE
    // ========================================
    return res.status(200).json({
      success: true,
      message: "Product verification completed",
      result: verificationResult,
      riskLevel,

      product: {
        id: product.productId,
        name: product.name,
        description: product.description,
        category: product.category,
        status: product.status,
        manufacturer: product.manufacturer,
        currentOwner: product.currentOwner,
        location: product.location,
        blockchainNetwork: product.blockchainNetwork,
        blockchainTxHash: product.blockchainTxHash,
        qrCode: product.qrCode,
      },

      proof: {
        hashMatches,
        qrMatches,
        blockchainVerified,
        ownershipValid,
        manufacturerValid,
        blockchainManufacturer,
        blockchainCurrentOwner,
        mongoOwnerWallet,
        blockchainOwnerWallet,
        mongoManufacturerWallet,
        blockchainManufacturerWallet,
        ownerMatch,
        manufacturerMatch,
      },

      verification,
    });
  } catch (error) {
    console.error("=================================");
    console.error("VERIFY PRODUCT ERROR");
    console.error("=================================");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message: "Server error during product verification",
      error: error.message,
    });
  }
};

// ==========================================
// ADMIN - GET VERIFICATION HISTORY
// ==========================================
const getVerificationHistory = async (req, res) => {
  try {
    const { productId } = req.query;
    const query = {};

    // Optional product filter.
    if (productId) {
      const normalizedProductId = String(productId)
        .trim()
        .toUpperCase();

      const product = await Product.findOne({
        productId: normalizedProductId,
      }).select("_id");

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      query.product = product._id;
    }

    const verifications = await Verification.find(query)
      .populate(
        "product",
        "productId name category status manufacturer currentOwner"
      )
      .populate(
        "verifiedBy",
        "name email organization role"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: verifications.length,
      verifications,
    });
  } catch (error) {
    console.error(
      "Get verification history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching verification history",
    });
  }
};

// ====================
// EXPORT
// ====================
module.exports = {
  verifyProduct,
  getVerificationHistory,
};
