const express = require("express");
const Product = require("../models/Product");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// In-memory wishlist storage (for demo purposes)
// In production, use database
const wishlists = new Map();

// Get user wishlist
const getUserWishlist = (userId) => {
  if (!wishlists.has(userId)) {
    wishlists.set(userId, {
      userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  return wishlists.get(userId);
};

// Get product by ID (fallback)
const getProductById = async (productId) => {
  try {
    // Try to find by MongoDB ObjectId first
    const product = await Product.findById(productId);
    if (product) return product;
    
    // If not found, try to find by custom id field
    const productById = await Product.findOne({ id: productId });
    if (productById) return productById;
    
    // If still not found, return null
    return null;
  } catch (error) {
    console.error('Error finding product:', error);
    return null;
  }
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
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

    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();
    
    const wishlist = getUserWishlist(userId);

    // Get product details for wishlist items
    const wishlistWithProducts = await Promise.all(
      wishlist.items.map(async (productId) => {
        const product = await getProductById(productId);
        return product ? {
          id: product._id,
          name: product.name,
          image: product.mainImage,
          price: product.price,
          originalPrice: product.originalPrice,
          discount: product.discount,
          outOfStock: product.outOfStock,
          category: product.category,
          badge: product.badge,
        } : null;
      })
    );

    res.json({
      success: true,
      wishlist: {
        ...wishlist,
        items: wishlistWithProducts.filter(item => item !== null),
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

// @desc    Add item to wishlist
// @route   POST /api/wishlist/add
// @access  Private
router.post(
  "/add",
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
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
      
      const { productId } = req.body;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const wishlist = getUserWishlist(userId);

      // Check if item already exists in wishlist
      if (wishlist.items.includes(productId)) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      // Add item to wishlist
      wishlist.items.push(productId);
      wishlist.updatedAt = new Date();

      res.json({
        success: true,
        message: "Item added to wishlist",
        wishlist,
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

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete("/:productId", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();
    
    const { productId } = req.params;

    const wishlist = getUserWishlist(userId);

    const itemIndex = wishlist.items.indexOf(productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not found in wishlist",
      });
    }

    wishlist.items.splice(itemIndex, 1);
    wishlist.updatedAt = new Date();

    res.json({
      success: true,
      message: "Item removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
router.delete("/", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();
    
    const wishlist = getUserWishlist(userId);
    wishlist.items = [];
    wishlist.updatedAt = new Date();

    res.json({
      success: true,
      message: "Wishlist cleared",
      wishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
router.get("/check/:productId", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const userId = token.includes("demo") ? "demo-user" : "user-" + Date.now();
    
    const { productId } = req.params;

    const wishlist = getUserWishlist(userId);
    const isInWishlist = wishlist.items.includes(productId);

    res.json({
      success: true,
      isInWishlist,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Toggle item in wishlist
// @route   POST /api/wishlist/toggle
// @access  Private
router.post(
  "/toggle",
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
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
      
      const { productId } = req.body;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const wishlist = getUserWishlist(userId);

      const itemIndex = wishlist.items.indexOf(productId);

      if (itemIndex === -1) {
        // Add to wishlist
        wishlist.items.push(productId);
        wishlist.updatedAt = new Date();
        
        res.json({
          success: true,
          message: "Item added to wishlist",
          isInWishlist: true,
          wishlist,
        });
      } else {
        // Remove from wishlist
        wishlist.items.splice(itemIndex, 1);
        wishlist.updatedAt = new Date();
        
        res.json({
          success: true,
          message: "Item removed from wishlist",
          isInWishlist: false,
          wishlist,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  }
);

module.exports = router;
