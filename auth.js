// Authentication System for Krazy Girls
class Auth {
    constructor() {
        this.currentUser = null;
        this.users = this.loadUsers();
        this.orders = this.loadOrders();
        this.initializeDemoUser();
    }

    // Initialize demo user
    initializeDemoUser() {
        if (!this.users.find(u => u.email === 'demo@krazygirls.com')) {
            this.users.push({
                id: 'demo-user-1',
                name: 'Demo User',
                email: 'demo@krazygirls.com',
                phone: '9876543210',
                password: this.hashPassword('demo123'),
                addresses: [
                    {
                        id: 'demo-address-1',
                        type: 'home',
                        street: '123 Fashion Street',
                        city: 'Mumbai',
                        state: 'Maharashtra',
                        pincode: '400001',
                        isDefault: true
                    }
                ],
                orders: [],
                createdAt: new Date().toISOString()
            });
            this.saveUsers();
        }
    }

    // Hash password (simple implementation for demo)
    hashPassword(password) {
        return btoa(password + 'krazygirls');
    }

    // Verify password
    verifyPassword(password, hash) {
        return this.hashPassword(password) === hash;
    }

    // Load users from localStorage
    loadUsers() {
        const stored = localStorage.getItem('krazygirls_users');
        return stored ? JSON.parse(stored) : [];
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('krazygirls_users', JSON.stringify(this.users));
    }

    // Load orders from localStorage
    loadOrders() {
        const stored = localStorage.getItem('krazygirls_orders');
        return stored ? JSON.parse(stored) : {};
    }

    // Save orders to localStorage
    saveOrders() {
        localStorage.setItem('krazygirls_orders', JSON.stringify(this.orders));
    }

