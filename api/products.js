// Vercel Serverless Function for Products
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Sample products data
    const products = [
      {
        _id: '1',
        name: 'Krazy Girls T-Shirt',
        price: 999,
        image: 'images/dress21.jpg',
        category: 'women',
        description: 'Stylish cotton t-shirt for modern women',
        inStock: true,
        rating: 4.5,
        reviews: 23
      },
      {
        _id: '2',
        name: 'Krazy Girls Jeans',
        price: 1499,
        image: 'images/dress22.jpg',
        category: 'women',
        description: 'Comfortable denim jeans with perfect fit',
        inStock: true,
        rating: 4.8,
        reviews: 45
      },
      {
        _id: '3',
        name: 'Krazy Girls Dress',
        price: 2499,
        image: 'images/dress23.jpg',
        category: 'women',
        description: 'Elegant evening dress for special occasions',
        inStock: true,
        rating: 4.2,
        reviews: 18
      },
      {
        _id: '4',
        name: 'Krazy Girls Skirt',
        price: 899,
        image: 'images/dress24.jpg',
        category: 'women',
        description: 'Trendy skirt with beautiful patterns',
        inStock: true,
        rating: 4.6,
        reviews: 12
      },
      {
        _id: '5',
        name: 'Krazy Girls Handbag',
        price: 3299,
        image: 'images/dress25.jpg',
        category: 'accessories',
        description: 'Stylish handbag for everyday use',
        inStock: true,
        rating: 4.7,
        reviews: 8
      }
    ];

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      products: products
    });

  } catch (error) {
    console.error('❌ Products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
