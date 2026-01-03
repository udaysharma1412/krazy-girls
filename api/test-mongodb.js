// Test MongoDB Connection
const mongoose = require('mongoose');

// Load environment variables
require('dotenv').config();

// Test connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connection successful!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB connection failed:', err);
        process.exit(1);
    });
