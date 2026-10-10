const SupplyChainEvent = require("../models/SupplyChainEvent");
const Product = require("../models/Product");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");

const {
  transferProductOnBlockchain,
} = require("../services/blockchainService");

// ======================================================
// SUPPLY CHAIN ROLE FLOW
// ======================================================

const allowedNextRoles = {
  MANUFACTURER: ["SUPPLIER"],
  SUPPLIER: ["DISTRIBUTOR"],
  DISTRIBUTOR: ["RETAILER"],
  RETAILER: ["CUSTOMER"],
};

// ======================================================
// CREATE SUPPLY CHAIN EVENT
// ======================================================

const createSupplyChainEvent = async (req, res) => {
  try {
    const {
      productId,
      eventType,
      location,
      description,
      blockchainTxHash,
      toUser,
    } = req.body;

    if (!productId || !eventType) {
      return res.status(400).json({
        success: false,
        message: "productId and eventType are required",
      });
    }

    const product = await Product.findOne({
      productId: productId.toUpperCase(),
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const event = await SupplyChainEvent.create({
      product: product._id,
      eventType,
      fromUser: req.user._id,
      toUser: toUser || undefined,
      location: location || product.location,
      description,
      blockchainTxHash: blockchainTxHash || "",
    });

    await event.populate([
      {
        path: "fromUser",
        select: "name email organization role walletAddress",
      },
      {
        path: "toUser",
        select: "name email organization role walletAddress",
      },
    ]);

    return res.status(201).json({
      success: true,
      message: "Supply-chain event created successfully",
      event,
    });
  } catch (error) {
    console.error("=================================");
    console.error("CREATE SUPPLY CHAIN EVENT ERROR");
    console.error("=================================");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to create supply-chain event",
      error: error.message,
    });
  }
};

// ======================================================
// GET PRODUCT HISTORY
// ======================================================

const getProductHistory = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      productId: productId.toUpperCase(),
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const events = await SupplyChainEvent.find({
      product: product._id,
    })
      .populate(
        "fromUser",
        "name email organization role walletAddress"
      )
      .populate(
        "toUser",
        "name email organization role walletAddress"
      )
      .sort({ timestamp: 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("=================================");
    console.error("GET SUPPLY CHAIN HISTORY ERROR");
    console.error("=================================");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch supply-chain history",
      error: error.message,
    });
  }
};

// ======================================================
// GET RECENT BLOCKCHAIN ACTIVITY
// ======================================================

const getRecentActivity = async (req, res) => {
  try {
    const events = await SupplyChainEvent.find({
      blockchainTxHash: {
        $exists: true,
        $ne: "",
      },
    })
      .populate(
        "product",
        "productId name category status location"
      )
      .populate(
        "fromUser",
        "name email organization role walletAddress"
      )
      .populate(
        "toUser",
        "name email organization role walletAddress"
      )
      .sort({ timestamp: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error("=================================");
    console.error("GET RECENT ACTIVITY ERROR");
    console.error("=================================");
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch recent blockchain activity",
      error: error.message,
    });
  }
};

// ======================================================
// TRANSFER PRODUCT
// ======================================================

