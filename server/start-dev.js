/**
 * 开发环境启动脚本
 * 包含数据库连接测试和基础数据初始化
 */

require('dotenv').config();
const { testConnection } = require('./src/config/database');

async function startDevelopment() {
  console.log('🚀 启动个人笔记API开发服务器...\n');

  try {
    // 1. 测试数据库连接
    console.log('🔌 测试数据库连接...');
    await testConnection();
    console.log('');

    // 2. 启动应用
    console.log('🌟 启动Koa应用...');
    require('./src/app');

    console.log('');
    console.log('📋 可用的API端点:');
    console.log('  POST /api/auth/register   - 用户注册');
    console.log('  POST /api/auth/login      - 用户登录');
    console.log('  POST /api/auth/refresh    - 刷新令牌');
    console.log('  POST /api/auth/logout     - 用户登出');
    console.log('  GET  /api/auth/profile    - 获取用户信息');
    console.log('  PUT  /api/auth/profile    - 更新用户信息');
    console.log('  PUT  /api/auth/password   - 修改密码');
    console.log('');
    console.log('🧪 运行测试: npm run test:auth');
    console.log('📖 查看日志: tail -f logs/combined.log');
    console.log('');

  } catch (error) {
    console.error('❌ 启动失败:', error.message);
    process.exit(1);
  }
}

startDevelopment();