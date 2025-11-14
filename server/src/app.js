const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const serve = require('koa-static');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { testConnection } = require('./config/database');
const { ensureUploadDir } = require('./config/upload');

// 导入路由
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const noteRoutes = require('./routes/notes');
const fileRoutes = require('./routes/files');
const aiRoutes = require('./routes/ai/aiRoutes');

const app = new Koa();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());

app.use(bodyParser({
  enableTypes: ['json', 'form'],
  jsonLimit: '50mb',
  formLimit: '50mb',
  textLimit: '50mb'
}));

// 静态文件服务
app.use(serve(path.join(__dirname, '../uploads')));

// 基础路由 - 必须在其他路由之前
app.use(async (ctx, next) => {
  logger.debug(`收到请求: ${ctx.method} ${ctx.path}`);

  if (ctx.path === '/') {
    logger.debug('匹配根路径，返回API信息');
    ctx.status = 200;
    ctx.body = {
      code: 200,
      success: true,
      message: 'Personal Notes API Server',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          refresh: 'POST /api/auth/refresh',
          logout: 'POST /api/auth/logout',
          profile: 'GET /api/auth/profile',
          updateProfile: 'PUT /api/auth/profile',
          changePassword: 'PUT /api/auth/password'
        },
        categories: {
          list: 'GET /api/categories',
          create: 'POST /api/categories',
          detail: 'GET /api/categories/:id',
          update: 'PUT /api/categories/:id',
          delete: 'DELETE /api/categories/:id',
          stats: 'GET /api/categories/stats'
        },
        notes: {
          list: 'GET /api/notes',
          create: 'POST /api/notes',
          detail: 'GET /api/notes/:id',
          update: 'PUT /api/notes/:id',
          delete: 'DELETE /api/notes/:id'
        },
        search: {
          notes: 'GET /api/search'
        },
        tags: {
          popular: 'GET /api/tags/popular'
        },
        files: {
          upload: 'POST /api/files/upload',
          uploadMultiple: 'POST /api/files/upload-multiple',
          list: 'GET /api/files',
          detail: 'GET /api/files/:id',
          delete: 'DELETE /api/files/:id',
          deleteMultiple: 'POST /api/files/delete-multiple',
          stats: 'GET /api/files/stats',
          convert: 'POST /api/files/:id/convert'
        },
        ai: {
          continue: 'POST /api/ai/continue',
          format: 'POST /api/ai/format',
          beautify: 'POST /api/ai/beautify',
          polish: 'POST /api/ai/polish',
          summarize: 'POST /api/ai/summarize',
          expand: 'POST /api/ai/expand',
          settings: 'GET /api/ai/settings',
          updateSettings: 'PUT /api/ai/settings',
          stats: 'GET /api/ai/stats'
        }
      }
    };
    return; // 直接返回，不继续执行
  } else {
    await next();
  }
});

// 注册路由
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

app.use(categoryRoutes.routes());
app.use(categoryRoutes.allowedMethods());

app.use(noteRoutes.routes());
app.use(noteRoutes.allowedMethods());

app.use(fileRoutes.routes());
app.use(fileRoutes.allowedMethods());

// 注册 AI 路由
app.use(aiRoutes.routes());
app.use(aiRoutes.allowedMethods());

// 404处理
app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = {
    code: 404,
    success: false,
    message: 'API endpoint not found'
  };
});

// 全局错误处理（必须放在最后）
app.use(errorHandler);

app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);

  // 确保上传目录存在
  ensureUploadDir();
  logger.info('Upload directories initialized');

  // 测试数据库连接
  await testConnection();

  // 测试 AI 服务连接
  try {
    const QwenService = require('./services/ai/qwenService');
    const qwenService = new QwenService();
    const isConnected = await qwenService.testConnection();
    if (isConnected) {
      logger.info('AI Service (Qwen) connected successfully');
    } else {
      logger.warn('AI Service connection failed');
    }
  } catch (error) {
    logger.error('AI Service initialization error:', error.message);
  }
});

module.exports = app;