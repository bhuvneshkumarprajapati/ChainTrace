const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    transactionHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    blockchainNetwork: {
      type: String,
      default: "Ethereum",
    },

    transactionType: {
      type: String,
      enum: [
        "REGISTER_PRODUCT",
        "TRANSFER_PRODUCT",
        "SUPPLY_CHAIN_EVENT",
        "VERIFY_PRODUCT",
      ],
      required: true,
    },

    blockNumber: {
      type: Number,
    },

    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "FAILED"],
      default: "PENDING",
    },

    gasUsed: {
      type: String,
    },

    walletAddress: {
      type: String,
      trim: true,
    },

    errorMessage: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);

module.exports = Transaction;