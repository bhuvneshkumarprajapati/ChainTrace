const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ====================
    // User Name
    // ====================
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ====================
    // Email
    // ====================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ====================
    // Password
    // ====================
    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    // ====================
    // Organization
    // ====================
    organization: {
      type: String,
      trim: true,
      default: "",
    },

    // ====================
    // User Role
    // ====================
    role: {
      type: String,
      enum: [
        "ADMIN",
        "MANUFACTURER",
        "SUPPLIER",
        "DISTRIBUTOR",
        "RETAILER",
        "CUSTOMER",
      ],
      default: "CUSTOMER",
    },

    // ====================
    // Blockchain Wallet
    // ====================
    walletAddress: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// ====================
// Create User Model
// ====================
const User = mongoose.model("User", userSchema);

module.exports = User;