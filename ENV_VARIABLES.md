# 📋 SmartDine Environment Variables

## 🗂️ Available Files

| File | Purpose | Usage |
|------|---------|-------|
| `.env` | **Current active configuration** | Used by the application now |
| `.env.example` | Complete template with all options | Reference for all available variables |
| `.env.dev` | Development configuration | Copy to `.env` for development |
| `.env.production` | Production configuration | Copy to `.env` for production |

## 🚀 Quick Setup

### For Development (Current Setup)
```bash
# Your current .env file is already configured for development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=SmartDine
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=super-secret-key-for-development-only
NEXTAUTH_URL=http://localhost:3000
ADMIN_EMAIL=admin@smartdine.com
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_HOSTED_URL=https://smartdine-demo.vercel.app
NODE_ENV=development
```

### For Production
```bash
# Use the setup script
./setup-env.sh

# Or manually copy and configure
cp .env.production .env
# Then edit .env with your production values
```

## 📝 Essential Variables

### 🔑 Required for Basic Functionality
```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000          # Your app URL
NEXT_PUBLIC_APP_NAME=SmartDine                     # Your restaurant name

# Database
DATABASE_URL="file:./dev.db"                       # SQLite database path

# Authentication
NEXTAUTH_SECRET=your-secret-key                    # JWT secret (min 32 chars)
NEXTAUTH_URL=http://localhost:3000                 # Must match APP_URL

# Admin Access
ADMIN_EMAIL=admin@smartdine.com                    # Admin login email
ADMIN_PASSWORD=admin123                            # Admin login password
```

### 🌐 QR Code Configuration
```env
# Hosted URL for QR codes (when using hosted mode)
NEXT_PUBLIC_HOSTED_URL=https://smartdine-demo.vercel.app
```

## 🔧 Optional Variables

### 💳 Payment Gateway
```env
# PhonePe
PHONEPE_MERCHANT_ID=your-merchant-id
PHONEPE_SALT_KEY=your-salt-key
PHONEPE_ENVIRONMENT=UAT                           # UAT or PRODUCTION

# Paytm
PAYTM_MERCHANT_ID=your-merchant-id
PAYTM_MERCHANT_KEY=your-merchant-key
PAYTM_WEBSITE=WEBSTAGING
PAYTM_INDUSTRY_TYPE=Retail
PAYTM_CHANNEL=WEB
```

### 📧 Email Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 🏪 Business Information
```env
RESTAURANT_NAME=Your Restaurant Name
RESTAURANT_ADDRESS=Your Address
RESTAURANT_PHONE=+1-234-567-8900
RESTAURANT_EMAIL=info@your-domain.com

# Currency
CURRENCY_SYMBOL=₹
CURRENCY_CODE=INR
```

### 🎯 Feature Flags
```env
ENABLE_ONLINE_PAYMENTS=false                      # Enable payment features
ENABLE_WHATSAPP_NOTIFICATIONS=false               # WhatsApp notifications
ENABLE_EMAIL_NOTIFICATIONS=false                  # Email notifications
ENABLE_ANALYTICS=false                            # Google Analytics
```

## 🛡️ Security Configuration

### Production Security
```env
# Strong secrets (use setup script to generate)
JWT_SECRET=your-very-long-secure-random-string
NEXTAUTH_SECRET=another-very-long-secure-random-string

# CORS settings
CORS_ORIGIN=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com

# WebSocket security
SOCKET_CORS_ORIGIN=https://your-domain.com
```

## 🔑 Secret Generation

### Using OpenSSL (Recommended)
```bash
# Generate 32-character secret
openssl rand -base64 32

# Generate 64-character secret (more secure)
openssl rand -base64 64
```

### Using Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Using Setup Script (Easiest)
```bash
./setup-env.sh
# Follow the prompts to generate secure secrets automatically
```

## 📊 Environment Comparison

| Variable | Development | Production |
|----------|-------------|------------|
| `NODE_ENV` | `development` | `production` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://your-domain.com` |
| `DATABASE_URL` | `file:./dev.db` | PostgreSQL URL |
| Secrets | Test values | Strong random values |
| Payments | Test mode | Live mode |
| Notifications | Disabled | Enabled |

## 🔄 Environment Switching

### Switch to Development
```bash
cp .env.dev .env
./setup-env.sh  # Choose option 1
```

### Switch to Production
```bash
cp .env.production .env
./setup-env.sh  # Choose option 2
# Then manually update production-specific values
```

## ⚠️ Important Notes

### Security
- **Never** commit `.env` files to version control
- **Always** use strong secrets in production
- **Always** use HTTPS in production
- **Regularly** rotate your secrets

### Database
- Development uses SQLite (`file:./dev.db`)
- Production should use PostgreSQL
- Database URL format: `postgresql://user:pass@host:port/db`

### Domains
- `NEXT_PUBLIC_APP_URL` must match `NEXTAUTH_URL`
- CORS origins must include your domain
- Socket.IO CORS must match your domain

## 🐛 Troubleshooting

### Common Issues
1. **"Invalid JWT secret"** → Ensure JWT_SECRET is at least 32 characters
2. **"Database connection failed"** → Check DATABASE_URL path and permissions
3. **"CORS error"** → Verify CORS_ORIGIN and ALLOWED_ORIGINS
4. **"WebSocket connection failed"** → Check SOCKET_CORS_ORIGIN

### Verification Commands
```bash
# Check current environment
cat .env | grep NODE_ENV

# Verify secrets are set
cat .env | grep SECRET

# Test database connection
npm run db:push
```

## 📞 Support

For environment-related issues:
1. Check this document first
2. Verify all required variables are set
3. Ensure syntax is correct (no quotes around quotes, etc.)
4. Test with development configuration first

---

**🔐 Remember**: In production, always use environment variable management services like Vercel Environment Variables, AWS Secrets Manager, or similar secure solutions.