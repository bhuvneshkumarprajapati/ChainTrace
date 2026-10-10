const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getAllNotifications,
} = require("../controllers/notificationController");

const router = express.Router();

// ======================================================
// Logged-in User Notifications
// ======================================================

router.get(
  "/",
  protect,
  getNotifications
);

router.get(
  "/unread-count",
  protect,
  getUnreadCount
);

router.patch(
  "/read-all",
  protect,
  markAllAsRead
);

router.patch(
  "/:id/read",
  protect,
  markAsRead
);

// ======================================================
// ADMIN - Get All Notifications
// ======================================================

router.get(
  "/admin/all",
  protect,
  allowRoles("ADMIN"),
  getAllNotifications
);

module.exports = router;