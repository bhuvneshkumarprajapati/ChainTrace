const express = require("express");

const protect = require("../middleware/authMiddleware");

const allowRoles = require("../middleware/roleMiddleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProductStatus,
} = require("../controllers/productController");

const router = express.Router();

// ==========================================
// Register Product
// ==========================================

// Only Manufacturer and Admin can register products
router.post(
  "/",
  protect,
  allowRoles("MANUFACTURER", "ADMIN"),
  createProduct
);

// ==========================================
// Get All Products
// ==========================================

// Public route
router.get(
  "/",
  getProducts
);

// ==========================================
// Get Product By Product ID
// ==========================================

// Public route
router.get(
  "/:productId",
  getProductById
);

// ==========================================
// ADMIN - Update Product Status
// ==========================================

router.patch(
  "/:productId/status",
  protect,
  allowRoles("ADMIN"),
  updateProductStatus
);

module.exports = router;