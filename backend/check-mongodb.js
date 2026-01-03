// Check MongoDB Connection and Users
const mongoose = require('mongoose');
const path = require('path');

// Load .env file explicitly
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔍 Environment variables loaded:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'NOT SET');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');

async function checkMongoDB() {
    try {
        console.log('🔍 Checking MongoDB connection...');
        
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
        
        // Count all users
        const userCount = await User.countDocuments();
        console.log(`📊 Total users in database: ${userCount}`);
        
        // Get all users
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        console.log('👥 Recent users:');
        users.forEach((user, index) => {
            console.log(`${index + 1}. ${user.name} - ${user.email} - ${user.phone} - Created: ${user.createdAt}`);
        });
        
        // Test creating a user
        console.log('\n🧪 Testing user creation...');
        const testUser = {
            name: 'Direct Test User',
            email: 'direct.test@example.com',
            phone: '9998887776',
            password: 'testpass123'
        };
        
        try {
            const newUser = new User(testUser);
            await newUser.save();
            console.log('✅ Test user created successfully:', newUser.email);
            console.log('🆔 User ID:', newUser._id);
            
            // Delete the test user
            await User.deleteOne({ _id: newUser._id });
            console.log('🗑️ Test user deleted');
            
        } catch (error) {
            console.log('❌ Test user creation failed:', error.message);
        }
        
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed');
        
    } catch (error) {
        console.error('❌ MongoDB error:', error);
    }
}

checkMongoDB();
