const express = require("express");
const Product = require("../models/Product");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      category,
      search,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sort] = order === "desc" ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      count: products.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin only)
router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Product name is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("category").isIn(["suit-sets", "kurtas", "dresses", "bottoms", "sarees"]).withMessage("Invalid category"),
    body("price").isNumeric().withMessage("Price must be a number"),
    body("originalPrice").isNumeric().withMessage("Original price must be a number"),
    body("stock").isNumeric().withMessage("Stock must be a number"),
    body("details").notEmpty().withMessage("Product details are required"),
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

      const productData = {
        ...req.body,
        mainImage: req.body.images ? req.body.images[0] : req.body.image,
      };

      const product = await Product.create(productData);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product,
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

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
router.put(
  "/:id",
  [
    body("name").optional().notEmpty().withMessage("Product name cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("category").optional().isIn(["suit-sets", "kurtas", "dresses", "bottoms", "sarees"]).withMessage("Invalid category"),
    body("price").optional().isNumeric().withMessage("Price must be a number"),
    body("originalPrice").optional().isNumeric().withMessage("Original price must be a number"),
    body("stock").optional().isNumeric().withMessage("Stock must be a number"),
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

      let product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const updateData = {
        ...req.body,
        mainImage: req.body.images ? req.body.images[0] : product.mainImage,
      };

      product = await Product.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.json({
        success: true,
        message: "Product updated successfully",
        product,
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

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.remove();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private (Admin only)
router.patch("/:id/stock", async (req, res) => {
  try {
    const { stock } = req.body;

    if (typeof stock !== "number" || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock value",
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.stock = stock;
    product.outOfStock = stock <= 0;
    await product.save();

    res.json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Toggle product stock status
// @route   PATCH /api/products/:id/toggle-stock
// @access  Private (Admin only)
router.patch("/:id/toggle-stock", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.outOfStock = !product.outOfStock;
    await product.save();

    res.json({
      success: true,
      message: `Product marked as ${product.outOfStock ? "out of stock" : "in stock"}`,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// @desc    Get product categories
// @route   GET /api/products/categories
// @access  Public
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    
    res.json({
      success: true,
      categories,
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
