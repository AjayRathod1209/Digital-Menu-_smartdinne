# 🚀 SmartDine 生产环境部署指南

## 📋 部署前检查清单

### 🔐 安全配置
- [ ] 生成强随机JWT_SECRET
- [ ] 生成强随机NEXTAUTH_SECRET
- [ ] 配置生产数据库
- [ ] 设置支付网关凭据
- [ ] 配置邮件服务
- [ ] 启用HTTPS
- [ ] 配置CORS策略

### 🗄️ 数据库配置
- [ ] 选择生产数据库（推荐PostgreSQL）
- [ ] 配置数据库连接池
- [ ] 设置备份策略
- [ ] 迁移生产数据

### 🌐 域名与SSL
- [ ] 购买域名
- [ ] 配置DNS记录
- [ ] 获取SSL证书
- [ ] 配置CDN（可选）

## 🛠️ 生产环境配置步骤

### 1. 生成安全密钥

```bash
# 生成JWT密钥
JWT_SECRET=$(openssl rand -base64 64)
echo "JWT_SECRET: $JWT_SECRET"

# 生成NextAuth密钥
NEXTAUTH_SECRET=$(openssl rand -base64 64)
echo "NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
```

### 2. 数据库设置

#### 选项A: PostgreSQL（推荐）
```bash
# 使用Supabase（免费）
# 1. 访问 https://supabase.com
# 2. 创建新项目
# 3. 获取连接字符串
# 4. 更新DATABASE_URL

DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

#### 选项B: Railway
```bash
# 使用Railway
# 1. 访问 https://railway.app
# 2. 创建PostgreSQL服务
# 3. 获取连接字符串

DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOSTNAME].railway.app:5432/railway"
```

#### 选项C: 自托管PostgreSQL
```bash
# 在服务器上安装PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# 创建数据库
sudo -u postgres createdb smartdine_prod

# 创建用户
sudo -u postgres createuser --interactive

# 配置DATABASE_URL
DATABASE_URL="postgresql://[USERNAME]:[PASSWORD]@localhost:5432/smartdine_prod"
```

### 3. 支付网关配置

#### PhonePe生产环境
```bash
# 1. 访问 https://developer.phonepe.com
# 2. 创建生产应用
# 3. 获取凭据

PHONEPE_MERCHANT_ID="YOUR-PRODUCTION-MERCHANT-ID"
PHONEPE_SALT_KEY="YOUR-PRODUCTION-SALT-KEY"
PHONEPE_ENVIRONMENT="PRODUCTION"
```

#### Paytm生产环境
```bash
# 1. 访问 https://paytm.com/business
# 2. 创建生产账户
# 3. 获取API密钥

PAYTM_MERCHANT_ID="YOUR-PRODUCTION-MERCHANT-ID"
PAYTM_MERCHANT_KEY="YOUR-PRODUCTION-MERCHANT-KEY"
PAYTM_WEBSITE="YOUR-WEBSITE-NAME"
```

### 4. 邮件服务配置

#### SendGrid（推荐）
```bash
# 1. 注册SendGrid账户
# 2. 创建API密钥
# 3. 配置SMTP

SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="YOUR-SENDGRID-API-KEY"
EMAIL_FROM="noreply@your-domain.com"
```

#### AWS SES
```bash
# 1. 设置AWS SES
# 2. 验证域名
# 3. 获取SMTP凭据

SMTP_HOST="email-smtp.us-east-1.amazonaws.com"
SMTP_PORT="587"
SMTP_USER="YOUR-SES-SMTP-USERNAME"
SMTP_PASS="YOUR-SES-SMTP-PASSWORD"
```

### 5. 部署配置

#### Vercel部署
```bash
# 1. 安装Vercel CLI
npm i -g vercel

# 2. 登录Vercel
vercel login

# 3. 部署项目
vercel --prod

# 4. 设置环境变量
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
# ... 添加其他环境变量
```

#### Railway部署
```bash
# 1. 安装Railway CLI
npm install -g @railway/cli

# 2. 登录Railway
railway login

# 3. 创建项目
railway new

# 4. 设置环境变量
railway variables set JWT_SECRET="your-secret"
railway variables set NEXTAUTH_SECRET="your-secret"
# ... 设置其他变量

# 5. 部署
railway up
```

#### 自托管部署
```bash
# 1. 构建项目
npm run build

# 2. 安装PM2
npm install -g pm2

# 3. 创建PM2配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'smartdine',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 4. 启动应用
pm2 start ecosystem.config.js

# 5. 设置开机自启
pm2 startup
pm2 save
```

## 🔧 生产环境优化

### 1. 性能优化
```bash
# 启用gzip压缩
npm install compression

# 配置缓存
npm install node-cache

# 优化图片
npm install sharp
```

### 2. 监控设置
```bash
# 安装监控工具
npm install @sentry/nextjs

# 配置Sentry
echo 'SENTRY_DSN="YOUR-SENTRY-DSN"' >> .env.production
```

### 3. 备份策略
```bash
# 创建备份脚本
cat > backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
pg_dump smartdine_prod > backup_\$DATE.sql
# 上传到云存储（可选）
aws s3 cp backup_\$DATE.sql s3://your-backup-bucket/
EOF

chmod +x backup.sh

# 设置定时备份
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## 🚨 安全检查

### 1. 环境变量安全
```bash
# 确保敏感信息不在代码中
grep -r "password\|secret\|key" src/ --exclude-dir=node_modules

# 检查.env文件权限
chmod 600 .env.production
```

### 2. HTTPS配置
```bash
# 使用Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### 3. 防火墙配置
```bash
# 配置UFW防火墙
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 📊 监控与日志

### 1. 应用监控
```bash
# PM2监控
pm2 monit

# 查看日志
pm2 logs smartdine
```

### 2. 数据库监控
```bash
# PostgreSQL监控
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"

# 检查数据库大小
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('smartdine_prod'));"
```

## 🔄 部署后测试

### 1. 功能测试
- [ ] 用户注册/登录
- [ ] 菜单浏览
- [ ] 购物车功能
- [ ] 订单创建
- [ ] 支付流程
- [ ] 管理面板
- [ ] 实时更新

### 2. 性能测试
```bash
# 使用Apache Bench进行压力测试
ab -n 1000 -c 10 https://your-domain.com/

# 使用Lighthouse进行性能审计
npx lighthouse https://your-domain.com/ --view
```

### 3. 安全测试
```bash
# SSL测试
npx ssl-checker https://your-domain.com

# 安全头检查
curl -I https://your-domain.com/
```

## 🆘 故障排除

### 常见问题
1. **数据库连接失败** - 检查DATABASE_URL和权限
2. **支付失败** - 验证支付网关配置
3. **WebSocket连接问题** - 检查CORS设置
4. **静态文件404** - 检查构建输出和CDN配置

### 日志位置
- 应用日志: `pm2 logs smartdine`
- 错误日志: `/var/log/nginx/error.log`
- 访问日志: `/var/log/nginx/access.log`

---

**🎯 部署完成后，您的SmartDine应用将在生产环境中运行！**

**📞 如需帮助，请查看日志或联系技术支持。**