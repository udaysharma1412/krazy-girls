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

const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace(/\/\.netlify\/functions\/auth/, '');
    
    if (event.httpMethod === 'POST' && path === '/signup') {
      // Handle signup
      const { name, email, phone, password } = JSON.parse(event.body);
      
      // Validation
      if (!name || !email || !phone || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Please provide all required fields'
          })
        };
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

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'User registered successfully',
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
          }
        })
      };

    } else if (event.httpMethod === 'POST' && path === '/login') {
      // Handle login
      const { email, password } = JSON.parse(event.body);
      
      // Validation
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Please provide email and password'
          })
        };
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
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          })
        };
      }

      // Generate token
      const token = generateToken(user._id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
          }
        })
      };

    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Route not found'
        })
      };
    }

  } catch (error) {
    console.error('Auth API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Server error',
        error: error.message
      })
    };
  }
};

module.exports = { handler };
