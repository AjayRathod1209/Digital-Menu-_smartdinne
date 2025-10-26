# 🚀 Run SmartDine on Your Laptop

## 📋 Prerequisites

### Required Software
1. **Node.js** (version 18 or higher)
   - Download from [https://nodejs.org](https://nodejs.org)
   - Verify installation: `node --version` (should show v18+)

2. **Git** (for cloning/downloading)
   - Download from [https://git-scm.com](https://git-scm.com)
   - Verify installation: `git --version`

3. **Code Editor** (recommended: VS Code)
   - Download from [https://code.visualstudio.com](https://code.visualstudio.com)

## 🛠️ Setup Steps

### Step 1: Get the Project Code

**Option A: If you have the project folder**
- Make sure you have the complete project folder on your laptop

**Option B: If downloading from Git**
```bash
git clone <your-repository-url>
cd smartdine
```

### Step 2: Install Dependencies
```bash
# Open terminal/command prompt in the project folder
npm install
```

### Step 3: Environment Setup
```bash
# Copy environment file (if not exists)
cp .env.local .env.local.backup

# The .env.local file is already configured for development
# No changes needed for basic functionality
```

### Step 4: Database Setup
```bash
# Initialize the database
npm run db:push

# (Optional) View database in browser
npm run db:studio
```

### Step 5: Start the Development Server
```bash
npm run dev
```

### Step 6: Access the Application
- Open your browser
- Go to: **http://localhost:3000**
- The SmartDine application should be running!

## 🎯 What You'll See

### Main Application (http://localhost:3000)
- Digital menu interface
- QR code scanning simulation
- Customer ordering system

### Admin Dashboard (http://localhost:3000/admin)
- Login credentials: 
  - Email: `admin@smartdine.com`
  - Password: `admin123`
- Menu management
- Order tracking
- Analytics dashboard

## 📱 Testing the Application

### 1. Test Customer Flow
1. Visit http://localhost:3000
2. Browse menu categories
3. Add items to cart
4. Place an order
5. Check order status

### 2. Test Admin Dashboard
1. Visit http://localhost:3000/admin
2. Login with admin credentials
3. View dashboard statistics
4. Manage menu items
5. Update order statuses

### 3. Test QR Code Feature
1. In admin panel, go to "QR Generator"
2. Generate QR codes for tables
3. Scan QR code with phone camera
4. Should redirect to menu for that table

## 🔧 Common Commands

```bash
# Start development server
npm run dev

# Stop server (Ctrl+C in terminal)

# Restart server
npm run dev

# Check code quality
npm run lint

# Fix code issues
npm run lint -- --fix

# View database
npm run db:studio

# Reset database (if needed)
npm run db:push --force-reset
```

## 🌐 Access from Other Devices

### On Same WiFi Network
1. Find your computer's IP address:
   - **Windows**: Open Command Prompt, type `ipconfig`
   - **Mac/Linux**: Open Terminal, type `ifconfig` or `ip addr`
2. Use IP address in browser on phone/tablet:
   - `http://YOUR_IP_ADDRESS:3000`

### Example
If your IP is `192.168.1.100`: `http://192.168.1.100:3000`

## 📱 Mobile Testing

### Test on Phone
1. Connect phone to same WiFi as laptop
2. Open browser on phone
3. Go to `http://YOUR_LAPTOP_IP:3000`
4. Test mobile interface and ordering

### Test QR Code Scanning
1. Generate QR code in admin panel
2. Use phone camera to scan
3. Should open mobile menu interface

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### 1. Port 3000 Already in Use
```bash
# Find process using port 3000
netstat -ano | findstr :3000  # Windows
lsof -ti:3000                 # Mac/Linux

# Kill the process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # Mac/Linux

# Or use different port
npm run dev -- -p 3001
```

#### 2. Node.js Version Issues
```bash
# Check Node.js version
node --version

# If version < 18, update Node.js from nodejs.org
```

#### 3. Database Issues
```bash
# Reset database
npm run db:push --force-reset

# Check database file permissions
ls -la dev.db
```

#### 4. Permission Issues (Mac/Linux)
```bash
# Fix npm permissions
sudo chown -R $(whoami) node_modules
```

#### 5. Network Access Issues
```bash
# Allow external connections
npm run dev -- --hostname 0.0.0.0
```

## 🔒 Security Notes

### Development Environment
- Default credentials are for testing only
- Database is local (SQLite)
- No real payment processing

### For Production
- Change all default passwords
- Use environment-specific secrets
- Enable HTTPS
- Use production database

## 📊 Performance Tips

### For Better Performance
1. **Close unused browser tabs**
2. **Use Chrome/Brave/Firefox** (latest versions)
3. **Ensure sufficient RAM** (8GB+ recommended)
4. **Close other heavy applications**

### Database Optimization
```bash
# Clear old test data
npm run db:studio
# Manually delete old orders in the database interface
```

## 🎉 Success Checklist

- [ ] Node.js 18+ installed
- [ ] Project dependencies installed (`npm install`)
- [ ] Database initialized (`npm run db:push`)
- [ ] Development server running (`npm run dev`)
- [ ] Application accessible at http://localhost:3000
- [ ] Admin dashboard accessible at http://localhost:3000/admin
- [ ] Mobile testing works on same WiFi
- [ ] QR code generation and scanning works

## 🆘 Getting Help

### If Something Goes Wrong
1. **Check terminal output** for error messages
2. **Verify Node.js version**: `node --version`
3. **Clear npm cache**: `npm cache clean --force`
4. **Reinstall dependencies**: `rm -rf node_modules && npm install`
5. **Restart computer** (last resort)

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm run dev
```

---

## 🎯 Quick Start Summary

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npm run db:push

# 3. Start server
npm run dev

# 4. Open browser
# Go to http://localhost:3000
```

That's it! Your SmartDine application should now be running on your laptop. 🍽️✨