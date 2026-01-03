const mongoose = require('mongoose');
require('dotenv').config();

async function checkProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const products = await mongoose.connection.db.collection('products').find({}).limit(3).toArray();
        console.log('Current products:');
        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} - Image: ${product.image}`);
        });
        
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProducts();
