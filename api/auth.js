// Netlify Serverless Function for Authentication
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

const handler = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);
    
    if (req.method === 'POST' && pathname === '/signup') {
      // Handle signup
      const { name, email, phone, password } = req.body;
      
      // Validation
      if (!name || !email || !phone || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide all required fields'
        });
      }

      // Mock user creation (replace with actual database logic)
      const user = {
        _id: Date.now().toString(),
        name,
        email,
        phone,
        password: await bcrypt.hash(password, 10)
      };

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });

    } else if (req.method === 'POST' && pathname === '/login') {
      // Handle login
      const { email, password } = req.body;
      
      // Validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      // Mock user login (replace with actual database logic)
      const user = {
        _id: '123456',
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        password: await bcrypt.hash('password123', 10)
      };

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone
        }
      });

    } else {
      res.status(404).json({
        success: false,
        message: 'Route not found'
      });
    }

  } catch (error) {
    console.error('Auth API error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { handler };