const transferProduct = async (req, res) => {
  try {
    const {
      productId,
      toUser,
      location,
      description,
    } = req.body;

    // ==================================================
    // VALIDATE INPUT
    // ==================================================

    if (!productId || !toUser) {
      return res.status(400).json({
        success: false,
        message: "productId and receiver user ID are required",
      });
    }

    // ==================================================
    // FIND PRODUCT
    // ==================================================

    const product = await Product.findOne({
      productId: productId.toUpperCase(),
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ==================================================
    // FIND RECEIVER
    // ==================================================

    const receiver = await User.findById(toUser);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver user not found",
      });
    }

    // ==================================================
    // CURRENT OWNER CHECK
    // ==================================================

    if (
      product.currentOwner &&
      product.currentOwner.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only the current owner can transfer this product",
      });
    }

    // ==================================================
    // ROLE FLOW VALIDATION
    // ==================================================

    const senderRole = req.user.role;
    const receiverRole = receiver.role;

    /*
      ADMIN is allowed to perform administrative transfers.

      Normal supply-chain users must follow:

      MANUFACTURER → SUPPLIER
      SUPPLIER     → DISTRIBUTOR
      DISTRIBUTOR  → RETAILER
      RETAILER     → CUSTOMER
    */

    if (senderRole !== "ADMIN") {
      const allowedRoles =
        allowedNextRoles[senderRole] || [];

      if (!allowedRoles.includes(receiverRole)) {
        return res.status(403).json({
          success: false,
          message:
            `${senderRole} can only transfer products to: ` +
            `${allowedRoles.join(", ") || "no allowed role"}`,
        });
      }
    }

    // ==================================================
    // RECEIVER WALLET CHECK
    // ==================================================

    const receiverWalletAddress = String(
      receiver.walletAddress || ""
    ).trim();

    if (!receiverWalletAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Receiver does not have a blockchain wallet address",
      });
    }

    // ==================================================
    // SENDER WALLET CHECK
    // ==================================================

    const senderWalletAddress = String(
      req.user.walletAddress || ""
    ).trim();

    if (!senderWalletAddress) {
      return res.status(400).json({
        success: false,
        message:
          "Your account does not have a blockchain wallet address",
      });
    }

    // ==================================================
    // LOG TRANSFER
    // ==================================================

    console.log("=================================");
    console.log("SUPPLY CHAIN TRANSFER");
    console.log("=================================");
    console.log("Product:", product.productId);
    console.log("Sender:", req.user.email);
    console.log("Sender Role:", senderRole);
    console.log("Sender Wallet:", senderWalletAddress);
    console.log("Receiver:", receiver.email);
    console.log("Receiver Role:", receiverRole);
    console.log("Receiver Wallet:", receiverWalletAddress);
    console.log("=================================");

    // ==================================================
    // DETERMINE PRODUCT STATUS
    // ==================================================

    const isFinalDelivery =
      receiverRole === "CUSTOMER";

    const eventType = isFinalDelivery
      ? "DELIVERED"
      : "TRANSFERRED";

    const productStatus = isFinalDelivery
      ? "DELIVERED"
      : "IN_TRANSIT";

    const finalDescription =
      description ||
      (
        isFinalDelivery
          ? `Product ${product.productId} delivered successfully to the customer.`
          : `Product ${product.productId} transferred from ${senderRole} to ${receiverRole}.`
      );

    // ==================================================
    // BLOCKCHAIN TRANSFER
    // IMPORTANT:
    // BLOCKCHAIN FIRST
    // MONGODB SECOND
    // ==================================================

    console.log(
      `Transferring ${product.productId} on blockchain...`
    );

    const blockchainResult =
      await transferProductOnBlockchain(
        product.productId,
        senderWalletAddress,
        receiverWalletAddress,
        location || product.location || "",
        finalDescription
      );

    console.log(
      "Blockchain transfer successful:"
    );

    console.log(blockchainResult);

    // ==================================================
    // UPDATE PRODUCT IN MONGODB
    // ==================================================

    product.currentOwner = receiver._id;
    product.status = productStatus;

    if (location) {
      product.location = location;
    }

    await product.save();

    // ==================================================
    // CREATE SUPPLY CHAIN EVENT
    // ==================================================

    const event =
      await SupplyChainEvent.create({
        product: product._id,

        eventType,

        fromUser:
          req.user._id,

        toUser:
          receiver._id,

        location:
          location ||
          product.location,

        description:
          finalDescription,

        blockchainTxHash:
          blockchainResult.transactionHash,

        blockNumber:
          blockchainResult.blockNumber,
      });

    // ==================================================
    // CREATE AUDIT LOG
    // ==================================================

    try {
      await AuditLog.create({
        user: req.user._id,

        action: "PRODUCT_TRANSFERRED",

        description:
          isFinalDelivery
            ? `Product ${product.productId} delivered from ${senderRole} to CUSTOMER.`
            : `Product ${product.productId} transferred from ${senderRole} to ${receiverRole}.`,

        product: product._id,

        targetUser: receiver._id,

        ipAddress: req.ip,

        metadata: {
          productId: product.productId,
          senderRole,
          receiverRole,
          senderEmail: req.user.email,
          receiverEmail: receiver.email,
          eventType,
          productStatus,
          blockchainTxHash:
            blockchainResult.transactionHash,
          blockNumber:
            blockchainResult.blockNumber,
          location:
            location || product.location || "",
        },
      });

      console.log(
        `Audit log created for product ${product.productId}`
      );
    } catch (auditError) {
      console.error(
        "AUDIT LOG ERROR:",
        auditError.message
      );
    }

    // ==================================================
    // CREATE NOTIFICATION
    // ==================================================

    try {
      await Notification.create({
        user: receiver._id,

        type: isFinalDelivery
          ? "PRODUCT_DELIVERED"
          : "PRODUCT_TRANSFERRED",

        title: isFinalDelivery
          ? "Product Delivered"
          : "Product Transferred",

        message: isFinalDelivery
          ? `Product ${product.productId} has been delivered to you.`
          : `Product ${product.productId} has been transferred to you by ${
              req.user.organization || req.user.name
            }.`,
          
        product: product._id,
      });

      console.log(
        `Notification created for ${receiver.email}`
      );
    } catch (notificationError) {
      // Notification failure should not undo
      // successful blockchain transfer.
      console.error(
        "NOTIFICATION ERROR:",
        notificationError.message
      );
    }

    // ==================================================
    // POPULATE USERS
    // ==================================================

    await event.populate([
      {
        path: "fromUser",
        select:
          "name email organization role walletAddress",
      },
      {
        path: "toUser",
        select:
          "name email organization role walletAddress",
      },
    ]);

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        isFinalDelivery
          ? "Product delivered successfully on blockchain"
          : "Product transferred successfully on blockchain",

      product,

      event,

      blockchain: {
        transactionHash:
          blockchainResult.transactionHash,

        blockNumber:
          blockchainResult.blockNumber,

        from:
          blockchainResult.from,

        to:
          blockchainResult.to,
      },
    });
  } catch (error) {
    console.error("=================================");
    console.error("TRANSFER PRODUCT ERROR");
    console.error("=================================");
    console.error(error);

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Stack:",
      error.stack
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to transfer product",
      error:
        error.message,
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createSupplyChainEvent,
  getProductHistory,
  transferProduct,
  getRecentActivity,
};