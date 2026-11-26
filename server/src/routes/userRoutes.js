const express = require("express");

const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const User = require("../models/User");
const Product = require("../models/Product");
const SupplyChainEvent = require("../models/SupplyChainEvent");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

const { randomBytes } = require("node:crypto");
const { rateLimit } = require("express-rate-limit");
const walletProofLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 20,
  keyGenerator: (req) => String(req.user._id),
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { success: false, message: "Too many wallet verification requests. Retry later." },
});
const { isAddress, verifyMessage } = require("ethers");

// Reject the first 20 accounts derived from the publicly documented Hardhat test mnemonic.
const { HDNodeWallet } = require("ethers");
const publicTestWallets = new Set(Array.from({ length: 20 }, (_, i) =>
  HDNodeWallet.fromPhrase("test test test test test test test test test test test junk", undefined, "m/44'/60'/0'/0/" + i).address.toLowerCase()
));

function walletProofMessage(userId, challenge) {
  return [
    "ChainTrace wallet ownership verification",
    "Purpose: prove control of the existing account wallet only.",
    "Account: " + userId,
    "Wallet: " + challenge.address,
    "Nonce: " + challenge.nonce,
    "Expires: " + new Date(challenge.expiresAt).toISOString(),
  ].join("\n");
}

router.post("/wallet/challenge", protect, walletProofLimiter, async (req, res) => {
  try {
    const address = String(req.user.walletAddress || "").toLowerCase();
    if (!isAddress(address)) return res.status(409).json({ success: false, message: "No valid existing wallet" });
    if (publicTestWallets.has(address)) return res.status(409).json({ success: false, message: "Public test wallet is not eligible for verification. Secure migration required." });
    const challenge = { address, nonce: randomBytes(32).toString("hex"), expiresAt: new Date(Date.now() + 300000) };
    const result = await User.updateOne({ _id: req.user._id, walletAddress: address }, { $set: { walletChallenge: challenge } });
    if (!result.matchedCount) return res.status(409).json({ success: false, message: "Wallet changed; retry" });
    return res.json({ success: true, message: walletProofMessage(req.user._id, challenge), expiresAt: challenge.expiresAt });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to create wallet challenge" });
  }
});

router.post("/wallet/verify", protect, walletProofLimiter, async (req, res) => {
  try {
    const signature = req.body?.signature;
    if (typeof signature !== "string" || !/^0x[0-9a-fA-F]{130}$/.test(signature)) return res.status(400).json({ success: false, message: "Invalid signature format" });
    const user = await User.findById(req.user._id).select("walletAddress +walletChallenge");
    const c = user?.walletChallenge;
    if (!c || c.expiresAt <= new Date() || c.address !== user.walletAddress) return res.status(409).json({ success: false, message: "Request a fresh wallet challenge" });
    if (publicTestWallets.has(c.address)) return res.status(409).json({ success: false, message: "Public test wallet is not eligible for verification. Secure migration required." });
    let signer;
    try { signer = verifyMessage(walletProofMessage(user._id, c), signature).toLowerCase(); }
    catch { return res.status(400).json({ success: false, message: "Invalid signature" }); }
    if (signer !== c.address) return res.status(403).json({ success: false, message: "Signature does not match existing wallet" });
    const verifiedAt = new Date();
    const result = await User.updateOne({ _id: user._id, walletAddress: c.address, "walletChallenge.nonce": c.nonce, "walletChallenge.expiresAt": { $gt: verifiedAt } }, { $unset: { walletChallenge: 1 }, $set: { walletProof: { address: c.address, verifiedAt } } });
    if (!result.modifiedCount) return res.status(409).json({ success: false, message: "Challenge expired or already used" });
    return res.json({ success: true, walletAddress: c.address, verifiedAt });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to verify wallet" });
  }
});


// =====================================================
// GET CURRENT USER
// =====================================================

router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// =====================================================
// ADMIN DASHBOARD STATS
// =====================================================

router.get(
  "/stats",
  protect,
  allowRoles("ADMIN"),
  async (req, res) => {
    try {
      const [
        totalUsers,
        manufacturers,
        suppliers,
        distributors,
        retailers,
        customers,
        totalProducts,
        blockchainEvents,
      ] = await Promise.all([
        User.countDocuments(),

        User.countDocuments({
          role: "MANUFACTURER",
        }),

        User.countDocuments({
          role: "SUPPLIER",
        }),

        User.countDocuments({
          role: "DISTRIBUTOR",
        }),

        User.countDocuments({
          role: "RETAILER",
        }),

        User.countDocuments({
          role: "CUSTOMER",
        }),

        Product.countDocuments(),

        SupplyChainEvent.countDocuments({
          blockchainTxHash: {
            $exists: true,
            $ne: "",
          },
        }),
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers,
          manufacturers,
          suppliers,
          distributors,
          retailers,
          customers,
          totalProducts,
          blockchainEvents,
        },
      });
    } catch (error) {
      console.error("Admin stats error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch admin statistics",
      });
    }
  }
);

