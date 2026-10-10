const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    manufacturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    currentOwner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    location: {
      type: String,
      trim: true,
    },

    productHash: {
      type: String,
      required: true,
      unique: true,
    },

    ipfsHash: {
      type: String,
      trim: true,
    },

    blockchainTxHash: {
      type: String,
      trim: true,
    },

    blockchainNetwork: {
      type: String,
      default: "Ethereum",
    },

    status: {
      type: String,
      enum: [
        "REGISTERED",
        "IN_TRANSIT",
        "DELIVERED",
        "UNDER_REVIEW",
        "FLAGGED",
      ],
      default: "REGISTERED",
    },

    qrCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;