
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const supplyChainRoutes = require("./routes/supplyChainRoutes");
const auditLogRoutes = require("./routes/auditLogRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ====================
// Database
// ====================
connectDB();

// ====================
// Security
// ====================
app.use(helmet());

// ====================
// CORS Configuration
// ====================
const allowedOrigins = [
  "https://chaintrace-frontend.onrender.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:5175",
  "http://127.0.0.1:5175",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header,
      // such as server-to-server or local health checks.
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn("Blocked by CORS: " + origin);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

// ====================
// Body Parser
// ====================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====================
// Logger
// ====================
app.use(morgan("dev"));

// ====================
// API Routes
// ====================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/supply-chain", supplyChainRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/notifications", notificationRoutes);

// ====================
// Health Check
// ====================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ChainTrace API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ChainTrace backend is healthy",
    database: "MongoDB",
  });
});

// ====================
// 404 Handler
// ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found: " + req.originalUrl,
  });
});

// ====================
// Error Handler
// ====================
app.use((err, req, res, next) => {
  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Origin not allowed by CORS",
    });
  }

  console.error("Server error:", err.message);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ====================
// Start Server
// ====================
app.listen(PORT, "0.0.0.0", () => {
  console.log("ChainTrace server running on port " + PORT);
});