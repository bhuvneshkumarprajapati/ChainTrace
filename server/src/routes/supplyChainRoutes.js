const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  createSupplyChainEvent,
  getProductHistory,
  transferProduct,
  getRecentActivity,
} = require("../controllers/supplyChainController");

const router = express.Router();

// ====================
// GET RECENT BLOCKCHAIN ACTIVITY
// IMPORTANT:
// Ye route /:productId se PEHLE hona chahiye
// ====================

router.get(
  "/activity/recent",
  protect,
  getRecentActivity
);

// ====================
// GET PRODUCT HISTORY
// ====================

router.get(
  "/:productId",
  getProductHistory
);

// ====================
// CREATE SUPPLY CHAIN EVENT
// ====================

router.post(
  "/",
  protect,
  allowRoles(
    "ADMIN",
    "MANUFACTURER",
    "SUPPLIER",
    "DISTRIBUTOR",
    "RETAILER"
  ),
  createSupplyChainEvent
);

// ====================
// TRANSFER PRODUCT
// ====================

router.post(
  "/transfer",
  protect,
  allowRoles(
    "ADMIN",
    "MANUFACTURER",
    "SUPPLIER",
    "DISTRIBUTOR",
    "RETAILER"
  ),
  transferProduct
);

module.exports = router;