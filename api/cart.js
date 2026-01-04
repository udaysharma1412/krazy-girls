// Netlify Serverless Function for Cart
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

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
    const path = event.path.replace(/\/\.netlify\/functions\/cart/, '');
    
    if (event.httpMethod === 'GET' && path === '') {
      // Get cart items
      // For now, return empty cart (you can implement database logic later)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            items: [],
            total: 0,
            count: 0
          }
        })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Cart endpoint not found'
      })
    };

  } catch (error) {
    console.error('Cart API error:', error);
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
