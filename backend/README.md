# Krazy Girls Backend API

Complete backend solution for Krazy Girls Fashion Store with authentication, product management, cart, orders, wishlist, and payment gateway integration.

## Features

- **Authentication**: JWT-based user authentication with demo account
- **Product Management**: CRUD operations for products with categories
- **Shopping Cart**: Add, update, remove cart items with stock management
- **Order Management**: Create orders with multiple payment methods
- **Wishlist**: Add/remove items from wishlist
- **Payment Gateway**: Integrated Stripe and Razorpay payment processing
- **Security**: Helmet, rate limiting, input validation
- **Error Handling**: Comprehensive error handling and logging

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (with Mongoose ODM)
- **JWT** - Authentication tokens
- **Stripe** - International payment processing
- **Razorpay** - Indian payment processing
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/krazy-girls
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Payment Gateway - Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key

# Payment Gateway - Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

4. Start MongoDB server

5. Run the application:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `PATCH /api/products/:id/stock` - Update stock (Admin)
- `PATCH /api/products/:id/toggle-stock` - Toggle stock status (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/:itemId` - Update cart item quantity
- `DELETE /api/cart/:itemId` - Remove item from cart
- `DELETE /api/cart` - Clear cart
- `GET /api/cart/summary` - Get cart summary with pricing

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/status` - Update order status (Admin)
- `PATCH /api/orders/:id/cancel` - Cancel order

### Wishlist
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add item to wishlist
- `DELETE /api/wishlist/:productId` - Remove item from wishlist
- `DELETE /api/wishlist` - Clear wishlist
- `GET /api/wishlist/check/:productId` - Check if product is in wishlist
- `POST /api/wishlist/toggle` - Toggle item in wishlist

### Payment
- `POST /api/payment/stripe/create-intent` - Create Stripe payment intent
- `POST /api/payment/stripe/confirm` - Confirm Stripe payment
- `POST /api/payment/razorpay/create-order` - Create Razorpay order
- `POST /api/payment/razorpay/verify` - Verify Razorpay payment
- `POST /api/payment/cod` - Process Cash on Delivery
- `GET /api/payment/methods` - Get available payment methods
- `GET /api/payment/status/:paymentId` - Get payment status
- `POST /api/payment/refund` - Process refund

## Demo Account

For testing purposes, use the demo account:
- **Email**: demo@krazygirls.com
- **Password**: demo123

## Database Schema

### User
```javascript
{
  name: String,
  email: String,
  phone: String,
  password: String (hashed),
  addresses: [{
    type: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  }],
  role: String,
  isActive: Boolean,
  emailVerified: Boolean
}
```

### Product
```javascript
{
  name: String,
  description: String,
  category: String,
  price: Number,
  originalPrice: Number,
  discount: Number,
  sizes: [String],
  colors: [{
    name: String,
    value: String
  }],
  images: [String],
  mainImage: String,
  badge: String,
  stock: Number,
  outOfStock: Boolean,
  details: String,
  tags: [String],
  rating: Number,
  reviews: [ReviewSchema],
  isActive: Boolean
}
```

### Order
```javascript
{
  user: ObjectId,
  orderItems: [{
    name: String,
    quantity: Number,
    image: String,
    price: Number,
    product: ObjectId,
    size: String,
    color: String
  }],
  shippingAddress: AddressSchema,
  paymentMethod: String,
  paymentInfo: Object,
  itemsPrice: Number,
  taxPrice: Number,
  shippingPrice: Number,
  totalPrice: Number,
  orderStatus: String,
  deliveredAt: Date,
  trackingNumber: String
}
```

## Payment Gateway Setup

### Stripe
1. Create a Stripe account
2. Get API keys from Stripe Dashboard
3. Add keys to `.env` file

### Razorpay
1. Create a Razorpay account
2. Get API keys from Razorpay Dashboard
3. Add keys to `.env` file

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: Prevent API abuse
- **Input Validation**: Sanitize all inputs
- **Password Hashing**: bcryptjs for secure passwords
- **JWT Authentication**: Secure token-based auth
- **CORS**: Cross-origin resource sharing

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```javascript
{
  success: true,
  message: "Operation successful",
  data: { ... }
}
```

**Error Response:**
```javascript
{
  success: false,
  message: "Error description",
  error: "Detailed error (development only)"
}
```

## Deployment

### Heroku
1. Install Heroku CLI
2. Create Heroku app
3. Set environment variables
4. Deploy:
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

### Vercel
1. Install Vercel CLI
2. Deploy:
```bash
vercel --prod
```

### Docker
```bash
docker build -t krazy-girls-backend .
docker run -p 5000:5000 krazy-girls-backend
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team.
