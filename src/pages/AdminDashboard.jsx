import NotificationBell from "../components/NotificationBell";
import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bell,
  Blocks,
  Box,
  CheckCircle2,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import api from "../services/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const roleConfig = {
  ADMIN: {
    label: "Administrator",
    icon: ShieldCheck,
  },
  MANUFACTURER: {
    label: "Manufacturer",
    icon: Package,
  },
  SUPPLIER: {
    label: "Supplier",
    icon: Box,
  },
  DISTRIBUTOR: {
    label: "Distributor",
    icon: Activity,
  },
  RETAILER: {
    label: "Retailer",
    icon: Package,
  },
  CUSTOMER: {
    label: "Customer",
    icon: UserRound,
  },
};

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/20 hover:bg-white/[0.045]">
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
        <Icon size={19} className="text-emerald-300" />
      </div>

      <p className="text-sm text-zinc-400">{label}</p>

      <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function RoleBadge({ role }) {
  const styles = {
    ADMIN:
      "border-purple-400/20 bg-purple-400/10 text-purple-300",
    MANUFACTURER:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
    SUPPLIER:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    DISTRIBUTOR:
      "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
    RETAILER:
      "border-orange-400/20 bg-orange-400/10 text-orange-300",
    CUSTOMER:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
        styles[role] ||
        "border-white/10 bg-white/5 text-zinc-300"
      }`}
    >
      {role || "UNKNOWN"}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "Unknown";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminDashboard() {
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    manufacturers: 0,
    suppliers: 0,
    distributors: 0,
    retailers: 0,
    customers: 0,
    totalProducts: 0,
    blockchainEvents: 0,
  });

  const [users, setUsers] = useState([]);

  // ============================
  // PRODUCTS
  // ============================

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // ============================
  // NOTIFICATIONS
  // ============================

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] =
    useState(true);

  // ============================
  // AUDIT LOGS
  // ============================

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(true);

  // ============================
  // VERIFICATION HISTORY
  // ============================
  const [verificationHistory, setVerificationHistory] = useState([]);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [verificationSearch, setVerificationSearch] = useState("");
  const [verificationResultFilter, setVerificationResultFilter] = useState("ALL");
  const [trendRange, setTrendRange] = useState(7);

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [roleChanges, setRoleChanges] = useState({});

  const [productStatusChanges, setProductStatusChanges] =
    useState({});

  useEffect(() => {
    fetchAdminDashboard();
    fetchNotifications();
    fetchVerificationHistory();
  }, []);

  // ============================
  // Fetch Admin Dashboard
  // ============================

  const fetchAdminDashboard = async () => {
    try {
      setLoading(true);
      setError("");
      setAuditLogsLoading(true);

      const [
        userResponse,
        statsResponse,
        usersResponse,
        productsResponse,
        auditLogsResponse,
      ] = await Promise.all([
        api.get("/users/me"),
        api.get("/users/stats"),
        api.get("/users"),
        api.get("/products"),
        api.get("/audit-logs"),
      ]);

      const currentUser = userResponse.data.user;

      setUser(currentUser);

      setStats(
        statsResponse.data.stats || {
          totalUsers: 0,
          manufacturers: 0,
          suppliers: 0,
          distributors: 0,
          retailers: 0,
          customers: 0,
          totalProducts: 0,
          blockchainEvents: 0,
        }
      );

      setUsers(usersResponse.data.users || []);

      setProducts(productsResponse.data.products || []);

      setAuditLogs(
        auditLogsResponse.data.logs || []
      );
    } catch (err) {
      console.error("Admin dashboard error:", err);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to load admin dashboard."
        );
      }
    } finally {
      setLoading(false);
      setUsersLoading(false);
      setProductsLoading(false);
      setAuditLogsLoading(false);
    }
  };

  // ============================
  // Refresh Users
  // ============================

  const refreshUsers = async () => {
    try {
      setUsersLoading(true);
      setError("");

      const response = await api.get("/users");

      setUsers(response.data.users || []);

      setSuccessMessage(
        "Users refreshed successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to refresh users."
      );
    } finally {
      setUsersLoading(false);
    }
  };

  // ============================
  // Refresh Products
  // ============================

  const refreshProducts = async () => {
    try {
      setProductsLoading(true);
      setError("");

      const response = await api.get("/products");

      setProducts(response.data.products || []);

      setSuccessMessage(
        "Products refreshed successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to refresh products."
      );
    } finally {
      setProductsLoading(false);
    }
  };

  // ============================
  // Fetch Verification History
  // ADMIN ONLY
  // ============================

  const fetchVerificationHistory = async () => {
    try {
      setVerificationLoading(true);
      const response = await api.get("/verification/admin/history");
      setVerificationHistory(response.data.verifications || []);
    } catch (err) {
      console.error("Verification history fetch error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load verification history."
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  // ============================
  // Fetch All Notifications
  // ADMIN ONLY
  // ============================

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);

      const response = await api.get(
        "/notifications/admin/all"
      );

      setNotifications(
        response.data.notifications || []
      );
    } catch (err) {
      console.error(
        "Notification fetch error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load notifications."
      );
    } finally {
      setNotificationsLoading(false);
    }
  };

  // ============================
  // Refresh Audit Logs
  // ============================

  const refreshAuditLogs = async () => {
    try {
      setAuditLogsLoading(true);
      setError("");

      const response = await api.get("/audit-logs");

      setAuditLogs(response.data.logs || []);

      setSuccessMessage(
        "Audit logs refreshed successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to refresh audit logs."
      );
    } finally {
      setAuditLogsLoading(false);
    }
  };

  // ============================
  // Change Role
  // ============================

  const handleRoleChange = async (userId) => {
    const newRole = roleChanges[userId];

    if (!newRole) {
      return;
    }

    try {
      setActionLoading(`role-${userId}`);
      setError("");
      setSuccessMessage("");

      const response = await api.patch(
        `/users/${userId}/role`,
        {
          role: newRole,
        }
      );

      setUsers((prevUsers) =>
        prevUsers.map((item) =>
          item._id === userId
            ? {
                ...item,
                role:
                  response.data.user?.role ||
                  newRole,
              }
            : item
        )
      );

      setSuccessMessage(
        response.data.message ||
          "User role updated successfully."
      );

      setRoleChanges((prev) => ({
        ...prev,
        [userId]: "",
      }));

      await refreshStatsOnly();

      // Refresh audit logs because role changes
      // may create an audit record later.
      await refreshAuditLogs();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to update user role."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ============================
  // Refresh Stats
  // ============================

  const refreshStatsOnly = async () => {
    try {
      const response = await api.get(
        "/users/stats"
      );

      setStats(
        response.data.stats || stats
      );
    } catch (err) {
      console.error(err);
    }
  };

  // ============================
  // Delete User
  // ============================

  const handleDeleteUser = async (targetUser) => {
    if (!targetUser?._id) {
      return;
    }

    if (
      targetUser._id === user?._id
    ) {
      setError(
        "You cannot delete your own Admin account."
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete user "${targetUser.name}" (${targetUser.email})?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(
        `delete-${targetUser._id}`
      );

      setError("");
      setSuccessMessage("");

      const response = await api.delete(
        `/users/${targetUser._id}`
      );

      setUsers((prevUsers) =>
        prevUsers.filter(
          (item) =>
            item._id !== targetUser._id
        )
      );

      setSuccessMessage(
        response.data.message ||
          "User deleted successfully."
      );

      await refreshStatsOnly();

      // Refresh audit logs
      await refreshAuditLogs();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to delete user."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ==========================================
  // Update Product Status
  // ADMIN ONLY
  // ==========================================

  const handleProductStatusChange = async (productId) => {
    const newStatus = productStatusChanges[productId];

    if (!newStatus) {
      return;
    }

    try {
      setActionLoading(`product-status-${productId}`);
      setError("");
      setSuccessMessage("");

      const response = await api.patch(
        `/products/${productId}/status`,
        {
          status: newStatus,
        }
      );

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          product.productId === productId
            ? {
                ...product,
                status:
                  response.data.product?.status ||
                  newStatus,
              }
            : product
        )
      );

      setProductStatusChanges((previous) => ({
        ...previous,
        [productId]: "",
      }));

      setSuccessMessage(
        response.data.message ||
          "Product status updated successfully."
      );

      await refreshAuditLogs();
      await fetchNotifications();
      await refreshStatsOnly();
    } catch (err) {
      console.error(
        "Product status update error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update product status."
      );
    } finally {
      setActionLoading("");
    }
  };

  // ============================
  // Logout
  // ============================

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  // ============================
  // Loading
  // ============================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070a] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="h-8 w-56 animate-pulse rounded-lg bg-white/10" />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // Login Redirect
  // ============================

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // ============================
  // Admin Protection
  // ============================

  if (user.role !== "ADMIN") {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  const normalizedVerificationSearch = verificationSearch.trim().toLowerCase();
  const filteredVerificationHistory = verificationHistory.filter((verification) => {
    const productId = (
      verification.product?.productId ||
      verification.scannedProductId ||
      ""
    ).toLowerCase();
    const productName = (verification.product?.name || "").toLowerCase();
    const resultMatches =
      verificationResultFilter === "ALL" ||
      verification.verificationResult === verificationResultFilter;
    const searchMatches =
      !normalizedVerificationSearch ||
      productId.includes(normalizedVerificationSearch) ||
      productName.includes(normalizedVerificationSearch);

    return resultMatches && searchMatches;
  });

  // Build the selected date range first so every analytics component
  // (KPI cards, result chart, method chart, and daily trend) uses the same
  // date window. The source history remains unchanged for search/filter/table.
  // Build a local-date series from the verification records already loaded.
  // The selected range includes today and the preceding (range - 1) days.
  const verificationTrendData = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = Array.from({ length: trendRange }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (trendRange - 1 - index));
      const key = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
      ].join("-");

      return {
        key,
        date,
        label: date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        authentic: 0,
        warnings: 0,
        notVerified: 0,
        total: 0,
      };
    });

    const dayIndex = new Map(days.map((day, index) => [day.key, index]));

    verificationHistory.forEach((item) => {
      if (!item.createdAt) return;

      const timestamp = new Date(item.createdAt);
      if (Number.isNaN(timestamp.getTime())) return;

      const key = [
        timestamp.getFullYear(),
        String(timestamp.getMonth() + 1).padStart(2, "0"),
        String(timestamp.getDate()).padStart(2, "0"),
      ].join("-");

      const index = dayIndex.get(key);
      if (index === undefined) return;

      const day = days[index];
      day.total += 1;

      if (item.verificationResult === "AUTHENTIC") {
        day.authentic += 1;
      } else if (item.verificationResult === "WARNING") {
        day.warnings += 1;
      } else if (item.verificationResult === "NOT_VERIFIED") {
        day.notVerified += 1;
      }
    });

    return days;
  })();

  const selectedTrendKeys = new Set(
    verificationTrendData.map((day) => day.key)
  );

  const verificationRangeHistory = verificationHistory.filter((item) => {
    if (!item.createdAt) return false;

    const timestamp = new Date(item.createdAt);
    if (Number.isNaN(timestamp.getTime())) return false;

    const key = [
      timestamp.getFullYear(),
      String(timestamp.getMonth() + 1).padStart(2, "0"),
      String(timestamp.getDate()).padStart(2, "0"),
    ].join("-");

    return selectedTrendKeys.has(key);
  });

  const verificationAnalytics = {
    total: verificationRangeHistory.length,
    authentic: verificationRangeHistory.filter(
      (item) => item.verificationResult === "AUTHENTIC"
    ).length,
    warnings: verificationRangeHistory.filter(
      (item) => item.verificationResult === "WARNING"
    ).length,
    notVerified: verificationRangeHistory.filter(
      (item) => item.verificationResult === "NOT_VERIFIED"
    ).length,
    blockchainVerified: verificationRangeHistory.filter(
      (item) => item.blockchainVerified === true
    ).length,
  };

  const blockchainSuccessRate = verificationAnalytics.total
    ? Math.round(
        (verificationAnalytics.blockchainVerified /
          verificationAnalytics.total) *
          100
      )
    : 0;

  const verificationResultChartData = [
    { name: "Authentic", value: verificationAnalytics.authentic, color: "#34d399" },
    { name: "Warning", value: verificationAnalytics.warnings, color: "#fbbf24" },
    { name: "Not verified", value: verificationAnalytics.notVerified, color: "#f87171" },
  ].filter((item) => item.value > 0);

  const verificationMethodCounts = verificationRangeHistory.reduce(
    (counts, item) => {
      const method = item.verificationMethod || "UNKNOWN";
      counts[method] = (counts[method] || 0) + 1;
      return counts;
    },
    {}
  );

  const verificationMethodChartData = [
    { method: "QR Code", count: verificationMethodCounts.QR_CODE || 0 },
    { method: "Product ID", count: verificationMethodCounts.PRODUCT_ID || 0 },
    { method: "API", count: verificationMethodCounts.API || 0 },
    {
      method: "Other",
      count: Object.entries(verificationMethodCounts).reduce(
        (total, [method, count]) =>
          ["QR_CODE", "PRODUCT_ID", "API"].includes(method)
            ? total
            : total + count,
        0
      ),
    },
  ];

  const verificationTrendTotals = verificationTrendData.reduce(
    (totals, day) => ({
      total: totals.total + day.total,
      authentic: totals.authentic + day.authentic,
      warnings: totals.warnings + day.warnings,
      notVerified: totals.notVerified + day.notVerified,
    }),
    { total: 0, authentic: 0, warnings: 0, notVerified: 0 }
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-white">

      {/* Background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-500/[0.06] blur-[140px]" />

        <div className="absolute bottom-[-200px] right-[-100px] h-[450px] w-[450px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
      </div>

      <main className="relative mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* Header */}

        <header className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-300">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              ChainTrace Administration

            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Monitor users, products and blockchain activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* Notification Bell */}
            <NotificationBell />

            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
            >
              User Dashboard
              <ArrowRight size={15} />
            </Link>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-400/10"
            >
              Logout
            </button>

          </div>
        </header>

        {/* Error */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-4 text-sm text-red-300">

            <XCircle size={18} />

            {error}

          </div>
        )}

        {/* Success */}

        {successMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-4 text-sm text-emerald-300">

            <CheckCircle2 size={18} />

            {successMessage}

          </div>
        )}

        {/* Admin Identity */}

        <section className="mb-6 overflow-hidden rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-emerald-400/[0.07] to-white/[0.02]">

          <div className="flex flex-col gap-5 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">

                <ShieldCheck
                  size={26}
                  className="text-emerald-300"
                />

              </div>

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Administrator
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  {user.name}
                </h2>

                <p className="mt-1 text-sm text-zinc-400">
                  {user.email}
                </p>

              </div>

            </div>

            <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">

              <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-300/70">
                Access Level
              </p>

              <p className="mt-1 text-sm font-medium text-emerald-300">
                Full Administration
              </p>

            </div>

          </div>

        </section>

        {/* Stats */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers}
            description="Registered ChainTrace users"
          />

          <StatCard
            icon={Package}
            label="Manufacturers"
            value={stats.manufacturers}
            description="Product manufacturers"
          />

          <StatCard
            icon={Box}
            label="Suppliers"
            value={stats.suppliers}
            description="Supply partners"
          />

          <StatCard
            icon={Activity}
            label="Distributors"
            value={stats.distributors}
            description="Distribution partners"
          />

          <StatCard
            icon={Package}
            label="Retailers"
            value={stats.retailers}
            description="Registered retailers"
          />

          <StatCard
            icon={UserRound}
            label="Customers"
            value={stats.customers}
            description="Customer accounts"
          />

          <StatCard
            icon={Wallet}
            label="Products"
            value={stats.totalProducts}
            description="Registered products"
          />

          <StatCard
            icon={Blocks}
            label="Blockchain Events"
            value={stats.blockchainEvents}
            description="Recorded supply-chain events"
          />

        </section>

        {/* Users */}

        <section className="mt-10">

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Administration
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                User Management
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Manage registered ChainTrace accounts and their roles.
              </p>

            </div>

            <button
              onClick={refreshUsers}
              disabled={usersLoading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >

              <RefreshCw
                size={14}
                className={
                  usersLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh Users

            </button>

          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

            {usersLoading ? (

              <div className="space-y-3 p-5">

                {Array.from({ length: 5 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-xl bg-white/5"
                    />
                  )
                )}

              </div>

            ) : users.length === 0 ? (

              <div className="px-6 py-16 text-center">

                <Users
                  size={32}
                  className="mx-auto text-zinc-600"
                />

                <p className="mt-4 text-sm text-zinc-400">
                  No users found.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[900px]">

                  <thead>

                    <tr className="border-b border-white/10 text-left">

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        User
                      </th>

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Organization
                      </th>

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Role
                      </th>

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Created
                      </th>

                      <th className="px-5 py-4 text-right text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-white/10">

                    {users.map((item) => {

                      const isCurrentUser =
                        item._id === user._id;

                      const isRoleLoading =
                        actionLoading ===
                        `role-${item._id}`;

                      const isDeleteLoading =
                        actionLoading ===
                        `delete-${item._id}`;

                      return (

                        <tr
                          key={item._id}
                          className="transition hover:bg-white/[0.02]"
                        >

                          {/* User */}

                          <td className="px-5 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">

                                <UserRound
                                  size={17}
                                  className="text-zinc-400"
                                />

                              </div>

                              <div className="min-w-0">

                                <p className="font-medium text-white">
                                  {item.name}
                                </p>

                                <p className="mt-1 text-xs text-zinc-500">
                                  {item.email}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Organization */}

                          <td className="px-5 py-5">

                            <span className="text-sm text-zinc-400">
                              {item.organization ||
                                "Independent"}
                            </span>

                          </td>

                          {/* Role */}

                          <td className="px-5 py-5">

                            <RoleBadge
                              role={item.role}
                            />

                          </td>

                          {/* Created */}

                          <td className="px-5 py-5">

                            <span className="text-xs text-zinc-500">

                              {formatDate(
                                item.createdAt
                              )}

                            </span>

                          </td>

                          {/* Actions */}

                          <td className="px-5 py-5">

                            {isCurrentUser ? (

                              <div className="flex justify-end">

                                <span className="rounded-lg border border-purple-400/20 bg-purple-400/10 px-3 py-2 text-[10px] text-purple-300">
                                  CURRENT ADMIN
                                </span>

                              </div>

                            ) : (

                              <div className="flex items-center justify-end gap-2">

                                <select
                                  value={
                                    roleChanges[
                                      item._id
                                    ] || ""
                                  }
                                  onChange={(event) =>
                                    setRoleChanges(
                                      (prev) => ({
                                        ...prev,
                                        [item._id]:
                                          event.target
                                            .value,
                                      })
                                    )
                                  }
                                  className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-400/40"
                                >

                                  <option value="">
                                    Change role
                                  </option>

                                  {Object.keys(
                                    roleConfig
                                  ).map((role) => (

                                    <option
                                      key={role}
                                      value={role}
                                    >
                                      {role}
                                    </option>

                                  ))}

                                </select>

                                <button
                                  onClick={() =>
                                    handleRoleChange(
                                      item._id
                                    )
                                  }
                                  disabled={
                                    !roleChanges[
                                      item._id
                                    ] ||
                                    isRoleLoading
                                  }
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                                >

                                  {isRoleLoading ? (

                                    <Loader2
                                      size={13}
                                      className="animate-spin"
                                    />

                                  ) : (

                                    "Update"

                                  )}

                                </button>

                                <button
                                  onClick={() =>
                                    handleDeleteUser(
                                      item
                                    )
                                  }
                                  disabled={
                                    isDeleteLoading
                                  }
                                  className="inline-flex items-center justify-center rounded-lg border border-red-400/20 bg-red-400/5 p-2 text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
                                  title="Delete user"
                                >

                                  {isDeleteLoading ? (

                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />

                                  ) : (

                                    <Trash2
                                      size={14}
                                    />

                                  )}

                                </button>

                              </div>

                            )}

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

        {/* ================================================== */}
        {/* PRODUCT MANAGEMENT */}
        {/* ================================================== */}

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Administration
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                Product Management
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Monitor registered products, ownership and blockchain records.
              </p>
            </div>

            <button
              onClick={refreshProducts}
              disabled={productsLoading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={productsLoading ? "animate-spin" : ""}
              />
              Refresh Products
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            {productsLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-20 animate-pulse rounded-xl bg-white/5"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Package size={32} className="mx-auto text-zinc-600" />
                <p className="mt-4 text-sm text-zinc-400">
                  No products found.
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Registered products will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Product</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Category</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Manufacturer</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Current Owner</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Status</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Blockchain TX</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Created</th>
                      <th className="px-5 py-4 text-right text-[10px] uppercase tracking-[0.16em] text-zinc-600">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {products.map((product) => {
                      const statusStyles = {
                        REGISTERED: "border-blue-400/20 bg-blue-400/10 text-blue-300",
                        IN_TRANSIT: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
                        DELIVERED: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                        UNDER_REVIEW: "border-orange-400/20 bg-orange-400/10 text-orange-300",
                        FLAGGED: "border-red-400/20 bg-red-400/10 text-red-300",
                      };

                      return (
                        <tr key={product._id} className="transition hover:bg-white/[0.02]">
                          <td className="px-5 py-5">
                            <p className="text-sm font-semibold text-emerald-300">{product.productId}</p>
                            <p className="mt-1 max-w-[220px] truncate text-sm text-white">{product.name}</p>
                            <p className="mt-1 max-w-[260px] truncate text-xs text-zinc-600">{product.description || "No description"}</p>
                          </td>

                          <td className="px-5 py-5">
                            <span className="text-sm text-zinc-400">{product.category || "—"}</span>
                            <p className="mt-1 text-xs text-zinc-600">{product.location || "Location unavailable"}</p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm text-zinc-300">{product.manufacturer?.name || "Unknown"}</p>
                            <p className="mt-1 text-xs text-zinc-600">{product.manufacturer?.organization || product.manufacturer?.email || "—"}</p>
                          </td>

                          <td className="px-5 py-5">
                            <p className="text-sm text-zinc-300">{product.currentOwner?.name || "Unknown"}</p>
                            <p className="mt-1 text-xs text-zinc-600">{product.currentOwner?.organization || product.currentOwner?.email || "—"}</p>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex flex-col gap-2">
                              <span
                                className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                                  statusStyles[product.status] ||
                                  "border-white/10 bg-white/5 text-zinc-300"
                                }`}
                              >
                                {product.status || "UNKNOWN"}
                              </span>

                              <div className="flex items-center gap-2">
                                <select
                                  value={
                                    productStatusChanges[
                                      product.productId
                                    ] || ""
                                  }
                                  onChange={(event) =>
                                    setProductStatusChanges(
                                      (previous) => ({
                                        ...previous,
                                        [product.productId]:
                                          event.target.value,
                                      })
                                    )
                                  }
                                  className="rounded-lg border border-white/10 bg-black/40 px-2.5 py-2 text-[10px] text-zinc-300 outline-none transition focus:border-emerald-400/40"
                                >
                                  <option value="">
                                    Change status
                                  </option>

                                  <option value="REGISTERED">
                                    REGISTERED
                                  </option>

                                  <option value="IN_TRANSIT">
                                    IN_TRANSIT
                                  </option>

                                  <option value="DELIVERED">
                                    DELIVERED
                                  </option>

                                  <option value="UNDER_REVIEW">
                                    UNDER_REVIEW
                                  </option>

                                  <option value="FLAGGED">
                                    FLAGGED
                                  </option>
                                </select>

                                <button
                                  onClick={() =>
                                    handleProductStatusChange(
                                      product.productId
                                    )
                                  }
                                  disabled={
                                    !productStatusChanges[
                                      product.productId
                                    ] ||
                                    actionLoading ===
                                      `product-status-${product.productId}`
                                  }
                                  className="inline-flex items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-2 text-[10px] font-medium text-emerald-300 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  {actionLoading ===
                                  `product-status-${product.productId}` ? (
                                    <Loader2
                                      size={12}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    "Update"
                                  )}
                                </button>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            {product.blockchainTxHash ? (
                              <div className="max-w-[180px]">
                                <p className="truncate font-mono text-[10px] text-zinc-400" title={product.blockchainTxHash}>
                                  {product.blockchainTxHash}
                                </p>
                                <p className="mt-1 text-[10px] text-emerald-300">Ethereum</p>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-600">Not available</span>
                            )}
                          </td>

                          <td className="px-5 py-5">
                            <span className="whitespace-nowrap text-xs text-zinc-500">{formatDate(product.createdAt)}</span>
                          </td>

                          <td className="px-5 py-5 text-right">
                            <Link
                              to={`/product/${product.productId}`}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-300 transition hover:bg-emerald-400/15"
                            >
                              View
                              <ExternalLink size={13} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* NOTIFICATION MANAGEMENT */}
        {/* ================================================== */}

        <section className="mt-10">

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Administration
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Notification Management
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Monitor notifications generated across ChainTrace.
              </p>

            </div>

            <button
              onClick={fetchNotifications}
              disabled={notificationsLoading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={
                  notificationsLoading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh Notifications
            </button>

          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

            {notificationsLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 4 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-xl bg-white/5"
                    />
                  )
                )}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Bell
                  size={32}
                  className="mx-auto text-zinc-600"
                />
                <p className="mt-4 text-sm text-zinc-400">
                  No notifications found.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Notification
                      </th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        User
                      </th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Role
                      </th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Product
                      </th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Status
                      </th>
                      <th className="px-5 py-4 text-right text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Time
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {notifications.map((notification) => (
                      <tr
                        key={notification._id}
                        className="transition hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-5">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                              <Bell
                                size={15}
                                className="text-emerald-300"
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="font-medium text-white">
                                {notification.title}
                              </p>
                              <p className="mt-1 max-w-md text-xs leading-5 text-zinc-500">
                                {notification.message}
                              </p>
                              <p className="mt-2 text-[10px] uppercase tracking-wider text-zinc-600">
                                {notification.type}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="text-sm text-zinc-300">
                            {notification.user?.name || "Unknown"}
                          </p>
                          <p className="mt-1 text-xs text-zinc-600">
                            {notification.user?.email || "No email"}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <RoleBadge role={notification.user?.role} />
                        </td>

                        <td className="px-5 py-5">
                          {notification.product ? (
                            <div>
                              <p className="text-xs font-medium text-emerald-300">
                                {notification.product.productId}
                              </p>
                              <p className="mt-1 text-xs text-zinc-600">
                                {notification.product.name}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-600">
                              System
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          {notification.isRead ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-500">
                              <CheckCircle2 size={11} />
                              Read
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Unread
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-5 text-right">
                          <span className="whitespace-nowrap text-xs text-zinc-600">
                            {formatDate(notification.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* VERIFICATION ANALYTICS */}
        {/* ================================================== */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
              Insights
            </p>
            <h2 className="mt-1 text-xl font-semibold">
              Verification Analytics
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Overview of verification attempts within the selected date range.
            </p>
            <p className="mt-2 text-xs text-zinc-600">
              The KPI cards and both summary charts follow the Daily Verification Trend range selector below.
            </p>
          </div>

          {verificationLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-sm text-zinc-400">Total attempts</p>
                  <p className="mt-2 text-3xl font-semibold text-white">
                    {verificationAnalytics.total}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">Attempts in selected range</p>
                </div>
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.04] p-5">
                  <p className="text-sm text-zinc-400">Authentic results</p>
                  <p className="mt-2 text-3xl font-semibold text-emerald-300">
                    {verificationAnalytics.authentic}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">Marked AUTHENTIC by verification</p>
                </div>
                <div className="rounded-2xl border border-yellow-400/15 bg-yellow-400/[0.04] p-5">
                  <p className="text-sm text-zinc-400">Warnings</p>
                  <p className="mt-2 text-3xl font-semibold text-yellow-300">
                    {verificationAnalytics.warnings}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">Records marked WARNING</p>
                </div>
                <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.04] p-5">
                  <p className="text-sm text-zinc-400">Blockchain success rate</p>
                  <p className="mt-2 text-3xl font-semibold text-cyan-300">
                    {blockchainSuccessRate}%
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {verificationAnalytics.blockchainVerified} of {verificationAnalytics.total} records have blockchainVerified = true
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <div className="mb-4">
                    <h3 className="font-medium text-white">Verification Results</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Breakdown by result for the selected date range.
                    </p>
                  </div>
                  {verificationAnalytics.total === 0 ? (
                    <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                      No verification data available yet.
                    </div>
                  ) : verificationResultChartData.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                      No categorized verification results available.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={verificationResultChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="46%"
                          innerRadius={62}
                          outerRadius={92}
                          paddingAngle={3}
                          stroke="none"
                        >
                          {verificationResultChartData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#090b10",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          itemStyle={{ color: "#e4e4e7" }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          formatter={(value) => (
                            <span style={{ color: "#a1a1aa", fontSize: 12 }}>
                              {value}
                            </span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  <div className="mt-2 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-emerald-300">
                        {verificationAnalytics.authentic}
                      </p>
                      <p className="text-[10px] text-zinc-500">Authentic</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-yellow-300">
                        {verificationAnalytics.warnings}
                      </p>
                      <p className="text-[10px] text-zinc-500">Warnings</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-red-300">
                        {verificationAnalytics.notVerified}
                      </p>
                      <p className="text-[10px] text-zinc-500">Not verified</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                  <div className="mb-4">
                    <h3 className="font-medium text-white">Verification Methods</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Number of verification records by method in the selected date range.
                    </p>
                  </div>
                  {verificationAnalytics.total === 0 ? (
                    <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                      No verification data available yet.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={verificationMethodChartData}
                        margin={{ top: 8, right: 8, left: -18, bottom: 4 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.08)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="method"
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: "#a1a1aa", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#090b10",
                            border: "1px solid rgba(255,255,255,0.12)",
                            borderRadius: "12px",
                            color: "#fff",
                          }}
                          cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        />
                        <Bar
                          dataKey="count"
                          name="Attempts"
                          fill="#34d399"
                          radius={[7, 7, 0, 0]}
                          maxBarSize={56}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  <p className="mt-2 border-t border-white/10 pt-4 text-xs text-zinc-500">
                    Method counts use the verificationMethod field for the selected date range.
                  </p>
                </div>
              </div>

              {/* Daily Verification Trend */}
              <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-medium text-white">Daily Verification Trend</h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      Daily result counts from the currently loaded verification history.
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>Time range</span>
                    <select
                      value={trendRange}
                      onChange={(event) => setTrendRange(Number(event.target.value))}
                      aria-label="Daily verification trend time range"
                      className="rounded-lg border border-white/10 bg-[#0b0d10] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-emerald-400/40"
                    >
                      <option value={7}>Last 7 days</option>
                      <option value={30}>Last 30 days</option>
                      <option value={90}>Last 90 days</option>
                    </select>
                  </label>
                </div>

                {verificationTrendTotals.total === 0 ? (
                  <div className="flex h-72 items-center justify-center text-sm text-zinc-500">
                    No verification records in the selected date range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={verificationTrendData}
                      margin={{ top: 8, right: 12, left: -16, bottom: 4 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.08)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        minTickGap={20}
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                        tickLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fill: "#a1a1aa", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#090b10",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: "12px",
                          color: "#fff",
                        }}
                        labelStyle={{ color: "#e4e4e7" }}
                        itemStyle={{ color: "#e4e4e7" }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        formatter={(value) => (
                          <span style={{ color: "#a1a1aa", fontSize: 12 }}>
                            {value}
                          </span>
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="authentic"
                        name="Authentic"
                        stroke="#34d399"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="warnings"
                        name="Warning"
                        stroke="#fbbf24"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="notVerified"
                        name="Not verified"
                        stroke="#f87171"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}

                <div className="mt-2 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-zinc-500">Attempts in range</p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {verificationTrendTotals.total}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Authentic</p>
                    <p className="mt-1 text-lg font-semibold text-emerald-300">
                      {verificationTrendTotals.authentic}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Warnings</p>
                    <p className="mt-1 text-lg font-semibold text-yellow-300">
                      {verificationTrendTotals.warnings}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Not verified</p>
                    <p className="mt-1 text-lg font-semibold text-red-300">
                      {verificationTrendTotals.notVerified}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ================================================== */}
        {/* VERIFICATION HISTORY */}
        {/* ================================================== */}

        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Security</p>
              <h2 className="mt-1 text-xl font-semibold">Verification History</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Review product verification results and blockchain proof.
              </p>
              <p className="mt-2 text-xs text-zinc-600">
                Showing {filteredVerificationHistory.length} of {verificationHistory.length} records
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <label className="relative block min-w-0 sm:min-w-[230px]">
                <Search
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  type="search"
                  value={verificationSearch}
                  onChange={(event) => setVerificationSearch(event.target.value)}
                  placeholder="Search product ID or name"
                  aria-label="Search verification history by product ID or name"
                  className="w-full rounded-xl border border-white/10 bg-black/30 py-2.5 pl-9 pr-3 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/40"
                />
              </label>
              <select
                value={verificationResultFilter}
                onChange={(event) => setVerificationResultFilter(event.target.value)}
                aria-label="Filter verification results"
                className="rounded-xl border border-white/10 bg-[#0b0d10] px-3 py-2.5 text-xs text-zinc-300 outline-none focus:border-emerald-400/40"
              >
                <option value="ALL">All results</option>
                <option value="AUTHENTIC">Authentic</option>
                <option value="WARNING">Warning</option>
                <option value="NOT_VERIFIED">Not verified</option>
              </select>
              <button
                onClick={fetchVerificationHistory}
                disabled={verificationLoading}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
              >
                <RefreshCw size={14} className={verificationLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
            {verificationLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-xl bg-white/5" />
                ))}
              </div>
            ) : verificationHistory.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <ShieldCheck size={32} className="mx-auto text-zinc-600" />
                <p className="mt-4 text-sm text-zinc-400">No verification history found.</p>
              </div>
            ) : filteredVerificationHistory.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <Search size={30} className="mx-auto text-zinc-600" />
                <p className="mt-4 text-sm text-zinc-400">No records match these filters.</p>
                <button
                  type="button"
                  onClick={() => {
                    setVerificationSearch("");
                    setVerificationResultFilter("ALL");
                  }}
                  className="mt-3 text-xs text-emerald-300 hover:text-emerald-200"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1200px]">
                  <thead>
                    <tr className="border-b border-white/10 text-left">
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Product</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Result</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Risk</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Blockchain</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Ownership</th>
                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">Method</th>
                      <th className="px-5 py-4 text-right text-[10px] uppercase tracking-[0.16em] text-zinc-600">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredVerificationHistory.map((verification) => {
                      const resultStyles = {
                        AUTHENTIC: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                        WARNING: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
                        NOT_VERIFIED: "border-red-400/20 bg-red-400/10 text-red-300",
                      };
                      const riskStyles = {
                        LOW: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
                        MEDIUM: "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
                        HIGH: "border-red-400/20 bg-red-400/10 text-red-300",
                      };
                      return (
                        <tr key={verification._id} className="transition hover:bg-white/[0.02]">
                          <td className="px-5 py-5">
                            <p className="text-sm font-semibold text-emerald-300">{verification.product?.productId || verification.scannedProductId || "—"}</p>
                            <p className="mt-1 text-sm text-white">{verification.product?.name || "Unknown Product"}</p>
                            <p className="mt-1 text-xs text-zinc-600">{verification.product?.category || "—"}</p>
                          </td>
                          <td className="px-5 py-5">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${resultStyles[verification.verificationResult] || "border-white/10 bg-white/5 text-zinc-300"}`}>
                              {verification.verificationResult || "UNKNOWN"}
                            </span>
                          </td>
                          <td className="px-5 py-5">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-medium ${riskStyles[verification.riskLevel] || "border-white/10 bg-white/5 text-zinc-300"}`}>
                              {verification.riskLevel || "UNKNOWN"}
                            </span>
                          </td>
                          <td className="px-5 py-5">
                            {verification.blockchainVerified ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">
                                <CheckCircle2 size={11} /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[10px] text-red-300">
                                <XCircle size={11} /> Failed
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-5">
                            {verification.ownershipValid ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] text-emerald-300">
                                <CheckCircle2 size={11} /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[10px] text-red-300">
                                <XCircle size={11} /> Invalid
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-5">
                            <span className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-400">
                              {verification.verificationMethod || "—"}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-right">
                            <span className="whitespace-nowrap text-xs text-zinc-500">{formatDate(verification.createdAt)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* AUDIT LOGS - ADMIN SECURITY ACTIVITY */}
        {/* ================================================== */}

        <section className="mt-10">

          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Security
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Audit Logs
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Track important administrative and supply-chain actions.
              </p>

            </div>

            <button
              onClick={refreshAuditLogs}
              disabled={auditLogsLoading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
            >

              <RefreshCw
                size={14}
                className={
                  auditLogsLoading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh Logs

            </button>

          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

            {auditLogsLoading ? (

              <div className="space-y-3 p-5">

                {Array.from({ length: 4 }).map(
                  (_, index) => (

                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-xl bg-white/5"
                    />

                  )
                )}

              </div>

            ) : auditLogs.length === 0 ? (

              <div className="px-6 py-16 text-center">

                <Activity
                  size={32}
                  className="mx-auto text-zinc-600"
                />

                <p className="mt-4 text-sm text-zinc-400">
                  No audit logs found.
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px]">

                  <thead>

                    <tr className="border-b border-white/10 text-left">

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Action
                      </th>

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        User
                      </th>

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Role
                      </th>

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Product
                      </th>

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Description
                      </th>

                      <th className="px-5 py-4 text-[10px] uppercase tracking-[0.16em] text-zinc-600">
                        Time
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-white/10">

                    {auditLogs.map((log) => (

                      <tr
                        key={log._id}
                        className="transition hover:bg-white/[0.02]"
                      >

                        {/* Action */}

                        <td className="px-5 py-5">

                          <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">

                            {log.action}

                          </span>

                        </td>

                        {/* User */}

                        <td className="px-5 py-5">

                          <div>

                            <p className="text-sm font-medium text-white">
                              {log.user?.name ||
                                "Unknown User"}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                              {log.user?.email ||
                                "Unknown"}
                            </p>

                          </div>

                        </td>

                        {/* Role */}

                        <td className="px-5 py-5">

                          <RoleBadge
                            role={
                              log.user?.role
                            }
                          />

                        </td>

                        {/* Product */}

                        <td className="px-5 py-5">

                          <span className="text-sm text-zinc-400">

                            {log.product?.productId ||
                              "—"}

                          </span>

                        </td>

                        {/* Description */}

                        <td className="max-w-md px-5 py-5">

                          <p className="text-sm text-zinc-400">

                            {log.description}

                          </p>

                        </td>

                        {/* Time */}

                        <td className="px-5 py-5">

                          <span className="whitespace-nowrap text-xs text-zinc-500">

                            {formatDate(
                              log.createdAt
                            )}

                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </section>

        {/* Admin Quick Actions */}

        <section className="mt-8 grid gap-4 md:grid-cols-3">

          <Link
            to="/products"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.03]"
          >

            <Package
              size={21}
              className="text-emerald-300"
            />

            <h3 className="mt-5 font-medium">
              Product Registry
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              View all registered supply-chain products.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400 group-hover:text-emerald-300">
              Browse products
              <ArrowRight size={14} />
            </div>

          </Link>

          <Link
            to="/verify"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.03]"
          >

            <ShieldCheck
              size={21}
              className="text-emerald-300"
            />

            <h3 className="mt-5 font-medium">
              Product Verification
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Verify product QR, hash and blockchain proof.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400 group-hover:text-emerald-300">
              Open verification
              <ArrowRight size={14} />
            </div>

          </Link>

          <Link
            to="/"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.03]"
          >

            <Blocks
              size={21}
              className="text-emerald-300"
            />

            <h3 className="mt-5 font-medium">
              ChainTrace Platform
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              Return to the public ChainTrace platform.
            </p>

            <div className="mt-5 flex items-center gap-2 text-xs text-zinc-400 group-hover:text-emerald-300">
              Go home
              <ArrowRight size={14} />
            </div>

          </Link>

        </section>

        {/* Footer */}

        <footer className="mt-12 border-t border-white/10 pt-6 text-center text-xs text-zinc-600">
          ChainTrace • Administration & Blockchain Supply Chain
        </footer>

      </main>
    </div>
  );
}