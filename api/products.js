// Netlify Serverless Function for Products
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method not allowed' })
    };
  }

  try {
    // Sample products data (you can replace with database queries)
    const products = [
      {
        _id: '1',
        name: 'Elegant Evening Dress',
        price: 89.99,
        image: 'images/dress1.jpg',
        category: 'dresses',
        description: 'Beautiful evening dress perfect for special occasions',
        inStock: true,
        rating: 4.5,
        reviews: 23
      },
      {
        _id: '2',
        name: 'Casual Summer Top',
        price: 34.99,
        image: 'images/top1.jpg',
        category: 'tops',
        description: 'Comfortable and stylish summer top',
        inStock: true,
        rating: 4.2,
        reviews: 18
      },
      {
        _id: '3',
        name: 'Designer Handbag',
        price: 129.99,
        image: 'images/bag1.jpg',
        category: 'accessories',
        description: 'Premium designer handbag with multiple compartments',
        inStock: true,
        rating: 4.8,
        reviews: 31
      },
      {
        _id: '4',
        name: 'Stylish Jeans',
        price: 59.99,
        image: 'images/jeans1.jpg',
        category: 'bottoms',
        description: 'Modern fit jeans with premium denim',
        inStock: true,
        rating: 4.3,
        reviews: 27
      },
      {
        _id: '5',
        name: 'Fashion Sneakers',
        price: 79.99,
        image: 'images/shoes1.jpg',
        category: 'footwear',
        description: 'Trendy sneakers perfect for casual wear',
        inStock: true,
        rating: 4.6,
        reviews: 19
      }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: products.length,
        data: products
      })
    };

  } catch (error) {
    console.error('Products API error:', error);
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
