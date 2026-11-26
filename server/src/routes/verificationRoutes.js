const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  verifyProduct,
  getVerificationHistory,
} = require("../controllers/verificationController");

const router = express.Router();
const { rateLimit } = require("express-rate-limit");
const verificationLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many verification requests. Try again shortly." },
});

// ==========================================
// VERIFY PRODUCT
// ==========================================

// Public verification, with abuse protection
router.post(
  "/",
  verificationLimiter,
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