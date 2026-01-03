const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const EmailService = require('./email-service');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: ['http://localhost:5000', 'http://127.0.0.1:5000', 'file://', 'null'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Initialize Email Service
const emailService = new EmailService();

// User Schema
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

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Register new user
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;
        
        console.log('🔍 Server Debug: Received signup request');
        console.log('🔍 Server Debug: name =', name);
        console.log('🔍 Server Debug: email =', email);
        console.log('🔍 Server Debug: phone =', phone);
        console.log('🔍 Server Debug: password =', password ? '[HIDDEN]' : 'undefined');

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        console.log('🔍 Server Debug: existingUser =', existingUser ? existingUser.email : 'null');
        
        if (existingUser) {
            console.log('🔍 Server Debug: User already exists, returning error');
            return res.status(400).json({
                success: false,
                message: existingUser.email === email ? 'Email already registered' : 'Phone number already registered'
            });
        }

        console.log('🔍 Server Debug: Creating new user...');

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            addresses: [],
            orders: [],
            welcomeEmailSent: false
        });

        await newUser.save();

        console.log('✅ New user registered:', { name, email, phone, id: newUser._id });

        // Send welcome email (only once, and don't block registration)
        if (!newUser.welcomeEmailSent) {
            // Send email asynchronously without waiting
            emailService.sendWelcomeEmail(email, name).then(async (emailResult) => {
                if (emailResult.success) {
                    // Mark email as sent in database
                    await User.findByIdAndUpdate(newUser._id, { welcomeEmailSent: true });
                    console.log('✅ Welcome email sent and marked in database for:', email);
                } else {
                    console.log('⚠️ Welcome email failed for:', email, emailResult.error);
                }
            }).catch(error => {
                console.error('❌ Error in welcome email process:', error);
            });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        console.log('✅ User logged in:', { email, name: user.name, id: user._id });

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                addresses: user.addresses,
                orders: user.orders,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Get all users (for admin)
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({
            success: true,
            users,
            count: users.length
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get users',
            error: error.message
        });
    }
});

// Get user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user',
            error: error.message
        });
    }
});

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
    try {
        const testEmail = req.query.email || 'test@example.com';
        const testName = req.query.name || 'Test User';
        
        const result = await emailService.sendWelcomeEmail(testEmail, testName);
        
        res.json({
            success: result.success,
            message: result.success ? 'Test email sent successfully' : 'Failed to send test email',
            error: result.error || null
        });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({
            success: false,
            message: 'Test email failed',
            error: error.message
        });
    }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`🚀 User server running on port ${PORT}`);
    console.log(`📝 MongoDB URI: ${process.env.MONGODB_URI}`);
    console.log(`👥 Ready to register users!`);
    console.log(`📧 Email service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
});
