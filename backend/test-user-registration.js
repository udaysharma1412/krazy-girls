// Test User Registration
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5003/api';

async function testUserRegistration() {
    console.log('🧪 Testing User Registration System...\n');
    
    // Test user data
    const testUser = {
        name: 'Test User',
        email: 'testuser@example.com',
        phone: '9876543210',
        password: 'test123456'
    };
    
    try {
        console.log('📝 Registering new user...');
        console.log('User data:', { ...testUser, password: '***' });
        
        // Register user
        const registerResponse = await fetch(`${API_BASE}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });
        
        const registerResult = await registerResponse.json();
        console.log('\n✅ Registration Response:', registerResult);
        
        if (registerResult.success) {
            console.log('\n🎉 User registered successfully!');
            console.log('User ID:', registerResult.user._id);
            console.log('Name:', registerResult.user.name);
            console.log('Email:', registerResult.user.email);
            
            // Test login
            console.log('\n🔐 Testing login...');
            const loginResponse = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: testUser.email,
                    password: testUser.password
                })
            });
            
            const loginResult = await loginResponse.json();
            console.log('\n✅ Login Response:', loginResult);
            
            if (loginResult.success) {
                console.log('\n🎉 Login successful!');
                console.log('User logged in:', loginResult.user.name);
            } else {
                console.log('\n❌ Login failed:', loginResult.message);
            }
        } else {
            console.log('\n❌ Registration failed:', registerResult.message);
        }
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
    }
    
    // Test getting all users
    try {
        console.log('\n📋 Getting all users...');
        const usersResponse = await fetch(`${API_BASE}/users`);
        const usersResult = await usersResponse.json();
        
        console.log('\n✅ All Users Response:', usersResult);
        console.log('\n👥 Total users:', usersResult.count);
        
        if (usersResult.success && usersResult.users.length > 0) {
            console.log('\n📝 Registered Users:');
            usersResult.users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
            });
        }
        
    } catch (error) {
        console.error('\n❌ Failed to get users:', error.message);
    }
    
    console.log('\n🏁 Test completed!');
}

// Run the test
testUserRegistration();
