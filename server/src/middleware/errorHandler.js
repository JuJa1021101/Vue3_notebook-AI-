const logger = require('../utils/logger');

const errorHandler = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    // 特殊处理 Multer 错误
    if (err.name === 'MulterError' || err.message?.includes('不支持的文件类型')) {
      console.error('❌ Multer 错误:', err.message);
      ctx.status = 400;
      ctx.body = {
        code: 400,
        success: false,
        message: err.message || '文件上传失败'
      };
      return;
    }

    // 记录错误日志
    logger.error('API Error:', {
      error: err.message,
      stack: err.stack,
      url: ctx.url,
      method: ctx.method,
      ip: ctx.ip,
      userAgent: ctx.headers['user-agent']
    });

    // 设置响应状态和内容
    ctx.status = err.status || err.statusCode || 500;

    // 开发环境返回详细错误信息
    if (process.env.NODE_ENV === 'development') {
      ctx.body = {
        code: ctx.status,
        success: false,
        message: err.message,
        stack: err.stack
      };
    } else {
      // 生产环境返回通用错误信息
      ctx.body = {
        code: ctx.status,
        success: false,
        message: ctx.status === 500 ? 'Internal Server Error' : err.message
      };
    }

    // 触发应用级错误事件
    ctx.app.emit('error', err, ctx);
  }
};

module.exports = errorHandler;