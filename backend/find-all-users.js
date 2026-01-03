// Find ALL Users in ALL Collections
const mongoose = require('mongoose');
const path = require('path');

// Load .env file explicitly
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function findAllUsers() {
    try {
        console.log('🔍 Connecting to MongoDB...');
        
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB successfully');
        
        // Get database instance
        const db = mongoose.connection.db;
        
        // List all collections
        const collections = await db.listCollections().toArray();
        console.log('\n📚 All Collections in Database:');
        collections.forEach(collection => {
            console.log(`   - ${collection.name}`);
        });
        
        // Check users collection
        if (collections.find(c => c.name === 'users')) {
            console.log('\n👥 Checking "users" collection...');
            const users = await db.collection('users').find({}).toArray();
            console.log(`📊 Found ${users.length} users in "users" collection`);
            
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. User Details:`);
                console.log(`   Name: ${user.name}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Phone: ${user.phone}`);
                console.log(`   Created: ${user.createdAt}`);
                console.log(`   Welcome Email Sent: ${user.welcomeEmailSent}`);
                console.log(`   Active: ${user.isActive}`);
                console.log(`   ID: ${user._id}`);
            });
        }
        
        // Check for any other user-related collections
        const userCollections = collections.filter(c => 
            c.name.toLowerCase().includes('user') || 
            c.name.toLowerCase().includes('customer') ||
            c.name.toLowerCase().includes('account')
        );
        
        if (userCollections.length > 1) {
            console.log('\n🔍 Other user-related collections found:');
            userCollections.forEach(collection => {
                console.log(`   - ${collection.name}`);
            });
        }
        
        await mongoose.connection.close();
        console.log('\n🔌 MongoDB connection closed');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

findAllUsers();
