const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "REGISTER",

        "PRODUCT_REGISTERED",
        "PRODUCT_TRANSFERRED",
        "PRODUCT_STATUS_UPDATED",
        "PRODUCT_VERIFIED",

        "ROLE_CHANGED",
        "USER_DELETED",
        "SUPPLY_CHAIN_EVENT",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    ipAddress: {
      type: String,
      trim: true,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

module.exports = AuditLog;