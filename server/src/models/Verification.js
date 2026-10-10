const mongoose = require("mongoose");

const verificationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    verificationMethod: {
      type: String,
      enum: ["PRODUCT_ID", "QR_CODE", "API"],
      required: true,
    },

    verificationResult: {
      type: String,
      enum: ["AUTHENTIC", "WARNING", "NOT_VERIFIED"],
      required: true,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },

    scannedProductId: {
      type: String,
      trim: true,
    },

    scannedHash: {
      type: String,
      trim: true,
    },

    blockchainVerified: {
      type: Boolean,
      default: false,
    },

    ownershipValid: {
      type: Boolean,
      default: false,
    },

    qrReuseDetected: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      trim: true,
    },

    ipAddress: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Verification = mongoose.model(
  "Verification",
  verificationSchema
);

module.exports = Verification;