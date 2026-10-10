const Product = require("../models/Product");
const SupplyChainEvent = require("../models/SupplyChainEvent");
const AuditLog = require("../models/AuditLog");
const Notification = require("../models/Notification");

const {
  registerProductOnBlockchain,
  getContract,
} = require("../services/blockchainService");

// ====================
// Create Product
// ====================

const createProduct = async (req, res) => {
  try {
    const {
      productId,
      name,
      description,
      category,
      location,
      productHash,
      ipfsHash,
      blockchainNetwork,
      qrCode,
    } = req.body;

    // Required fields
    if (!productId || !name || !category || !productHash) {
      return res.status(400).json({
        success: false,
        message:
          "Product ID, name, category and product hash are required",
      });
    }

    const normalizedProductId = productId.trim().toUpperCase();

    // Check duplicate Product ID in MongoDB
    const existingProduct = await Product.findOne({
      productId: normalizedProductId,
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Product ID already exists in MongoDB",
      });
    }

    // ==========================================
    // Check Product ID on Blockchain
    // ==========================================

    const blockchainContract = getContract();

    const alreadyOnBlockchain =
      await blockchainContract.productExists(
        normalizedProductId
      );

    if (alreadyOnBlockchain) {
      return res.status(409).json({
        success: false,
        message: "Product ID already exists on blockchain",
      });
    }

    // ==========================================
    // Register Product on Blockchain
    // ==========================================

    console.log(
      `Registering ${normalizedProductId} on blockchain...`
    );

    const blockchainResult =
      await registerProductOnBlockchain(
        normalizedProductId,
        productHash
      );

    console.log(
      "Blockchain transaction:",
      blockchainResult.transactionHash
    );

    // ==========================================
    // Create Product in MongoDB
    // ==========================================

    const product = await Product.create({
      productId: normalizedProductId,
      name,
      description,
      category,
      manufacturer: req.user._id,
      currentOwner: req.user._id,
      location,
      productHash,
      ipfsHash,

      // REAL blockchain transaction hash
      blockchainTxHash:
        blockchainResult.transactionHash,

      blockchainNetwork:
        blockchainNetwork || "Ethereum",

      qrCode,
    });

    // ==========================================
    // Automatically create MANUFACTURED event
    // ==========================================

    const supplyChainEvent =
      await SupplyChainEvent.create({
        product: product._id,
        eventType: "MANUFACTURED",
        fromUser: req.user._id,
        location:
          location || req.user.organization,

        description:
          `Product ${product.productId} manufactured and registered on ChainTrace blockchain.`,

        blockchainTxHash:
          blockchainResult.transactionHash,

        blockNumber:
          blockchainResult.blockNumber,
      });

    // ==========================================
    // Create Audit Log
    // ==========================================

    try {
      await AuditLog.create({
        user: req.user._id,

        action: "PRODUCT_REGISTERED",

        description:
          `Product ${product.productId} was registered successfully.`,

        product: product._id,

        ipAddress: req.ip,

        metadata: {
          productId: product.productId,
          productName: product.name,
          category: product.category,

          blockchainTxHash:
            blockchainResult.transactionHash,

          blockNumber:
            blockchainResult.blockNumber,
        },
      });

      console.log(
        `Audit log created for product registration: ${product.productId}`
      );
    } catch (auditError) {
      console.error(
        "PRODUCT REGISTRATION AUDIT LOG ERROR:"
      );
      console.error(auditError);
    }

    // ==========================================
    // Create Notification
    // ==========================================

    try {
      await Notification.create({
        user: req.user._id,

        type: "PRODUCT_REGISTERED",

        title: "Product Registered",

        message:
          `Product ${product.productId} has been successfully registered on ChainTrace.`,

        product: product._id,
      });
    } catch (notificationError) {
      console.error(
        "Product registration notification error:",
        notificationError
      );
    }

    // Populate manufacturer information
    await supplyChainEvent.populate(
      "fromUser",
      "name email organization role"
    );

    return res.status(201).json({
      success: true,

      message:
        "Product registered successfully on MongoDB and blockchain",

      product,

      blockchain: {
        transactionHash:
          blockchainResult.transactionHash,

        blockNumber:
          blockchainResult.blockNumber,

        network:
          blockchainNetwork || "Ethereum",
      },

      supplyChainEvent,
    });
  } catch (error) {
    console.error("=================================");
    console.error("CREATE PRODUCT ERROR");
    console.error("=================================");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    return res.status(500).json({
      success: false,
      message:
        "Server error while registering product",
      error: error.message,
    });
  }
};

// ====================
// Get All Products
// ====================

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate(
        "manufacturer",
        "name email organization"
      )
      .populate(
        "currentOwner",
        "name email organization"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Get products error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching products",
    });
  }
};

// ====================
// Get Product By ID
// ====================

const getProductById = async (req, res) => {
  try {
    const normalizedProductId = String(
      req.params.productId || ""
    )
      .trim()
      .toUpperCase();

    const product = await Product.findOne({
      productId: normalizedProductId,
    })
      .populate(
        "manufacturer",
        "name email organization"
      )
      .populate(
        "currentOwner",
        "name email organization"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get product by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching product",
    });
  }
};

// ==========================================
// ADMIN - UPDATE PRODUCT STATUS
// ==========================================