    // Login user
    async login(email, password) {
        try {
            // First try to login with API (MongoDB)
            if (window.api && api.login) {
                const result = await api.login(email, password);
                if (result.success) {
                    // Also save to localStorage for backup
                    const user = {
                        id: result.user._id || result.user.id,
                        name: result.user.name,
                        email: result.user.email,
                        phone: result.user.phone,
                        password: this.hashPassword(password),
                        addresses: result.user.addresses || [],
                        orders: result.user.orders || [],
                        createdAt: result.user.createdAt,
                        mongodbId: result.user._id
                    };
                    
                    this.currentUser = user;
                    localStorage.setItem('krazygirls_current_user', JSON.stringify(user));
                    
                    return { success: true, user: user };
                }
            }
        } catch (error) {
            console.log('API login failed, using localStorage:', error);
        }
        
        // Fallback to localStorage only
        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: 'Invalid password' };
        }

        this.currentUser = user;
        localStorage.setItem('krazygirls_current_user', JSON.stringify(user));
        
        return { success: true, user: user };
    }

    // Register new user
    async register(userData) {
        try {
            // First try to register with API (MongoDB)
            if (window.api && api.signup) {
                console.log('🔍 Auth: Attempting API registration...');
                const result = await api.signup(userData);
                console.log('🔍 Auth: API Result:', result);
                
                if (result.success && !result.fallback) {
                    console.log('🔍 Auth: API registration successful!');
                    
                    // Also save to localStorage for backup
                    const newUser = {
                        id: result.user._id || result.user.id,
                        name: userData.name,
                        email: userData.email,
                        phone: userData.phone,
                        password: this.hashPassword(userData.password),
                        addresses: [],
                        orders: [],
                        createdAt: new Date().toISOString(),
                        mongodbId: result.user._id
                    };
                    
                    this.users.push(newUser);
                    this.saveUsers();
                    
                    this.currentUser = newUser;
                    localStorage.setItem('krazygirls_current_user', JSON.stringify(newUser));
                    
                    return { success: true, user: newUser };
                } else {
                    console.log('🔍 Auth: API registration failed, falling back to localStorage');
                    console.log('🔍 Auth: API Error:', result.error);
                }
            } else {
                console.log('🔍 Auth: API not available, using localStorage');
            }
        } catch (error) {
            console.log('API registration failed, using localStorage:', error);
        }
        
        // Fallback to localStorage only
        // Check if user already exists
        if (this.users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Check if phone already exists
        if (this.users.find(u => u.phone === userData.phone)) {
            return { success: false, message: 'Phone number already registered' };
        }

        // Create new user
        const newUser = {
            id: 'user-' + Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: this.hashPassword(userData.password),
            addresses: [],
            orders: [],
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();

        // Auto-login after registration
        this.currentUser = newUser;
        localStorage.setItem('krazygirls_current_user', JSON.stringify(newUser));

        return { success: true, user: newUser };
    }

    // Logout user
    logout() {
        this.currentUser = null;
        localStorage.removeItem('krazygirls_current_user');
        return { success: true };
    }

    // Get current user
    getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        // Try to restore from localStorage
        const stored = localStorage.getItem('krazygirls_current_user');
        if (stored) {
            this.currentUser = JSON.parse(stored);
            return this.currentUser;
        }

        return null;
    }

    // Get user initials
    getUserInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // Update user profile
    updateProfile(userData) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, message: 'User not logged in' };
        }

        const userIndex = this.users.findIndex(u => u.id === user.id);
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        // Update user data
        this.users[userIndex] = { ...this.users[userIndex], ...userData };
        this.currentUser = this.users[userIndex];
        
        this.saveUsers();
        localStorage.setItem('krazygirls_current_user', JSON.stringify(this.currentUser));

        return { success: true, user: this.currentUser };
    }

    // Add address
    addAddress(address) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, message: 'User not logged in' };
        }

        const newAddress = {
            id: 'address-' + Date.now(),
            ...address,
            isDefault: user.addresses.length === 0
        };

        const userIndex = this.users.findIndex(u => u.id === user.id);
        this.users[userIndex].addresses.push(newAddress);
        
        this.saveUsers();
        this.currentUser = this.users[userIndex];
        localStorage.setItem('krazygirls_current_user', JSON.stringify(this.currentUser));

        return { success: true, address: newAddress };
    }

    // Add order
    addOrder(order) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, message: 'User not logged in' };
        }

        const newOrder = {
            id: 'order-' + Date.now(),
            ...order,
            userId: user.id,
            createdAt: new Date().toISOString()
        };

        if (!this.orders[user.id]) {
            this.orders[user.id] = [];
        }
        
        this.orders[user.id].push(newOrder);
        this.saveOrders();

        // Update user's orders array
        const userIndex = this.users.findIndex(u => u.id === user.id);
        this.users[userIndex].orders.push(newOrder.id);
        this.saveUsers();

        return { success: true, order: newOrder };
    }

    // Get user orders
    getOrders() {
        const user = this.getCurrentUser();
        if (!user) {
            return [];
        }

        return this.orders[user.id] || [];
    }
}

// Initialize auth system
const auth = new Auth();

// Handle login form submission
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('authError');

    try {
        // Try API first, fallback to local auth
        let result;
        if (window.api && api.login) {
            result = await api.login(email, password);
        } else {
            result = await auth.login(email, password);
        }

        if (result.success) {
            closeModal();
            showNotification('Login successful! Welcome back! 🎉');
            updateUserInterface();
            updateBadges();
        } else {
            errorDiv.innerHTML = `<div class="auth-error">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.innerHTML = `<div class="auth-error">Login failed. Please try again.</div>`;
    }
}

// Handle signup form submission
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const phone = document.getElementById('signupPhone').value;
    const password = document.getElementById('signupPassword').value;
    const terms = document.getElementById('terms').checked;
    const errorDiv = document.getElementById('signupError');

    if (!terms) {
        errorDiv.innerHTML = `<div class="auth-error">Please accept the Terms & Conditions</div>`;
        return;
    }

    try {
        // Try API first, fallback to local auth
        let result;
        if (window.api && api.signup) {
            result = await api.signup({ name, email, phone, password });
        } else {
            result = await auth.register({ name, email, phone, password });
        }

        if (result.success) {
            closeModal();
            showNotification('Account created successfully! Welcome to Krazy Girls! 🎉');
            updateUserInterface();
            updateBadges();
        } else {
            errorDiv.innerHTML = `<div class="auth-error">${result.message}</div>`;
        }
    } catch (error) {
        console.error('Signup error:', error);
        errorDiv.innerHTML = `<div class="auth-error">Registration failed. Please try again.</div>`;
    }
}

// Switch between login and signup tabs
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(t => t.classList.remove('active'));
    forms.forEach(f => f.classList.remove('active'));
    
    if (tab === 'login') {
        tabs[0].classList.add('active');
        document.getElementById('loginForm').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
}

// Update user interface based on auth state
function updateUserInterface() {
    const userSection = document.getElementById('userSection');
    const user = auth.getCurrentUser();

    // Only update if userSection exists (avoid errors in debug pages)
    if (userSection) {
        if (user) {
            userSection.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 0.85rem; color: var(--text-light);">Hi, ${user.name.split(' ')[0]}</span>
                    <button class="nav-icon-btn" onclick="showUserMenu()" title="My Account">
                    👤
                </button>
            </div>
        `;
        } else {
            userSection.innerHTML = `
            <button class="nav-icon-btn" onclick="showAuthModal()" title="Login / Signup">
                👤
            </button>
        `;
        }
    }
}

