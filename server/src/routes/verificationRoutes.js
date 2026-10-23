const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  verifyProduct,
  getVerificationHistory,
} = require("../controllers/verificationController");

const router = express.Router();

// ==========================================
// VERIFY PRODUCT
// ==========================================

// Logged-in users can verify products
router.post(
  "/",
  verifyProduct
);

// ==========================================
// ADMIN - VERIFICATION HISTORY
// ==========================================

// Get all verification records
router.get(
  "/admin/history",
  protect,
  allowRoles("ADMIN"),
  getVerificationHistory
);

// Get verification history for one product
// Example:
// /api/verification/admin/history?productId=CT-2026-019

module.exports = router;