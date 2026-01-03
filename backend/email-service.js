// Email Service for Krazy Girls
const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendWelcomeEmail(userEmail, userName) {
        try {
            const welcomeHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to Krazy Girls</title>
                    <style>
                        body {
                            font-family: 'Montserrat', sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #f8f9fa;
                            color: #2c2c2c;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: white;
                        }
                        .header {
                            background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%);
                            padding: 30px 20px;
                            text-align: center;
                            color: white;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 2.5rem;
                            font-weight: 700;
                        }
                        .header p {
                            margin: 10px 0 0 0;
                            font-size: 1.1rem;
                            opacity: 0.9;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .welcome-message {
                            text-align: center;
                            margin-bottom: 40px;
                        }
                        .welcome-message h2 {
                            color: #FF69B4;
                            font-size: 1.8rem;
                            margin-bottom: 15px;
                        }
                        .welcome-message p {
                            font-size: 1.1rem;
                            line-height: 1.6;
                            color: #666;
                        }
                        .features {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                            gap: 25px;
                            margin: 40px 0;
                        }
                        .feature {
                            text-align: center;
                            padding: 20px;
                            border-radius: 10px;
                            background: #f8f9fa;
                        }
                        .feature-icon {
                            font-size: 2.5rem;
                            margin-bottom: 15px;
                        }
                        .feature h3 {
                            color: #333;
                            margin-bottom: 10px;
                            font-size: 1.2rem;
                        }
                        .feature p {
                            color: #666;
                            font-size: 0.95rem;
                            line-height: 1.5;
                        }
                        .cta-button {
                            display: inline-block;
                            background: linear-gradient(135deg, #FF69B4 0%, #FF1493 100%);
                            color: white;
                            padding: 15px 35px;
                            text-decoration: none;
                            border-radius: 25px;
                            font-weight: 600;
                            font-size: 1.1rem;
                            margin: 20px 0;
                            transition: transform 0.3s ease;
                        }
                        .cta-button:hover {
                            transform: translateY(-2px);
                        }
                        .footer {
                            background: #f8f9fa;
                            padding: 30px;
                            text-align: center;
                            border-top: 1px solid #e9ecef;
                        }
                        .footer p {
                            margin: 5px 0;
                            color: #666;
                            font-size: 0.9rem;
                        }
                        .social-links {
                            margin: 20px 0;
                        }
                        .social-links a {
                            display: inline-block;
                            margin: 0 10px;
                            font-size: 1.5rem;
                            text-decoration: none;
                            color: #FF69B4;
                        }
                        .discount-badge {
                            background: #e74c3c;
                            color: white;
                            padding: 8px 15px;
                            border-radius: 20px;
                            font-weight: 600;
                            font-size: 0.9rem;
                            display: inline-block;
                            margin: 10px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🛍️ KRAZY GIRLS</h1>
                            <p>Premium Fashion for the Bold & Beautiful</p>
                        </div>
                        
                        <div class="content">
                            <div class="welcome-message">
                                <h2>Welcome to the Family, ${userName}! 🎉</h2>
                                <p>Thank you for joining Krazy Girls! We're thrilled to have you as part of our fashion community.</p>
                                <div class="discount-badge">
                                    🎁 Special Welcome Gift: 15% OFF Your First Order!
                                </div>
                                <p>Use code: <strong>WELCOME15</strong> at checkout</p>
                            </div>
                            
                            <div class="features">
                                <div class="feature">
                                    <div class="feature-icon">👗</div>
                                    <h3>Premium Quality</h3>
                                    <p>Curated collection of high-quality fashion pieces that make you stand out</p>
                                </div>
                                <div class="feature">
                                    <div class="feature-icon">🚚</div>
                                    <h3>Free Shipping</h3>
                                    <p>Enjoy free shipping on orders above ₹999. Fast delivery to your doorstep</p>
                                </div>
                                <div class="feature">
                                    <div class="feature-icon">💝</div>
                                    <h3>Easy Returns</h3>
                                    <p>7-day easy return policy. Shop with confidence and peace of mind</p>
                                </div>
                            </div>
                            
                            <div style="text-align: center; margin: 40px 0;">
                                <h3 style="color: #333; margin-bottom: 15px;">Ready to Start Shopping?</h3>
                                <a href="http://localhost:5000" class="cta-button">Start Shopping Now</a>
                            </div>
                            
                            <div style="background: #fff0f5; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #FF69B4;">
                                <h4 style="color: #FF69B4; margin-bottom: 10px;">📱 What's Next?</h4>
                                <ul style="color: #666; line-height: 1.8;">
                                    <li>Browse our latest collection of suits, kurtas, and dresses</li>
                                    <li>Create your wishlist and save your favorite items</li>
                                    <li>Enjoy exclusive member-only deals and early access</li>
                                    <li>Get personalized recommendations based on your style</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <h3 style="color: #333; margin-bottom: 15px;">Connect With Us</h3>
                            <div class="social-links">
                                <a href="#">📘</a>
                                <a href="#">📌</a>
                                <a href="#">📷</a>
                                <a href="#">🐦</a>
                            </div>
                            <p><strong>Krazy Girls</strong> - Fashion for the Bold & Beautiful</p>
                            <p>© 2024 Krazy Girls | All rights reserved</p>
                            <p style="font-size: 0.8rem; color: #999;">
                                You received this email because you signed up for a Krazy Girls account.<br>
                                <a href="#" style="color: #999;">Unsubscribe</a> | 
                                <a href="#" style="color: #999;">Privacy Policy</a> | 
                                <a href="#" style="color: #999;">Terms of Service</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            const mailOptions = {
                from: `"Krazy Girls" <${process.env.EMAIL_USER}>`,
                to: userEmail,
                subject: `🎉 Welcome to Krazy Girls, ${userName}! Your 15% Discount Inside`,
                html: welcomeHTML
            };

            const result = await this.transporter.sendMail(mailOptions);
            console.log('✅ Welcome email sent successfully to:', userEmail);
            return { success: true, messageId: result.messageId };

        } catch (error) {
            console.error('❌ Error sending welcome email:', error);
            return { success: false, error: error.message };
        }
    }

    async testConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ Email service is ready to send emails');
            return true;
        } catch (error) {
            console.error('❌ Email service configuration error:', error);
            return false;
        }
    }
}

module.exports = EmailService;
