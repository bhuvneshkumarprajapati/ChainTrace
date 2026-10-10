import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Loader2,
  Package,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // -----------------------------------------
  // Fetch Notifications
  // -----------------------------------------
  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");

      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error.response?.data?.message || error.message
      );
    }
  };

  // -----------------------------------------
  // Fetch Unread Count
  // -----------------------------------------
  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(
        "/notifications/unread-count"
      );

      if (response.data.success) {
        setUnreadCount(response.data.count || 0);
      }
    } catch (error) {
      console.error(
        "Failed to fetch unread count:",
        error.response?.data?.message || error.message
      );
    }
  };

  // -----------------------------------------
  // Load Everything
  // -----------------------------------------
  const loadNotifications = async () => {
    setLoading(true);

    try {
      await Promise.all([
        fetchNotifications(),
        fetchUnreadCount(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // Initial Load + Polling
  // -----------------------------------------
  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      fetchUnreadCount();

      // Refresh complete notifications only
      // when panel is open.
      if (open) {
        fetchNotifications();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [open]);

  // -----------------------------------------
  // Mark One Notification As Read
  // -----------------------------------------
  const markAsRead = async (notificationId) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification._id === notificationId
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );

      setUnreadCount((previous) =>
        Math.max(previous - 1, 0)
      );
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error.response?.data?.message || error.message
      );
    }
  };

  // -----------------------------------------
  // Mark All As Read
  // -----------------------------------------
  const markAllAsRead = async () => {
    try {
      await api.patch(
        "/notifications/read-all"
      );

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications as read:",
        error.response?.data?.message || error.message
      );
    }
  };

  // -----------------------------------------
  // Notification Icon
  // -----------------------------------------
  const getNotificationIcon = (type) => {
    switch (type) {
      case "PRODUCT_REGISTERED":
        return <Package size={15} />;

      case "PRODUCT_TRANSFERRED":
        return <ArrowRightLeft size={15} />;

      case "PRODUCT_VERIFIED":
        return <CheckCircle2 size={15} />;

      case "PRODUCT_FLAGGED":
        return <ShieldAlert size={15} />;

      case "PRODUCT_DELIVERED":
        return <CheckCircle2 size={15} />;

      default:
        return <Info size={15} />;
    }
  };

  // -----------------------------------------
  // Notification Icon Style
  // -----------------------------------------
  const getNotificationIconStyle = (type) => {
    switch (type) {
      case "PRODUCT_FLAGGED":
        return "border-red-400/20 bg-red-400/10 text-red-400";

      case "PRODUCT_VERIFIED":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";

      case "PRODUCT_DELIVERED":
        return "border-blue-400/20 bg-blue-400/10 text-blue-400";

      case "PRODUCT_TRANSFERRED":
        return "border-amber-400/20 bg-amber-400/10 text-amber-400";

      default:
        return "border-white/10 bg-white/[0.04] text-white/50";
    }
  };

  return (
    <div className="relative">
      {/* =========================================
          BELL BUTTON
      ========================================= */}
      <button
        type="button"
        onClick={() => {
          const nextOpen = !open;

          setOpen(nextOpen);

          if (nextOpen) {
            loadNotifications();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white transition-all duration-200 hover:border-emerald-400/30 hover:bg-emerald-400/[0.06]"
        aria-label="Notifications"
        title="Notifications"
      >
        <Bell
          size={19}
          className={open ? "text-emerald-400" : "text-white"}
        />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-black shadow-lg shadow-emerald-400/20"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* =========================================
          NOTIFICATION PANEL
      ========================================= */}
      <AnimatePresence>
        {open && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            />

            {/* Panel */}
            <motion.div
              initial={{
                opacity: 0,
                y: -10,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.98,
              }}
              transition={{
                duration: 0.18,
              }}
              className="fixed left-4 right-4 top-20 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#080d0b] shadow-2xl shadow-black/40 md:absolute md:left-auto md:right-0 md:top-12 md:w-[410px]"
            >
              {/* =====================================
                  HEADER
              ===================================== */}
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Bell
                      size={15}
                      className="text-emerald-400"
                    />

                    <h3 className="text-sm font-semibold text-white">
                      Notifications
                    </h3>
                  </div>

                  <p className="mt-1 text-xs text-white/40">
                    {unreadCount === 0
                      ? "You're all caught up"
                      : `${unreadCount} unread notification${
                          unreadCount > 1 ? "s" : ""
                        }`}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="flex items-center gap-1.5 text-xs text-emerald-400 transition hover:text-emerald-300"
                    >
                      <Check size={14} />
                      Mark all read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white"
                    aria-label="Close notifications"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* =====================================
                  CONTENT
              ===================================== */}
              <div className="max-h-[440px] overflow-y-auto">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-14">
                    <Loader2
                      size={24}
                      className="animate-spin text-emerald-400"
                    />

                    <p className="mt-3 text-xs text-white/40">
                      Loading notifications...
                    </p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-5 py-14 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                      <Bell
                        size={22}
                        className="text-white/20"
                      />
                    </div>

                    <p className="mt-4 text-sm font-medium text-white/60">
                      No notifications
                    </p>

                    <p className="mt-1 text-xs text-white/30">
                      You're all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b border-white/5 px-5 py-4 transition hover:bg-white/[0.03] ${
                        !notification.isRead
                          ? "bg-emerald-400/[0.035]"
                          : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Notification Icon */}
                        <div
                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${getNotificationIconStyle(
                            notification.type
                          )}`}
                        >
                          {getNotificationIcon(
                            notification.type
                          )}
                        </div>

                        {/* Notification Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium text-white">
                                {notification.title}
                              </h4>

                              {!notification.isRead && (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              )}
                            </div>

                            {!notification.isRead && (
                              <button
                                type="button"
                                onClick={() =>
                                  markAsRead(
                                    notification._id
                                  )
                                }
                                className="shrink-0 text-[11px] text-emerald-400 transition hover:text-emerald-300"
                              >
                                Read
                              </button>
                            )}
                          </div>

                          <p className="mt-1 text-xs leading-5 text-white/50">
                            {notification.message}
                          </p>

                          {/* Product */}
                          {notification.product && (
                            <div className="mt-2 inline-flex rounded-md border border-white/10 bg-white/[0.02] px-2 py-1">
                              <span className="text-[10px] uppercase tracking-wider text-white/30">
                                Product:
                              </span>

                              <span className="ml-1 text-[10px] font-medium text-emerald-400">
                                {notification.product.productId}
                              </span>
                            </div>
                          )}

                          {/* Time */}
                          <p className="mt-2 text-[10px] text-white/25">
                            {notification.createdAt
                              ? new Date(
                                  notification.createdAt
                                ).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

              {/* =====================================
                  FOOTER
              ===================================== */}
              {notifications.length > 0 && (
                <div className="border-t border-white/10 px-5 py-3">
                  <p className="text-center text-[10px] uppercase tracking-widest text-white/20">
                    ChainTrace Notification Center
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;