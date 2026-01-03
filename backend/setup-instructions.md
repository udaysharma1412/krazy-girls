# Krazy Girls Backend Setup Instructions

## Quick Setup Guide

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Copy the `.env` file and update with your credentials:
```bash
cp .env .env.local
```

### 3. Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update `MONGODB_URI` in `.env` file

### 4. Payment Gateway Setup

#### Stripe (International Payments)
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard
3. Add to `.env`:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

#### Razorpay (Indian Payments)
1. Create account at [razorpay.com](https://razorpay.com)
2. Get API keys from Dashboard
3. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```

### 5. Start Development Server
```bash
npm run dev
```

Server will run on: `http://localhost:5000`

### 6. Test API
Health check: `http://localhost:5000/api/health`

## Frontend Integration

### Add API Client to Your HTML
```html
<script src="backend/api-client.js"></script>
```

### Update Frontend API Calls
Replace localStorage calls with API client calls:

```javascript
// Before
const products = JSON.parse(localStorage.getItem('products') || '[]');

// After
const response = await api.getProducts();
const products = response.products;
```

## Demo Account
- Email: demo@krazygirls.com
- Password: demo123

## API Endpoints Reference

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/signup` - User registration
- GET `/api/auth/me` - Get current user

### Products
- GET `/api/products` - Get all products
- POST `/api/products` - Create product (Admin)
- PUT `/api/products/:id` - Update product (Admin)
- DELETE `/api/products/:id` - Delete product (Admin)

### Cart
- GET `/api/cart` - Get user cart
- POST `/api/cart/add` - Add to cart
- DELETE `/api/cart/:id` - Remove from cart

### Orders
- POST `/api/orders` - Create order
- GET `/api/orders` - Get user orders

### Payment
- POST `/api/payment/stripe/create-intent` - Stripe payment
- POST `/api/payment/razorpay/create-order` - Razorpay payment
- POST `/api/payment/cod` - Cash on delivery

## Security Notes

1. Change JWT_SECRET in production
2. Use HTTPS in production
3. Validate all inputs
4. Implement rate limiting
5. Secure payment keys

## Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
git push heroku main
```

### Vercel
```bash
vercel --prod
```

### Docker
```bash
docker build -t krazy-girls-backend .
docker run -p 5000:5000 krazy-girls-backend
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check MongoDB is running
   - Verify connection string in `.env`

2. **Payment Gateway Errors**
   - Verify API keys are correct
   - Check if keys are in test mode

3. **CORS Errors**
   - Ensure frontend URL is in CORS whitelist
   - Check if backend is running on correct port

4. **Authentication Errors**
   - Verify JWT_SECRET is set
   - Check token expiration

### Debug Mode
Set `NODE_ENV=development` for detailed error messages.

## Support

For issues and questions:
1. Check console logs
2. Verify API endpoints
3. Test with Postman/Thunder Client
4. Check environment variables
