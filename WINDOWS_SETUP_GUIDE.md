# 🪟 SmartDine Windows Setup Guide

## 📋 Prerequisites Check

### Verify You Have:
1. ✅ **VS Code** installed
2. ✅ **PowerShell** (built into Windows)
3. ✅ **Node.js 18+** - Check by running `node --version`
4. ✅ **Extracted SmartDine folder**

### If Node.js is Missing:
1. Go to [https://nodejs.org](https://nodejs.org)
2. Download "LTS" version
3. Install with default settings
4. Restart VS Code

---

## 🚀 Complete Setup Steps

### Step 1: Open Project in VS Code
1. Open VS Code
2. **File → Open Folder**
3. Navigate to your extracted SmartDine folder
4. Click **"Select Folder"**

### Step 2: Open PowerShell Terminal
1. In VS Code, press **Ctrl + `** (backtick key)
   - Or go to **Terminal → New Terminal**
2. You should see PowerShell terminal at the bottom

### Step 3: Create Environment File
The `.env.local` file is now created in your project folder with all necessary settings.

**Verify the file exists:**
```powershell
ls .env.local
```

### Step 4: Install Dependencies
```powershell
npm install
```
*Wait for this to complete - may take 2-3 minutes*

### Step 5: Setup Database
```powershell
npm run db:push
```
*This creates the database file*

### Step 6: Start the Application
```powershell
npm run dev
```

### Step 7: Open in Browser
- You'll see a link like: `Local: http://localhost:3000`
- **Ctrl + Click** the link
- Or manually open browser and go to `http://localhost:3000`

---

## 🎯 What You Can Test

### Main Application (http://localhost:3000)
- Browse food menu
- Add items to cart
- Place orders
- View order status

### Admin Dashboard (http://localhost:3000/admin)
- **Email**: `admin@smartdine.com`
- **Password**: `admin123`
- Manage menu items
- Track orders
- Generate QR codes

---

## 📱 Test on Mobile Phone

### Step 1: Find Your Laptop's IP
```powershell
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.100`)

### Step 2: Access on Phone
1. Connect phone to same WiFi as laptop
2. Open phone browser
3. Go to: `http://YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000`

---

## 🔧 Environment File Explained

Your `.env.local` file contains:

### 🔐 Required Settings (Already Configured)
- **DATABASE_URL** - SQLite database location
- **NEXTAUTH_SECRET** - Security key for login
- **NEXTAUTH_URL** - Your application URL

### ⚙️ Application Settings
- **NODE_ENV** - Development mode
- **PORT** - Server port (3000)
- **QR_BASE_URL** - Base URL for QR codes

### 💳 Payment Settings (Optional - For Future)
- PhonePe and Paytm credentials
- Add these when ready to accept payments

### 📧 Email Settings (Optional)
- SMTP settings for order notifications

---

## 🛠️ Common Windows Issues & Solutions

### Issue 1: "npm command not found"
**Solution:**
1. Restart VS Code
2. Restart your computer
3. Verify Node.js installation: `node --version`

### Issue 2: Port 3000 Already in Use
**Solution:**
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the number you see)
taskkill /PID <PID> /F

# Or use different port
npm run dev -- -p 3001
```

### Issue 3: Permission Errors
**Solution:**
1. Close VS Code
2. Right-click VS Code → "Run as Administrator"
3. Open project folder again

### Issue 4: npm install Fails
**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

### Issue 5: Database Errors
**Solution:**
```powershell
# Reset database
npm run db:push --force-reset
```

---

## 📊 Quick Verification Checklist

### After Setup, Verify:
- [ ] Terminal shows "Ready on http://localhost:3000"
- [ ] Browser opens SmartDine menu
- [ ] Can add food items to cart
- [ ] Admin dashboard loads at http://localhost:3000/admin
- [ ] Can login with admin@smartdine.com / admin123
- [ ] Mobile access works on same WiFi
- [ ] QR code generation works in admin panel

---

## 🎮 Useful VS Code Shortcuts for Windows

- **Ctrl + `** - Open/close terminal
- **Ctrl + Shift + P** - Command palette
- **Ctrl + P** - Quick file search
- **Ctrl + Shift + E** - File explorer
- **F5** - Start debugging
- **Ctrl + ,** - Settings
- **Ctrl + Shift + X** - Extensions

---

## 🔄 Daily Development Workflow

### Start Working:
```powershell
# 1. Open VS Code
# 2. Open terminal (Ctrl + `)
# 3. Start server
npm run dev
```

### Stop Working:
- Press **Ctrl + C** in terminal
- Close VS Code

### Check Code Quality:
```powershell
npm run lint
```

---

## 🆘 Emergency Troubleshooting

### If Nothing Works:
1. **Close everything** - VS Code, browser terminals
2. **Restart computer**
3. **Follow steps from beginning**
4. **Check terminal for specific error messages**

### Get Help:
- Look at terminal output - errors usually tell you exactly what's wrong
- Check if Node.js is working: `node --version`
- Verify you're in the correct folder: `ls`

---

## 🎉 Success! 

You should now have:
- ✅ SmartDine running on your laptop
- ✅ Admin dashboard accessible
- ✅ Mobile testing capability
- ✅ Full development environment

**Enjoy your SmartDine restaurant application! 🍽️✨**

---

### 📞 Quick Reference

| URL | Purpose |
|-----|---------|
| http://localhost:3000 | Customer Menu |
| http://localhost:3000/admin | Admin Dashboard |
| http://YOUR_IP:3000 | Mobile Access |

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start server |
| `npm run lint` | Check code |
| `npm run db:studio` | View database |
| `npm run db:push` | Setup database |