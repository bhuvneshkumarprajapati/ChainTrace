const Product = require("../models/Product");
const Verification = require("../models/Verification");
const Notification = require("../models/Notification");

const {
  verifyProductOnBlockchain,
} = require("../services/blockchainService");

// ====================
// VERIFY PRODUCT
// ====================
const verifyProduct = async (req, res) => {
  try {
    const {
      productId,
      scannedHash,
    } = req.body;

    // ========================================
    // Validate Product ID
    // ========================================
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const normalizedProductId =
      String(productId)
        .trim()
        .toUpperCase();

    const normalizedScannedValue =
      String(scannedHash || "")
        .trim();

    // ========================================
    // Find Product
    // ========================================
    const product =
      await Product.findOne({
        productId:
          normalizedProductId,
      })
        .populate(
          "manufacturer",
          "name email organization role walletAddress"
        )
        .populate(
          "currentOwner",
          "name email organization role walletAddress"
        );

    // ========================================
    // PRODUCT NOT FOUND
    // ========================================
    if (!product) {
      const verification =
        await Verification.create({
          verificationMethod:
            normalizedScannedValue
              ? "QR_CODE"
              : "PRODUCT_ID",

          verificationResult:
            "NOT_VERIFIED",

          riskLevel:
            "HIGH",

          scannedProductId:
            normalizedProductId,

          scannedHash:
            normalizedScannedValue,

          blockchainVerified:
            false,

          ownershipValid:
            false,

          qrReuseDetected:
            false,

          notes:
            "Product ID was not found in the ChainTrace registry.",

          ipAddress:
            req.ip,
        });

      return res.status(404).json({
        success: false,

        message:
          "Product not verified",

        result:
          "NOT_VERIFIED",

        riskLevel:
          "HIGH",

        verification,
      });
    }

    // ========================================
    // QR / SCANNED VALUE CHECK
    //
    // Our QR currently contains Product ID.
    // ========================================
    const qrMatches =
      product.qrCode
        ? (
            normalizedProductId ===
              product.qrCode.toUpperCase() ||

            normalizedScannedValue ===
              product.qrCode ||

            normalizedScannedValue ===
              normalizedProductId
          )
        : (
            !normalizedScannedValue ||
            normalizedScannedValue ===
              normalizedProductId
          );

    // ========================================
    // HASH CHECK
    // ========================================
    let hashMatches = true;

    if (
      normalizedScannedValue &&
      normalizedScannedValue !==
        normalizedProductId
    ) {
      hashMatches =
        normalizedScannedValue ===
        product.productHash;
    }

    // ========================================
    // REAL BLOCKCHAIN VERIFICATION
    // ========================================
    let blockchainVerified =
      false;

    let blockchainManufacturer =
      null;

    let blockchainCurrentOwner =
      null;

    try {
      const blockchainResult =
        await verifyProductOnBlockchain(
          normalizedProductId,
          product.productHash
        );

      blockchainVerified =
        Boolean(
          blockchainResult.valid
        );

      blockchainManufacturer =
        blockchainResult.manufacturer;

      blockchainCurrentOwner =
        blockchainResult.currentOwner;

      console.log(
        "================================="
      );

      console.log(
        "BLOCKCHAIN VERIFICATION"
      );

      console.log(
        "================================="
      );

      console.log(
        "Product:",
        normalizedProductId
      );

      console.log(
        "Valid:",
        blockchainVerified
      );

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

      blockchainVerified =
        false;
    }

    // ========================================
    // MONGODB OWNER WALLET
    // ========================================
    const mongoOwnerWallet =
      product.currentOwner?.walletAddress
        ? String(
            product.currentOwner
              .walletAddress
          )
            .trim()
            .toLowerCase()
        : null;

    // ========================================
    // BLOCKCHAIN OWNER WALLET
    // ========================================
    const blockchainOwnerWallet =
      blockchainCurrentOwner
        ? String(
            blockchainCurrentOwner
          )
            .trim()
            .toLowerCase()
        : null;

    // ========================================
    // OWNERSHIP VALIDATION
    // ========================================
    const ownershipValid =
      Boolean(
        mongoOwnerWallet &&
        blockchainOwnerWallet &&
        mongoOwnerWallet ===
          blockchainOwnerWallet
      );

    // ========================================
    // MANUFACTURER VALIDATION
    // ========================================
    const mongoManufacturerWallet =
      product.manufacturer?.walletAddress
        ? String(
            product.manufacturer
              .walletAddress
          )
            .trim()
            .toLowerCase()
        : null;

    const blockchainManufacturerWallet =
      blockchainManufacturer
        ? String(
            blockchainManufacturer
          )
            .trim()
            .toLowerCase()
        : null;

    const manufacturerValid =
      Boolean(
        mongoManufacturerWallet &&
        blockchainManufacturerWallet &&
        mongoManufacturerWallet ===
          blockchainManufacturerWallet
      );

    // ========================================
    // VERIFICATION RESULT
    // ========================================
    let verificationResult =
      "AUTHENTIC";

    let riskLevel =
      "LOW";

    // ========================================
    // Hash mismatch
    // ========================================
    if (!hashMatches) {
      verificationResult =
        "WARNING";

      riskLevel =
        "HIGH";
    }

    // ========================================
    // QR mismatch
    // ========================================
    if (!qrMatches) {
      verificationResult =
        "WARNING";

      riskLevel =
        "HIGH";
    }

    // ========================================
    // Blockchain mismatch
    // ========================================
    if (!blockchainVerified) {
      verificationResult =
        "WARNING";

      if (riskLevel !== "HIGH") {
        riskLevel =
          "MEDIUM";
      }
    }

    // ========================================
    // Ownership mismatch
    // ========================================
    if (!ownershipValid) {
      verificationResult =
        "WARNING";

      if (riskLevel !== "HIGH") {
        riskLevel =
          "MEDIUM";
      }
    }

    // ========================================
    // Manufacturer mismatch
    // ========================================
    if (!manufacturerValid) {
      verificationResult =
        "WARNING";

      if (riskLevel !== "HIGH") {
        riskLevel =
          "MEDIUM";
      }
    }

    // ========================================
    // Flagged product
    // ========================================
    if (
      product.status ===
      "FLAGGED"
    ) {
      verificationResult =
        "WARNING";

      riskLevel =
        "HIGH";
    }

    // ========================================
    // Verification notes
    // ========================================
    let verificationNotes =
      "Product record, QR data, blockchain proof, manufacturer and ownership matched.";

    if (
      verificationResult !==
      "AUTHENTIC"
    ) {
      verificationNotes =
        "Product verification requires additional review because one or more verification checks failed.";
    }

    // ========================================
    // Save Verification
    // ========================================
    const verification =
      await Verification.create({
        product:
          product._id,

        verifiedBy:
          req.user?._id,

        verificationMethod:
          normalizedScannedValue
            ? "QR_CODE"
            : "PRODUCT_ID",

        verificationResult,

        riskLevel,

        scannedProductId:
          product.productId,

        scannedHash:
          normalizedScannedValue,

        blockchainVerified,

        ownershipValid,

        qrReuseDetected:
          false,

        notes:
          verificationNotes,

        ipAddress:
          req.ip,
      });

    // ========================================
    // CREATE NOTIFICATION
    // ========================================
    try {
      const isAuthentic =
        verificationResult ===
        "AUTHENTIC";

      await Notification.create({
        user:
          product.manufacturer._id,

        type:
          isAuthentic
            ? "PRODUCT_VERIFIED"
            : "PRODUCT_FLAGGED",

        title:
          isAuthentic
            ? "Product Verified"
            : "Product Verification Alert",

        message:
          isAuthentic
            ? `Product ${product.productId} was successfully verified as authentic.`
            : `Product ${product.productId} requires attention. Verification result: ${verificationResult}, risk level: ${riskLevel}.`,

        product:
          product._id,
      });

      console.log(
        `Verification notification created for manufacturer of ${product.productId}`
      );
    } catch (notificationError) {
      // Notification failure should not
      // affect successful verification.
      console.error(
        "VERIFICATION NOTIFICATION ERROR:",
        notificationError.message
      );
    }

    // ========================================
    // FINAL RESPONSE
    // ========================================
    return res.status(200).json({
      success:
        true,

      message:
        "Product verification completed",

      result:
        verificationResult,

      riskLevel,

      product: {
        id:
          product.productId,

        name:
          product.name,

        description:
          product.description,

        category:
          product.category,

        status:
          product.status,

        manufacturer:
          product.manufacturer,

        currentOwner:
          product.currentOwner,

        location:
          product.location,

        blockchainNetwork:
          product.blockchainNetwork,

        blockchainTxHash:
          product.blockchainTxHash,

        qrCode:
          product.qrCode,
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
      },

      verification,
    });
  } catch (error) {
    console.error(
      "================================="
    );

    console.error(
      "VERIFY PRODUCT ERROR"
    );

    console.error(
      "================================="
    );

    console.error(error);

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Stack:",
      error.stack
    );

    return res.status(500).json({
      success:
        false,

      message:
        "Server error during product verification",

      error:
        error.message,
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

    // Optional product filter
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