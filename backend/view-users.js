const mongoose = require('mongoose');
require('dotenv').config();

// Simple user schema for viewing
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function viewAllUsers() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas');

        // Find all users
        const users = await User.find({}).sort({ createdAt: -1 });
        
        console.log('\n=== ALL USERS ===');
        console.log(`Total users: ${users.length}`);
        console.log('================');
        
        users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Phone: ${user.phone}`);
            console.log(`   Created: ${user.createdAt.toLocaleString()}`);
            console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
            console.log(`   ID: ${user._id}`);
        });
        
        console.log('\n=== CART DATA ===');
        // Show cart data for each user
        const carts = await mongoose.connection.db.collection('carts').find({}).toArray();
        carts.forEach((cart, index) => {
            console.log(`\nCart ${index + 1}:`);
            console.log(`   User: ${cart.userId || 'Guest'}`);
            console.log(`   Items: ${cart.items ? cart.items.length : 0}`);
            console.log(`   Total: ₹${cart.total || 0}`);
        });
        
        console.log('\n=== WISHLIST DATA ===');
        // Show wishlist data
        const wishlists = await mongoose.connection.db.collection('wishlists').find({}).toArray();
        wishlists.forEach((wishlist, index) => {
            console.log(`\nWishlist ${index + 1}:`);
            console.log(`   User: ${wishlist.userId || 'Guest'}`);
            console.log(`   Items: ${wishlist.items ? wishlist.items.length : 0}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

viewAllUsers();
