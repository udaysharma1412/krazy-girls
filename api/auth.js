// Netlify Serverless Function for Authentication
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Send Welcome Email
const sendWelcomeEmail = async (user) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: `"Krazy Girls" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Welcome to Krazy Girls! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #e91e63; margin-bottom: 10px;">Welcome to Krazy Girls! 🛍️</h1>
            <p style="color: #666; font-size: 18px;">Your Fashion Journey Begins Here!</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${user.name},</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Thank you for joining the Krazy Girls family! We're excited to have you as part of our community of fashion lovers.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              As a welcome gift, here's what you can expect:
            </p>
            
            <ul style="color: #666; line-height: 1.8; margin-bottom: 20px;">
              <li>✨ Latest fashion trends and collections</li>
              <li>🎁 Exclusive member-only discounts</li>
              <li>🚚 Free shipping on orders above ₹999</li>
              <li>💰 10% off on your first order</li>
              <li>📱 Early access to new arrivals</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://krazy-girls.netlify.app" style="background-color: #e91e63; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
                Start Shopping Now 🛍️
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Use your first order discount code: <strong style="color: #e91e63;">WELCOME10</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
            <p style="color: #666; margin-bottom: 10px;">
              <strong>Follow us on social media:</strong>
            </p>
            <div style="margin: 10px 0;">
              <span style="margin: 0 10px;">📘 Facebook</span>
              <span style="margin: 0 10px;">📷 Instagram</span>
              <span style="margin: 0 10px;">🐦 Twitter</span>
              <span style="margin: 0 10px;">📌 Pinterest</span>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #ddd;">
            <p style="color: #999; font-size: 12px; margin-bottom: 10px;">
              © 2024 Krazy Girls | Fashion for the Bold & Beautiful
            </p>
            <p style="color: #999; font-size: 12px; margin-bottom: 10px;">
              If you didn't create this account, please contact us at support@krazygirls.com
            </p>
            <p style="color: #999; font-size: 12px;">
              <a href="#" style="color: #999;">Privacy Policy</a> | 
              <a href="#" style="color: #999;">Terms of Service</a> | 
              <a href="#" style="color: #999;">Unsubscribe</a>
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

const handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const path = event.path.replace(/\/\.netlify\/functions\/auth/, '');
    
    if (event.httpMethod === 'POST' && path === '/signup') {
      // Handle signup
      const { name, email, phone, password } = JSON.parse(event.body);
      
      // Validation
      if (!name || !email || !phone || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Please provide all required fields'
          })
        };
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Email already registered'
          })
        };
      }

      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        name,
        email,
        phone,
        password: hashedPassword
      });

      await user.save();
      console.log('User saved to MongoDB:', user._id);

      // Send welcome email
      const emailSent = await sendWelcomeEmail(user);
      if (emailSent) {
        console.log('Welcome email sent to:', user.email);
      } else {
        console.log('Welcome email failed, but user was created');
      }

      // Generate token
      const token = generateToken(user._id);

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'User registered successfully',
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
          },
          emailSent: emailSent
        })
      };

    } else if (event.httpMethod === 'POST' && path === '/login') {
      // Handle login
      const { email, password } = JSON.parse(event.body);
      
      // Validation
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Please provide email and password'
          })
        };
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          })
        };
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            success: false,
            message: 'Invalid credentials'
          })
        };
      }

      // Generate token
      const token = generateToken(user._id);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
          }
        })
      };

    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          success: false,
          message: 'Route not found'
        })
      };
    }

  } catch (error) {
    console.error('Auth API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Server error',
        error: error.message
      })
    };
  }
};

module.exports = { handler };
