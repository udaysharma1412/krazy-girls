// View Current Users in MongoDB
const mongoose = require('mongoose');
const path = require('path');

// Load .env file explicitly
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function viewUsers() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully');
        
        // Define User Schema (same as in user-server.js)
        const userSchema = new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            phone: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            addresses: [{ type: mongoose.Schema.Types.Mixed }],
            orders: [{ type: String }],
            welcomeEmailSent: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
            isActive: { type: Boolean, default: true }
        });
        
        const User = mongoose.model('User', userSchema);
        
        // Get all users with details
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        
        console.log('\n📊 ALL USERS IN MONGODB:');
        console.log('=' .repeat(80));
        
        users.forEach((user, index) => {
            console.log(`${index + 1}. Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Phone: ${user.phone}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log(`   Welcome Email Sent: ${user.welcomeEmailSent}`);
            console.log(`   Active: ${user.isActive}`);
            console.log(`   ID: ${user._id}`);
            console.log('-'.repeat(50));
        });
        
        console.log(`\n📈 Total Users: ${users.length}`);
        
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

viewUsers();
