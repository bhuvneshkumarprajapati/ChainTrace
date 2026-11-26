const express = require("express");

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const router = express.Router();
const { rateLimit } = require("express-rate-limit");
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many authentication attempts. Try again later." },
});

// Register
router.post("/register", authLimiter, registerUser);

// Login
router.post("/login", authLimiter, loginUser);

module.exports = router;