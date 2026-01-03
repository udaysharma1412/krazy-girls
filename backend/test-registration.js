// Test User Registration Directly
const fetch = require('node-fetch');

const testUser = {
    name: 'New Test User',
    email: 'newtest.krazygirls@gmail.com',
    phone: '9876543299',
    password: 'newtest123'
};

async function testRegistration() {
    try {
        console.log('🧪 Testing user registration...');
        console.log('📝 Test user data:', testUser);
        
        const response = await fetch('http://localhost:5003/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });
        
        const result = await response.json();
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response data:', result);
        
        if (result.success) {
            console.log('✅ Registration successful!');
            console.log('👤 User created:', result.user);
        } else {
            console.log('❌ Registration failed:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testRegistration();
