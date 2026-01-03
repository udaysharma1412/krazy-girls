const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// In-memory order storage (for demo purposes)
// In production, use database
const orders = new Map();

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
router.post(
  "/",
  [
    body("orderItems").isArray({ min: 1 }).withMessage("Order items are required"),
    body("shippingAddress.street").notEmpty().withMessage("Street address is required"),
    body("shippingAddress.city").notEmpty().withMessage("City is required"),
    body("shippingAddress.state").notEmpty().withMessage("State is required"),
    body("shippingAddress.pincode").notEmpty().withMessage("Pincode is required"),
    body("paymentMethod").isIn(["cod", "stripe", "razorpay"]).withMessage("Invalid payment method"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const token = req.header("Authorization")?.replace("Bearer ", "");
      const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();

      const { orderItems, shippingAddress, paymentMethod, paymentInfo } = req.body;

      // Calculate prices
      let itemsPrice = 0;
      const orderItemsWithDetails = [];

      for (const item of orderItems) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
        }

        if (product.outOfStock) {
          return res.status(400).json({
            success: false,
            message: `Product out of stock: ${product.name}`,
          });
        }

        const itemPrice = product.price * item.quantity;
        itemsPrice += itemPrice;

        orderItemsWithDetails.push({
          name: product.name,
          quantity: item.quantity,
          image: product.mainImage,
          price: product.price,
          product: product._id,
          size: item.size,
          color: item.color,
        });

        // Update product stock
        product.stock -= item.quantity;
        product.outOfStock = product.stock <= 0;
        await product.save();
      }

      const taxPrice = itemsPrice * 0.18; // 18% GST
      const shippingPrice = itemsPrice > 999 ? 0 : 50; // Free shipping above ₹999
      const totalPrice = itemsPrice + taxPrice + shippingPrice;

      // Create order
      const order = {
        id: Date.now().toString(),
        user: userId,
        orderItems: orderItemsWithDetails,
        shippingAddress,
        paymentMethod,
        paymentInfo: paymentInfo || {},
        itemsPrice: Math.round(itemsPrice),
        taxPrice: Math.round(taxPrice),
        shippingPrice: Math.round(shippingPrice),
        totalPrice: Math.round(totalPrice),
        orderStatus: "pending",
        orderDate: new Date(),
        estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      };

      orders.set(order.id, order);

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
router.get("/", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();

    const userOrders = Array.from(orders.values())
      .filter(order => order.user === userId)
      .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

    res.json({
      success: true,
      orders: userOrders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();

    const order = orders.get(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to user
    if (order.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this order",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Admin only)
router.patch(
  "/:id/status",
  [
    body("status").isIn(["pending", "processing", "shipped", "delivered", "cancelled"]).withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { status } = req.body;
      const orderId = req.params.id;

      const order = orders.get(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      order.orderStatus = status;

      if (status === "delivered") {
        order.deliveredAt = new Date();
      }

      if (status === "shipped") {
        order.trackingNumber = "TRACK" + Math.random().toString(36).substr(2, 9).toUpperCase();
      }

      res.json({
        success: true,
        message: "Order status updated",
        order,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

// @desc    Cancel order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
router.patch("/:id/cancel", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();

    const order = orders.get(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if order belongs to user
    if (order.user !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled at this stage",
      });
    }

    // Restore product stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        product.outOfStock = product.stock <= 0;
        await product.save();
      }
    }

    order.orderStatus = "cancelled";

    res.json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
