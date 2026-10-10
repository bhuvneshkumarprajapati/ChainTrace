const mongoose = require("mongoose");

const supplyChainEventSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    eventType: {
      type: String,
      enum: [
        "MANUFACTURED",
        "REGISTERED",
        "QUALITY_CHECK",
        "TRANSFERRED",
        "SHIPPED",
        "RECEIVED",
        "DELIVERED",
        "VERIFIED",
      ],
      required: true,
    },

    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    location: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    blockchainTxHash: {
      type: String,
      trim: true,
    },

    blockNumber: {
      type: Number,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const SupplyChainEvent = mongoose.model(
  "SupplyChainEvent",
  supplyChainEventSchema
);

module.exports = SupplyChainEvent;