// Show user menu with full account details
function showUserMenu() {
    const user = auth.getCurrentUser();
    const orders = auth.getOrders();
    
    openModal(`
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h2 class="modal-title">My Account</h2>
                <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; margin-bottom: 2rem; padding: 1.5rem; background: var(--bg-light); border-radius: 8px;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">👤</div>
                    <h3 style="color: var(--primary); margin-bottom: 0.5rem;">${user.name}</h3>
                    <p style="color: var(--text-light); margin-bottom: 0.3rem;">${user.email}</p>
                    <p style="color: var(--text-light); margin-bottom: 0.3rem;">${user.phone}</p>
                    <p style="font-size: 0.8rem; color: var(--text-light); margin-top: 0.5rem;">
                        Member since ${new Date(user.createdAt).toLocaleDateString()}
                    </p>
                </div>
                
                <div style="display: grid; gap: 0.8rem; margin-bottom: 1.5rem;">
                    <button class="btn btn-secondary" onclick="closeModal(); showOrderHistory()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        📦 My Orders (${orders.length})
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal(); showAddressBook()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        📍 Manage Addresses (${user.addresses.length})
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal(); showWishlist()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        ❤️ My Wishlist
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal(); showCart()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        🛒 Shopping Cart
                    </button>
                    <button class="btn btn-secondary" onclick="closeModal(); showProfileSettings()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        ⚙️ Profile Settings
                    </button>
                </div>
                
                <div style="border-top: 1px solid var(--border); padding-top: 1rem;">
                    <button class="btn btn-primary" onclick="logout()" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                        🚪 Logout
                    </button>
                </div>
            </div>
        </div>
    `);
}

