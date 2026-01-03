# 🚀 Krazy Girls Vercel Deployment Guide

## 📋 Prerequisites
- GitHub account
- Vercel account
- MongoDB Atlas database
- Gmail account for emails

## 🗂️ Project Structure
```
K-Z setup/
├── index.html
├── css/
├── js/
├── images/
├── backend/
│   ├── models/
│   └── api-client.js
├── api/
│   ├── signup.js
│   └── login.js
├── vercel.json
├── package.json
└── .env
```

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/krazy-girls.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub
4. Select your repository
5. Configure environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret key
   - `EMAIL_HOST`: `smtp.gmail.com`
   - `EMAIL_PORT`: `587`
   - `EMAIL_USER`: Your Gmail address
   - `EMAIL_PASS`: Your Gmail app password
   - `JWT_EXPIRE`: `30d`

### 3. Update API Client
After deployment, update `backend/api-client.js`:
```javascript
if (this.isProduction) {
  this.baseURL = 'https://your-vercel-app.vercel.app/api';
  this.userBaseURL = 'https://your-vercel-app.vercel.app/api';
}
```

## 🔧 Environment Variables Setup

### MongoDB Atlas
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create new cluster
3. Get connection string
4. Add your IP to whitelist

### Gmail App Password
1. Enable 2-factor authentication
2. Go to Google Account settings
3. Generate app password
4. Use app password in environment variables

## 📧 Email Configuration
- Host: smtp.gmail.com
- Port: 587
- Use TLS: true
- Email: your-gmail@gmail.com
- Password: your-app-password

## 🎯 Post-Deployment Checklist
- [ ] Test user registration
- [ ] Test user login
- [ ] Test email sending
- [ ] Test product display
- [ ] Test shopping cart
- [ ] Test checkout process

## 🐛 Common Issues & Solutions

### CORS Issues
Add CORS headers to your API functions:
```javascript
res.setHeader('Access-Control-Allow-Origin', '*');
```

### Environment Variables
Make sure all environment variables are set in Vercel dashboard.

### Database Connection
Verify MongoDB connection string is correct and IP is whitelisted.

### Email Issues
Use Gmail app password, not regular password.

## 🎉 Success!
Your Krazy Girls website is now live on Vercel!
