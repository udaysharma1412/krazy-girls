// Test API Connection
const fetch = require('node-fetch');

const PRODUCT_API = 'http://localhost:5004/api/products';
const USER_API = 'http://localhost:5003/api/users';

async function testAPIs() {
    console.log('🧪 Testing API Connections...\n');
    
    try {
        // Test Products API
        console.log('📦 Testing Products API...');
        const productsResponse = await fetch(PRODUCT_API);
        const productsData = await productsResponse.json();
        
        console.log('✅ Products API Status:', productsResponse.status);
        console.log('📊 Products Count:', productsData.products ? productsData.products.length : 0);
        
        if (productsData.products && productsData.products.length > 0) {
            const firstProduct = productsData.products[0];
            console.log('🖼️ First Product Image:', firstProduct.image);
            console.log('📝 First Product Name:', firstProduct.name);
        }
        
        // Test Users API
        console.log('\n👥 Testing Users API...');
        const usersResponse = await fetch(USER_API);
        const usersData = await usersResponse.json();
        
        console.log('✅ Users API Status:', usersResponse.status);
        console.log('👤 Users Count:', usersData.count || 0);
        
        console.log('\n🎉 All APIs are working!');
        
    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
    }
}

testAPIs();
