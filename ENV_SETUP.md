# 环境变量配置指南

## 📋 概述

SmartDine项目使用环境变量来管理配置。请根据您的环境选择合适的配置文件。

## 🗂️ 环境文件说明

### 1. `.env.example` - 模板文件
包含所有可配置的环境变量及其说明。用作参考。

### 2. `.env.dev` - 开发环境
适用于本地开发，包含测试配置。

### 3. `.env.production` - 生产环境
适用于生产部署，包含安全配置。

## 🚀 快速开始

### 开发环境设置

1. **复制开发环境配置：**
```bash
cp .env.dev .env
```

2. **修改必要的配置：**
   - `JWT_SECRET`: 生成一个安全的随机字符串
   - `NEXTAUTH_SECRET`: 生成另一个安全的随机字符串

3. **生成安全密钥：**
```bash
# 生成JWT密钥
openssl rand -base64 32

# 或使用Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 生产环境设置

1. **复制生产环境配置：**
```bash
cp .env.production .env
```

2. **必须修改的配置：**
   - `JWT_SECRET`: 生成强随机字符串
   - `NEXTAUTH_SECRET`: 生成另一个强随机字符串
   - `NEXTAUTH_URL`: 设置为您的域名
   - `SOCKET_CORS_ORIGIN`: 设置为您的域名
   - 支付网关配置（PhonePe/Paytm）

## 🔧 配置项详解

### 数据库配置
```env
DATABASE_URL="file:./dev.db"  # SQLite数据库文件路径
```

### JWT认证
```env
JWT_SECRET="your-secure-random-string"  # 用于JWT令牌签名
```

### Next.js认证
```env
NEXTAUTH_URL="http://localhost:3000"     # 应用URL
NEXTAUTH_SECRET="another-secure-string"  # NextAuth密钥
```

### 支付网关配置

#### PhonePe
```env
PHONEPE_MERCHANT_ID="your-merchant-id"
PHONEPE_SALT_KEY="your-salt-key"
PHONEPE_ENVIRONMENT="UAT"  # UAT(测试) 或 PRODUCTION(生产)
```

#### Paytm
```env
PAYTM_MERCHANT_ID="your-merchant-id"
PAYTM_MERCHANT_KEY="your-merchant-key"
PAYTM_WEBSITE="your-website"
PAYTM_INDUSTRY_TYPE="Retail"
PAYTM_CHANNEL="WEB"
```

### WebSocket配置
```env
SOCKET_CORS_ORIGIN="http://localhost:3000"  # 允许的跨域来源
```

## 🛡️ 安全注意事项

### 生产环境必须修改：
1. **JWT_SECRET**: 使用至少32字符的随机字符串
2. **NEXTAUTH_SECRET**: 使用至少32字符的随机字符串
3. **支付密钥**: 使用生产环境的真实密钥
4. **数据库**: 考虑使用PostgreSQL替代SQLite
5. **HTTPS**: 确保使用HTTPS协议

### 密钥生成命令：
```bash
# 生成强随机密钥
openssl rand -base64 64

# 或使用在线工具生成
# 访问：https://randomkeygen.com/
```

## 📧 邮件配置

### 开发环境（使用Mailtrap）：
```env
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-mailtrap-user"
SMTP_PASS="your-mailtrap-pass"
```

### 生产环境：
```env
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT="587"
SMTP_USER="your-email@your-domain.com"
SMTP_PASS="your-email-password"
```

## 🔄 环境切换

### 从开发切换到生产：
```bash
# 备份当前配置
cp .env .env.backup

# 使用生产配置
cp .env.production .env

# 编辑生产配置
nano .env
```

### 从生产切换到开发：
```bash
# 备份当前配置
cp .env .env.prod.backup

# 使用开发配置
cp .env.dev .env
```

## 🐛 故障排除

### 常见问题：

1. **数据库连接错误**
   - 检查 `DATABASE_URL` 路径是否正确
   - 确保数据库文件有写入权限

2. **JWT认证失败**
   - 确保 `JWT_SECRET` 已设置
   - 检查密钥长度是否足够（至少32字符）

3. **WebSocket连接失败**
   - 检查 `SOCKET_CORS_ORIGIN` 是否正确
   - 确保端口和协议匹配

4. **支付失败**
   - 检查支付网关配置
   - 确认测试/生产环境设置正确

## 📞 支持

如果遇到配置问题，请检查：
1. 环境变量语法是否正确
2. 密钥和URL是否有效
3. 文件权限是否正确
4. 网络连接是否正常

---

**⚠️ 重要提醒：**
- 永远不要将包含真实密钥的 `.env` 文件提交到版本控制系统
- 生产环境的密钥应该使用环境变量管理服务（如AWS Secrets Manager、Vercel Environment Variables等）
- 定期轮换密钥以确保安全