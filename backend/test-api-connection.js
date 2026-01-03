// Test API Connection Directly
const fetch = require('node-fetch');

async function testAPIConnection() {
    try {
        console.log('🧪 Testing API connection...');
        
        // Test 1: Check if server is responding
        console.log('\n📡 Testing server response...');
        const healthCheck = await fetch('http://localhost:5003/api/users', {
            method: 'GET',
            timeout: 5000
        });
        
        if (healthCheck.ok) {
            console.log('✅ Server is responding');
        } else {
            console.log('❌ Server not responding:', healthCheck.status);
            return;
        }
        
        // Test 2: Test user registration
        console.log('\n👥 Testing user registration...');
        const testUser = {
            name: 'API Test User',
            email: 'apitest@example.com',
            phone: '9998887776',
            password: 'apitest123'
        };
        
        const signupResponse = await fetch('http://localhost:5003/api/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5000'
            },
            body: JSON.stringify(testUser),
            timeout: 10000
        });
        
        console.log('📊 Signup response status:', signupResponse.status);
        
        if (signupResponse.ok) {
            const result = await signupResponse.json();
            console.log('✅ Registration successful:', result);
            
            // Clean up - delete the test user
            try {
                const deleteResponse = await fetch(`http://localhost:5003/api/users/${result.user._id}`, {
                    method: 'DELETE'
                });
                console.log('🗑️ Test user cleaned up');
            } catch (error) {
                console.log('⚠️ Could not clean up test user:', error.message);
            }
            
        } else {
            console.log('❌ Registration failed');
            const errorText = await signupResponse.text();
            console.log('Error details:', errorText);
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

testAPIConnection();
