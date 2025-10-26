#!/usr/bin/env node

const crypto = require('crypto');

console.log('🔐 SmartDine 生产环境密钥生成器');
console.log('=====================================\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('base64');
console.log('JWT_SECRET:');
console.log(jwtSecret);
console.log('');

// Generate NextAuth Secret
const nextauthSecret = crypto.randomBytes(64).toString('base64');
console.log('NEXTAUTH_SECRET:');
console.log(nextauthSecret);
console.log('');

// Generate Session Secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET:');
console.log(sessionSecret);
console.log('');

// Generate API Key (if needed)
const apiKey = crypto.randomBytes(32).toString('hex');
console.log('API_SECRET_KEY:');
console.log(apiKey);
console.log('');

console.log('📝 使用说明:');
console.log('1. 复制上述密钥到您的 .env.production 文件');
console.log('2. 确保不要将这些密钥提交到版本控制系统');
console.log('3. 在生产环境中使用强密码和HTTPS');
console.log('4. 定期轮换密钥以确保安全');
console.log('');

console.log('🚀 快速复制命令:');
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`NEXTAUTH_SECRET="${nextauthSecret}"`);
console.log(`SESSION_SECRET="${sessionSecret}"`);
console.log(`API_SECRET_KEY="${apiKey}"`);