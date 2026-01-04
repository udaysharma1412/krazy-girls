// Netlify Serverless Function for Wishlist
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
    const path = event.path.replace(/\/\.netlify\/functions\/wishlist/, '');
    
    if (event.httpMethod === 'GET' && path === '') {
      // Get wishlist items
      // For now, return empty wishlist (you can implement database logic later)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            items: [],
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
        message: 'Wishlist endpoint not found'
      })
    };

  } catch (error) {
    console.error('Wishlist API error:', error);
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
