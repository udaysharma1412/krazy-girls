const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
router.post(
  "/signup",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide valid email"),
    body("phone").matches(/^[6-9]\d{9}$/).withMessage("Please provide valid 10-digit phone number"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
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

      const { name, email, phone, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User with this email or phone already exists",
        });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        phone,
        password,
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        },
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

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please provide valid email"),
    body("password").notEmpty().withMessage("Password is required"),
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

      const { email, password } = req.body;

      // Check for demo account
      if (email === "demo@krazygirls.com" && password === "demo123") {
        const token = generateToken("demo-user");
        return res.json({
          success: true,
          message: "Login successful",
          token,
          user: {
            id: "demo-user",
            name: "Demo User",
            email: "demo@krazygirls.com",
            phone: "9876543210",
            avatar: "DU",
          },
        });
      }

      // Find user
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Check if password matches
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        },
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

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get("/me", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Handle demo user
    if (decoded.id === "demo-user") {
      return res.json({
        success: true,
        user: {
          id: "demo-user",
          name: "Demo User",
          email: "demo@krazygirls.com",
          phone: "9876543210",
          avatar: "DU",
          addresses: [],
        },
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put(
  "/profile",
  [
    body("name").optional().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Please provide valid email"),
    body("phone").optional().matches(/^[6-9]\d{9}$/).withMessage("Please provide valid 10-digit phone number"),
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
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Handle demo user
      if (decoded.id === "demo-user") {
        return res.json({
          success: true,
          message: "Demo profile updated (simulated)",
        });
      }

      const { name, email, phone } = req.body;
      
      // Check if email/phone already exists for another user
      if (email || phone) {
        const existingUser = await User.findOne({
          _id: { $ne: decoded.id },
          $or: [
            ...(email ? [{ email }] : []),
            ...(phone ? [{ phone }] : []),
          ],
        });
        
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Email or phone already exists",
          });
        }
      }

      const user = await User.findByIdAndUpdate(
        decoded.id,
        { name, email, phone },
        { new: true, runValidators: true }
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
        },
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

module.exports = router;