// =====================================================
// GET ALL USERS
// =====================================================

router.get(
  "/",
  protect,
  allowRoles("ADMIN"),
  async (req, res) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({
          createdAt: -1,
        });

      return res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error) {
      console.error("Get users error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }
  }
);

// =====================================================
// UPDATE USER ROLE
// =====================================================

router.patch(
  "/:id/role",
  protect,
  allowRoles("ADMIN"),
  async (req, res) => {
    try {
      const { role } = req.body;

      const allowedRoles = [
        "ADMIN",
        "MANUFACTURER",
        "SUPPLIER",
        "DISTRIBUTOR",
        "RETAILER",
        "CUSTOMER",
      ];

      // -------------------------------------------------
      // Validate role
      // -------------------------------------------------

      if (!role || !allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user role",
        });
      }

      // -------------------------------------------------
      // Find target user
      // -------------------------------------------------

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // -------------------------------------------------
      // Prevent admin from changing own role
      // -------------------------------------------------

      if (
        user._id.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot change your own admin role",
        });
      }

      // -------------------------------------------------
      // Store old role before changing
      // -------------------------------------------------

      const oldRole = user.role;

      // -------------------------------------------------
      // Prevent unnecessary update
      // -------------------------------------------------

      if (oldRole === role) {
        return res.status(400).json({
          success: false,
          message: `User is already assigned the ${role} role`,
        });
      }

      // -------------------------------------------------
      // Update role
      // -------------------------------------------------

      user.role = role;

      await user.save();

      // -------------------------------------------------
      // Create Audit Log
      // -------------------------------------------------

      let auditLogCreated = false;
      let auditLogId = null;

      try {
        const auditLog = await AuditLog.create({
          user: req.user._id,
          action: "ROLE_CHANGED",
          description: `User ${user.name} role changed from ${oldRole} to ${role} by administrator ${req.user.email}.`,
          targetUser: user._id,
          metadata: {
            previousRole: oldRole,
            newRole: role,
            targetUserId: user._id.toString(),
            targetUserName: user.name,
            targetUserEmail: user.email,
          },
        });

        auditLogCreated = true;
        auditLogId = auditLog._id;
      } catch (auditError) {
        console.error(
          "Role change audit log error:",
          auditError
        );
      }

      // -------------------------------------------------
      // Response
      // -------------------------------------------------

      return res.status(200).json({
        success: true,
        message: "User role updated successfully",

        previousRole: oldRole,
        newRole: role,

        auditLogCreated,
        auditLogId,

        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          organization: user.organization,
          role: user.role,
          walletAddress: user.walletAddress,
        },
      });
    } catch (error) {
      console.error("Update user role error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update user role",
      });
    }
  }
);

// =====================================================
// DELETE USER
// =====================================================

router.delete(
  "/:id",
  protect,
  allowRoles("ADMIN"),
  async (req, res) => {
    try {
      // -------------------------------------------------
      // Find user
      // -------------------------------------------------

      const user = await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // -------------------------------------------------
      // Prevent self deletion
      // -------------------------------------------------

      if (
        user._id.toString() ===
        req.user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot delete your own account",
        });
      }

      // -------------------------------------------------
      // Check owned products
      // -------------------------------------------------

      const ownedProducts =
        await Product.countDocuments({
          currentOwner: user._id,
        });

      // -------------------------------------------------
      // Check manufactured products
      // -------------------------------------------------

      const manufacturedProducts =
        await Product.countDocuments({
          manufacturer: user._id,
        });

      // -------------------------------------------------
      // Prevent deleting linked user
      // -------------------------------------------------

      if (
        ownedProducts > 0 ||
        manufacturedProducts > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete user linked to existing products",
        });
      }

      // -------------------------------------------------
      // Create Audit Log BEFORE deleting user
      // -------------------------------------------------

      let auditLogCreated = false;
      let auditLogId = null;

      try {
        const auditLog = await AuditLog.create({
          user: req.user._id,
          action: "USER_DELETED",
          description: `User ${user.name} (${user.email}) was deleted by administrator ${req.user.email}.`,
          targetUser: user._id,
          metadata: {
            deletedUserId: user._id.toString(),
            deletedUserName: user.name,
            deletedUserEmail: user.email,
            deletedUserRole: user.role,
            deletedUserOrganization:
              user.organization,
          },
        });

        auditLogCreated = true;
        auditLogId = auditLog._id;
      } catch (auditError) {
        console.error(
          "User deletion audit log error:",
          auditError
        );
      }

      // -------------------------------------------------
      // Delete user
      // -------------------------------------------------

      await User.findByIdAndDelete(req.params.id);

      // -------------------------------------------------
      // Response
      // -------------------------------------------------

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",

        deletedUser: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },

        auditLogCreated,
        auditLogId,
      });
    } catch (error) {
      console.error("Delete user error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete user",
      });
    }
  }
);

module.exports = router;