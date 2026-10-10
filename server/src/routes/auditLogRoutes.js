const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");
const { getAuditLogs } = require("../controllers/auditLogController");

const router = express.Router();

router.get(
  "/",
  protect,
  allowRoles("ADMIN"),
  getAuditLogs
);

module.exports = router;