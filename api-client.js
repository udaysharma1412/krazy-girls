// API Client for Krazy Girls Frontend
// This file connects your frontend to the backend API

class ApiClient {
  constructor() {
    // Use Netlify API URLs in production, localhost in development
    this.isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && window.location.protocol !== 'file:';
    
    if (this.isProduction) {
      // Use the current site's hostname for API calls
      this.baseURL = `${window.location.protocol}//${window.location.hostname}/.netlify/functions`;
      this.userBaseURL = `${window.location.protocol}//${window.location.hostname}/.netlify/functions`;
    } else {
      this.baseURL = 'http://localhost:5003/api';
      this.userBaseURL = 'http://localhost:5003/api';
    }
    
    this.token = localStorage.getItem('token') || null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove token
  removeToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Get current user
  getCurrentUser() {
    if (!this.token) return null;
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return payload.id === 'demo-user' ? {
        id: 'demo-user',
        name: 'Demo User',
        email: 'demo@krazygirls.com',
        phone: '9876543210',
        avatar: 'DU',
        addresses: []
      } : null;
    } catch (error) {
      return null;
    }
  }

  // Make API request
  async request(endpoint, options = {}) {
    // Determine which base URL to use based on endpoint
    const isUserEndpoint = endpoint.includes('/login') || endpoint.includes('/signup') || endpoint.includes('/users');
    const baseURL = isUserEndpoint ? this.userBaseURL : this.baseURL;
    const url = `${baseURL}${endpoint}`;
    
    console.log(`🔍 Debug: endpoint="${endpoint}"`);
    console.log(`🔍 Debug: isUserEndpoint=${isUserEndpoint}`);
    console.log(`🔍 Debug: this.userBaseURL="${this.userBaseURL}"`);
    console.log(`🔍 Debug: this.baseURL="${this.baseURL}"`);
    console.log(`🔍 Debug: baseURL="${baseURL}"`);
    console.log(`🔍 Debug: final url="${url}"`);
    
    console.log(`🔍 API Request: ${(options.method || 'GET')} ${url}`);
    console.log(`🔍 Is User Endpoint: ${isUserEndpoint}, Base URL: ${baseURL}`);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      console.log(`🔍 Response Status: ${response.status}`);
      
      const text = await response.text();
      console.log(`🔍 Response Text (first 100 chars): ${text.substring(0, 100)}`);
      
      // Try to parse as JSON, if fails return error
      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('🔍 JSON Parse Error:', parseError);
        return { success: false, error: 'Invalid JSON response', fallback: true };
      }

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('🔍 API Error:', error);
      // Return fallback response instead of throwing error
      return { success: false, error: error.message, fallback: true };
    }
  }

  // Authentication
  async login(email, password) {
    console.log('🔍 Login Debug: endpoint before modification = /auth/login');
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.success) {
      this.setToken(data.token);
    }
    
    return data;
  }

  async signup(userData) {
    console.log('🔍 Signup Debug: endpoint before modification = /auth/signup');
    console.log('🔍 Signup Debug: userData =', userData);
    console.log('🔍 Signup Debug: JSON.stringify(userData) =', JSON.stringify(userData));
    
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    console.log('🔍 Signup Debug: result =', data);
    return data;
  }

  async getCurrentUserProfile() {
    return await this.request('/auth/me');
  }

  async updateProfile(userData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await this.request(`/products${query ? '?' + query : ''}`);
  }

  async getProduct(id) {
    return await this.request(`/products/${id}`);
  }

  async createProduct(productData) {
    return await this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id, productData) {
    return await this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id) {
    return await this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async updateProductStock(id, stock) {
    return await this.request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  }

  async toggleProductStock(id) {
    return await this.request(`/products/${id}/toggle-stock`, {
      method: 'PATCH',
    });
  }

  // Cart
  async getCart() {
    try {
      return await this.request('/cart');
    } catch (error) {
      console.log('API unavailable, using local storage fallback for cart');
      // Return empty cart to allow frontend to continue with local storage
      return { products: [] };
    }
  }

  async addToCart(itemData) {
    try {
      return await this.request('/cart/add', {
        method: 'POST',
        body: JSON.stringify(itemData),
      });
    } catch (error) {
      console.log('API unavailable, using local storage fallback for cart');
      // Return success to allow frontend to continue with local storage
      return { success: true, fallback: true };
    }
  }

  async updateCartItem(itemId, quantity) {
    return await this.request(`/cart/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId) {
    return await this.request(`/cart/${itemId}`, {
      method: 'DELETE',
    });
  }

  async clearCart() {
    return await this.request('/cart', {
      method: 'DELETE',
    });
  }

  async getCartSummary() {
    return await this.request('/cart/summary');
  }

  // Orders
  async createOrder(orderData) {
    return await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders() {
    return await this.request('/orders');
  }

  async getOrder(id) {
    return await this.request(`/orders/${id}`);
  }

  async updateOrderStatus(id, status) {
    return await this.request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async cancelOrder(id) {
    return await this.request(`/orders/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  // Wishlist
  async getWishlist() {
    return await this.request('/wishlist');
  }

  async addToWishlist(productId) {
    return await this.request('/wishlist/add', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId) {
    return await this.request(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async clearWishlist() {
    return await this.request('/wishlist', {
      method: 'DELETE',
    });
  }

  async checkWishlistItem(productId) {
    return await this.request(`/wishlist/check/${productId}`);
  }

  async toggleWishlistItem(productId) {
    return await this.request('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  // Payment
  async getPaymentMethods() {
    return await this.request('/payment/methods');
  }

  async createStripePaymentIntent(amount, currency = 'inr') {
    return await this.request('/payment/stripe/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  async confirmStripePayment(paymentIntentId) {
    return await this.request('/payment/stripe/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId }),
    });
  }

  async createRazorpayOrder(amount, currency = 'INR') {
    return await this.request('/payment/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, currency }),
    });
  }

  async verifyRazorpayPayment(paymentData) {
    return await this.request('/payment/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async processCashOnDelivery(amount, orderId) {
    return await this.request('/payment/cod', {
      method: 'POST',
      body: JSON.stringify({ amount, orderId }),
    });
  }

  async getPaymentStatus(paymentId, gateway) {
    return await this.request(`/payment/status/${paymentId}?gateway=${gateway}`);
  }

  async processRefund(paymentId, amount, gateway) {
    return await this.request('/payment/refund', {
      method: 'POST',
      body: JSON.stringify({ paymentId, amount, gateway }),
    });
  }

  // Health check
  async healthCheck() {
    return await this.request('/health');
  }
}

// Create global API client instance
const api = new ApiClient();

// Export for use in your frontend
if (typeof module !== 'undefined' && module.exports) {
  module.exports = api;
} else {
  window.api = api;
}
