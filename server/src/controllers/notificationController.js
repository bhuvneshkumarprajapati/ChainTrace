const Notification = require("../models/Notification");

// ======================================================
// Get logged-in user's notifications
// ======================================================
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user._id,
    })
      .populate("product", "productId name status")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching notifications",
    });
  }
};

// ======================================================
// Get unread notification count
// ======================================================
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error(
      "Get unread count error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching unread count",
    });
  }
};

// ======================================================
// Mark one notification as read
// ======================================================
const markAsRead = async (req, res) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        user: req.user._id,
      });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      message:
        "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error(
      "Mark notification read error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating notification",
    });
  }
};

// ======================================================
// Mark all notifications as read
// ======================================================
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    console.error(
      "Mark all notifications read error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating notifications",
    });
  }
};

// ======================================================
// Get ALL notifications
// ADMIN ONLY
// ======================================================
const getAllNotifications = async (
  req,
  res
) => {
  try {
    const notifications =
      await Notification.find()
        .populate(
          "user",
          "name email organization role"
        )
        .populate(
          "product",
          "productId name category status"
        )
        .sort({
          createdAt: -1,
        });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error(
      "Get all notifications error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching all notifications",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================
module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getAllNotifications,
};