// Show order history with detailed transactions
function showOrderHistory() {
    const user = auth.getCurrentUser();
    const orders = auth.getOrders();
    
    openModal(`
        <div class="modal-content large">
            <div class="modal-header">
                <h2 class="modal-title">📦 My Orders (${orders.length})</h2>
                <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${orders.length === 0 ? `
                    <div class="empty-state">
                        <h3>No orders yet</h3>
                        <p>Start shopping to see your orders here</p>
                        <button class="btn btn-primary" onclick="closeModal(); showStore()">Shop Now</button>
                    </div>
                ` : `
                    <div style="display: grid; gap: 1.5rem;">
                        ${orders.map(order => `
                            <div style="border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                    <div>
                                        <h4 style="margin-bottom: 0.5rem;">Order #${order.id}</h4>
                                        <p style="color: var(--text-light); font-size: 0.9rem;">${new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-size: 1.2rem; font-weight: 700; color: var(--primary);">₹${order.totalAmount}</div>
                                        <div style="padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; background: #e8f5e8; color: #2e7d32;">
                                            ${order.status.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                                
                                <div style="display: grid; gap: 0.5rem; margin-bottom: 1rem;">
                                    ${order.items.map(item => `
                                        <div style="display: flex; gap: 1rem; align-items: center; padding: 0.5rem; background: var(--bg-light); border-radius: 4px;">
                                            <div style="font-size: 1.5rem;">${item.image}</div>
                                            <div style="flex: 1;">
                                                <div style="font-weight: 600;">${item.name}</div>
                                                <div style="font-size: 0.85rem; color: var(--text-light);">Size: ${item.size} | Color: ${item.color} | Qty: ${item.quantity}</div>
                                            </div>
                                            <div style="font-weight: 600;">₹${item.price * item.quantity}</div>
                                        </div>
                                    `).join('')}
                                </div>
                                
                                <div style="font-size: 0.9rem; color: var(--text-light);">
                                    <p><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
                                    <p><strong>Shipping:</strong> ${order.shippingAddress}</p>
                                    <p><strong>Order Total:</strong> ₹${order.totalAmount} (incl. tax & shipping)</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `);
}

// Show address book
function showAddressBook() {
    const user = auth.getCurrentUser();
    
    openModal(`
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">📍 Manage Addresses</h2>
                <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${user.addresses.length === 0 ? `
                    <div class="empty-state">
                        <h3>No addresses saved</h3>
                        <p>Add your shipping addresses for faster checkout</p>
                        <button class="btn btn-primary" onclick="addNewAddress()">Add New Address</button>
                    </div>
                ` : `
                    <div style="display: grid; gap: 1rem; margin-bottom: 1.5rem;">
                        ${user.addresses.map(address => `
                            <div style="border: 1px solid var(--border); border-radius: 4px; padding: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <div>
                                        <div style="font-weight: 600; margin-bottom: 0.5rem;">
                                            ${address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                                            ${address.isDefault ? '<span style="background: var(--primary); color: white; padding: 0.2rem 0.5rem; border-radius: 12px; font-size: 0.7rem; margin-left: 0.5rem;">DEFAULT</span>' : ''}
                                        </div>
                                        <p style="color: var(--text-light); margin-bottom: 0.2rem;">${address.street}</p>
                                        <p style="color: var(--text-light); margin-bottom: 0.2rem;">${address.city}, ${address.state} - ${address.pincode}</p>
                                    </div>
                                    <div>
                                        <button class="btn btn-small btn-edit" onclick="editAddress('${address.id}')">Edit</button>
                                        <button class="btn btn-small btn-delete" onclick="deleteAddress('${address.id}')">Delete</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-primary" onclick="addNewAddress()" style="width: 100%;">Add New Address</button>
                `}
            </div>
        </div>
    `);
}

// Show profile settings
function showProfileSettings() {
    const user = auth.getCurrentUser();
    
    openModal(`
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">⚙️ Profile Settings</h2>
                <button class="close-btn" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                <form onsubmit="updateProfile(event)">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" class="form-input" id="profileName" value="${user.name}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" class="form-input" id="profileEmail" value="${user.email}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Phone Number</label>
                        <input type="tel" class="form-input" id="profilePhone" value="${user.phone}" pattern="[6-9][0-9]{9}" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Update Profile</button>
                </form>
            </div>
        </div>
    `);
}

// Update profile
function updateProfile(event) {
    event.preventDefault();
    
    const name = document.getElementById('profileName').value;
    const email = document.getElementById('profileEmail').value;
    const phone = document.getElementById('profilePhone').value;
    
    const result = auth.updateProfile({ name, email, phone });
    
    if (result.success) {
        closeModal();
        showNotification('Profile updated successfully! ✅');
        updateUserInterface();
    } else {
        showNotification('Failed to update profile');
    }
}

// Add new address
function addNewAddress() {
    closeModal();
    showNotification('Address management coming soon! 🏠');
}

// Edit address
function editAddress(addressId) {
    closeModal();
    showNotification('Address editing coming soon! ✏️');
}

// Delete address
function deleteAddress(addressId) {
    closeModal();
    showNotification('Address deletion coming soon! 🗑️');
}

// Logout function
function logout() {
    auth.logout();
    closeModal();
    showNotification('Logged out successfully');
    updateUserInterface();
    updateBadges();
}

// Require authentication for actions
function requireAuth(callback) {
    if (auth.isLoggedIn()) {
        callback();
    } else {
        showAuthModal();
    }
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    updateUserInterface();
});
