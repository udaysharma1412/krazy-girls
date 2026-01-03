const express = require("express");
const Product = require("../models/Product");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// In-memory cart storage (for demo purposes)
// In production, use Redis or database
const carts = new Map();

// Get user cart from session or create new one
const getUserCart = (userId) => {
  if (!carts.has(userId)) {
    carts.set(userId, {
      userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return carts.get(userId);
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
router.get("/", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // For demo, we'll use a simple user ID extraction
    // In production, verify JWT token properly
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();
    
    const cart = getUserCart(userId);

    // Get product details for cart items
    const cartWithProducts = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findById(item.productId);
        return {
          ...item,
          product: product ? {
            id: product._id,
            name: product.name,
            image: product.mainImage,
            price: product.price,
            outOfStock: product.outOfStock,
          } : null,
        };
      })
    );

    res.json({
      success: true,
      cart: {
        ...cart,
        items: cartWithProducts.filter(item => item.product !== null),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post(
  "/add",
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("size").notEmpty().withMessage("Size is required"),
    body("color").notEmpty().withMessage("Color is required"),
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
      
      const { productId, quantity, size, color } = req.body;

      // Check if product exists and is in stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (product.outOfStock) {
        return res.status(400).json({
          success: false,
          message: "Product is out of stock",
        });
      }

      const cart = getUserCart(userId);

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === productId &&
          item.size === size &&
          item.color === color
      );

      if (existingItemIndex > -1) {
        // Update quantity
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({
          productId,
          quantity,
          size,
          color,
          addedAt: new Date(),
        });
      }

      cart.updatedAt = new Date();

      res.json({
        success: true,
        message: "Item added to cart",
        cart,
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

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
router.put(
  "/:itemId",
  [
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
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
      
      const { quantity } = req.body;
      const { itemId } = req.params;

      const cart = getUserCart(userId);

      const itemIndex = cart.items.findIndex(
        (item) => item._id?.toString() === itemId || 
                 (item.productId === itemId && item.size === req.body.size && item.color === req.body.color)
      );

      if (itemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart",
        });
      }

      cart.items[itemIndex].quantity = quantity;
      cart.updatedAt = new Date();

      res.json({
        success: true,
        message: "Cart item updated",
        cart,
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

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
router.delete("/:itemId", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();
    
    const { itemId } = req.params;

    const cart = getUserCart(userId);

    const itemIndex = cart.items.findIndex(
      (item) => item._id?.toString() === itemId || item.productId === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = new Date();

    res.json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
router.delete("/", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();
    
    const cart = getUserCart(userId);
    cart.items = [];
    cart.updatedAt = new Date();

    res.json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get cart summary
// @route   GET /api/cart/summary
// @access  Private
router.get("/summary", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();
    
    const cart = getUserCart(userId);

    let itemsPrice = 0;
    let totalItems = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product && !product.outOfStock) {
        itemsPrice += product.price * item.quantity;
        totalItems += item.quantity;
      }
    }

    const taxPrice = itemsPrice * 0.18; // 18% GST
    const shippingPrice = itemsPrice > 999 ? 0 : 50; // Free shipping above ₹999
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    res.json({
      success: true,
      summary: {
        items: totalItems,
        itemsPrice: Math.round(itemsPrice),
        taxPrice: Math.round(taxPrice),
        shippingPrice: Math.round(shippingPrice),
        totalPrice: Math.round(totalPrice),
      },
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
