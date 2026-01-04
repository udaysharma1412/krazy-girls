const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Update product images to use local paths
const updateProductImages = async () => {
    try {
        console.log('Updating product images to use local paths...');
        
        // Get all products
        const products = await Product.find({});
        
        // Local images available
        const localImages = [
            'images/dress21.jpg',
            'images/dress22.jpg',
            'images/dress 11.jpg',
            'images/dress 12.jpg',
            'images/dress 13.jpg',
            'images/dress 14.jpg',
            'images/dress 15.jpg',
            'images/dress24.jpg',
            'images/dress25.jpg',
            'images/skdvin8652ess25lpn_1.jpg',
            'images/skdvin8652ess25lpn_2.jpg',
            'images/skdvin8652ess25lpn_5.jpg',
            'images/skdvin8652ess25lpn_5 (1).jpg',
            'images/skdvin8652ess25lpn_6.jpg'
        ];
        
        // Update each product
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const randomImage = localImages[i % localImages.length];
            
            // Update image paths
            product.image = randomImage;
            product.mainImage = randomImage;
            product.images = [randomImage];
            
            await product.save();
            console.log(`✅ Updated product: ${product.name} -> ${randomImage}`);
        }
        
        console.log('✅ All product images updated successfully!');
        console.log('✅ Products now use local image paths!');
        
        // Close connection
        mongoose.connection.close();
        
    } catch (error) {
        console.error('❌ Error updating product images:', error);
        mongoose.connection.close();
    }
};

// Run the update
updateProductImages();