const updateProductStatus = async (req, res) => {
  try {
    const requestedStatus = String(
      req.body?.status || ""
    )
      .trim()
      .toUpperCase();

    const allowedStatuses = [
      "REGISTERED",
      "IN_TRANSIT",
      "DELIVERED",
      "UNDER_REVIEW",
      "FLAGGED",
    ];

    // ==========================================
    // Validate status
    // ==========================================

    if (!requestedStatus) {
      return res.status(400).json({
        success: false,
        message: "Product status is required",
      });
    }

    if (!allowedStatuses.includes(requestedStatus)) {
      return res.status(400).json({
        success: false,
        message:
          `Invalid product status. Allowed values: ${allowedStatuses.join(
            ", "
          )}`,
      });
    }

    // ==========================================
    // Normalize Product ID
    // ==========================================

    const normalizedProductId = String(
      req.params.productId || ""
    )
      .trim()
      .toUpperCase();

    if (!normalizedProductId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    // ==========================================
    // Find Product
    // ==========================================

    const product = await Product.findOne({
      productId: normalizedProductId,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ==========================================
    // Get Old Status
    // ==========================================

    const oldStatus = product.status;
    const newStatus = requestedStatus;

    // ==========================================
    // Prevent duplicate status update
    // ==========================================

    if (oldStatus === newStatus) {
      return res.status(400).json({
        success: false,
        message:
          `Product is already in ${newStatus} status`,
      });
    }

    // ==========================================
    // ADMIN INFORMATION
    // ==========================================

    const adminUserId = req.user?._id;

    const adminEmail =
      req.user?.email || "unknown";

    const adminRole =
      req.user?.role || "ADMIN";

    // ==========================================
    // UPDATE PRODUCT STATUS
    // ==========================================

    product.status = newStatus;

    await product.save();

    console.log("=================================");
    console.log("PRODUCT STATUS UPDATED");
    console.log("=================================");
    console.log(
      "Product:",
      product.productId
    );
    console.log(
      "Old Status:",
      oldStatus
    );
    console.log(
      "New Status:",
      newStatus
    );
    console.log(
      "Updated By:",
      adminEmail
    );
    console.log(
      "Admin Role:",
      adminRole
    );
    console.log("=================================");

    // ==========================================
    // CREATE AUDIT LOG
    // ==========================================

    let auditLog = null;

    try {
      if (!adminUserId) {
        throw new Error(
          "Authenticated admin user ID is missing"
        );
      }

      auditLog = await AuditLog.create({
        user: adminUserId,

        action: "PRODUCT_STATUS_UPDATED",

        description:
          `Product ${product.productId} status changed from ${oldStatus} to ${newStatus} by administrator ${adminEmail}.`,

        product: product._id,

        ipAddress:
          req.ip || "unknown",

        metadata: {
          productId: product.productId,

          productName: product.name,

          oldStatus,

          newStatus,

          updatedBy: adminEmail,

          updatedByRole: adminRole,

          timestamp:
            new Date().toISOString(),
        },
      });

      console.log(
        "================================="
      );
      console.log(
        "AUDIT LOG CREATED SUCCESSFULLY"
      );
      console.log(
        "Audit ID:",
        auditLog._id
      );
      console.log(
        "Action:",
        auditLog.action
      );
      console.log(
        "Product:",
        product.productId
      );
      console.log(
        "================================="
      );
    } catch (auditError) {
      console.error(
        "================================="
      );
      console.error(
        "PRODUCT STATUS AUDIT LOG ERROR"
      );
      console.error(
        "================================="
      );
      console.error(
        auditError
      );
      console.error(
        "Message:",
        auditError.message
      );
      console.error(
        "Stack:",
        auditError.stack
      );
      console.error(
        "================================="
      );
    }

    // ==========================================
    // CREATE MANUFACTURER NOTIFICATION
    // ==========================================

    let notification = null;

    try {
      if (product.manufacturer) {
        notification =
          await Notification.create({
            user: product.manufacturer,

            type:
              newStatus === "FLAGGED"
                ? "PRODUCT_FLAGGED"
                : "SYSTEM",

            title:
              newStatus === "FLAGGED"
                ? "Product Flagged"
                : "Product Status Updated",

            message:
              `Product ${product.productId} status changed from ${oldStatus} to ${newStatus} by an administrator.`,

            product: product._id,
          });

        console.log(
          `Notification created for manufacturer of ${product.productId}`
        );
      }
    } catch (notificationError) {
      console.error(
        "STATUS UPDATE NOTIFICATION ERROR:"
      );
      console.error(
        notificationError
      );
      console.error(
        "Message:",
        notificationError.message
      );
    }

    // ==========================================
    // Populate Product Users
    // ==========================================

    await product.populate(
      "manufacturer",
      "name email organization role"
    );

    await product.populate(
      "currentOwner",
      "name email organization role"
    );

    // ==========================================
    // FINAL RESPONSE
    // ==========================================

    return res.status(200).json({
      success: true,

      message:
        "Product status updated successfully",

      product,

      previousStatus: oldStatus,

      newStatus: newStatus,

      auditLogCreated:
        Boolean(auditLog),

      auditLogId:
        auditLog?._id || null,

      notificationCreated:
        Boolean(notification),

      notificationId:
        notification?._id || null,
    });
  } catch (error) {
    console.error(
      "================================="
    );
    console.error(
      "UPDATE PRODUCT STATUS ERROR"
    );
    console.error(
      "================================="
    );
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
        "Server error while updating product status",
      error: error.message,
    });
  }
};

// ====================
// Export Controllers
// ====================

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProductStatus,
};