# 📧 Email Setup for Krazy Girls Welcome Emails

## 🎯 What This Does:
- **Sends beautiful welcome emails** to every new user when they signup
- **Only sends once** per user (tracked in database)
- **15% discount code** included in welcome email
- **Professional HTML design** with your branding

## 📋 Setup Instructions:

### 1. Configure Gmail for SMTP
1. **Open your Gmail account**
2. **Go to Settings** → **See all settings**
3. **Click "Forwarding and POP/IMAP"**
4. **Enable "IMAP access"**
5. **Save changes**

### 2. Enable 2-Factor Authentication
1. **Go to Google Account settings**
2. **Security tab** → **2-Step Verification**
3. **Enable 2FA** (if not already enabled)

### 3. Generate App Password
1. **Go to Google Account settings**
2. **Security tab** → **App passwords**
3. **Select "Mail"** and your device
4. **Generate password** (16-character code)
5. **Copy this password** - you'll need it for the .env file

### 4. Update Your .env File
Open `backend\.env` and update these lines:

```env
# Email Configuration - UPDATE THESE WITH YOUR GMAIL DETAILS
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Important:**
- Replace `your-actual-gmail@gmail.com` with your real Gmail address
- Replace `your-16-character-app-password` with the app password you generated
- **Do NOT use your regular Gmail password**

### 5. Restart the User Server
```bash
# Stop current server (Ctrl+C in terminal)
# Then restart:
node user-server.js
```

### 6. Test the Email System
Open your browser and go to:
```
http://localhost:5003/api/test-email?email=your-email@gmail.com&name=TestUser
```

## 🎉 What Users Will Receive:

### 📧 Welcome Email Includes:
- **Personalized greeting** with user's name
- **15% discount code**: `WELCOME15`
- **Feature highlights** (free shipping, easy returns, etc.)
- **Call-to-action** to start shopping
- **Beautiful HTML design** with your branding
- **Social links** and contact info

### 🔄 Email Tracking:
- **Database tracking** - `welcomeEmailSent` field prevents duplicate emails
- **Console logging** - See email status in server logs
- **Error handling** - Failed emails don't block user registration

## 🧪 Test the Complete Flow:

1. **Open your website** (`index.html`)
2. **Click "Sign Up"** tab
3. **Fill in registration form**
4. **Click "Create Account"**
5. **Check your email** - You should receive a beautiful welcome email!
6. **Check console** - Server logs show email status

## 📊 Email Content Preview:

The welcome email includes:
- 🎉 Personalized welcome message
- 🎁 15% discount banner
- 👗 Premium quality section
- 🚚 Free shipping information
- 💝 Easy returns policy
- 🛍️ "Start Shopping" button
- 📱 Next steps for new users
- 🔗 Social media links
- 📧 Footer with your branding

## 🚨 Troubleshooting:

### If emails don't send:
1. **Check Gmail settings** - Make sure IMAP is enabled
2. **Verify app password** - Use the 16-character app password, not regular password
3. **Check console logs** - Server will show email errors
4. **Test with test endpoint** - Use the `/api/test-email` endpoint

### Common Issues:
- **"Authentication failed"** - Wrong email/password in .env
- **"Connection refused"** - Gmail SMTP blocked (use app password)
- **"Email not received"** - Check spam folder

## 🎯 Success Indicators:
✅ Server shows: `📧 Email service: Configured`  
✅ Registration works without errors  
✅ Console shows: `✅ Welcome email sent successfully`  
✅ User receives beautiful HTML email  
✅ Database shows `welcomeEmailSent: true`  

---

**🎉 Once configured, every new user will receive a professional welcome email with a 15% discount!**
