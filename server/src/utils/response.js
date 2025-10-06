/**
 * 统一API响应格式工具
 */

// 成功响应
const success = (ctx, data = null, message = '操作成功', status = 200) => {
  ctx.status = status;
  ctx.body = {
    code: status,
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

// 错误响应
const error = (ctx, message = '操作失败', status = 400, errors = null) => {
  ctx.status = status;
  ctx.body = {
    code: status,
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  };
};

// 创建响应
const created = (ctx, data, message = '创建成功') => {
  success(ctx, data, message, 201);
};

// 未授权响应
const unauthorized = (ctx, message = '未授权访问') => {
  error(ctx, message, 401);
};

// 禁止访问响应
const forbidden = (ctx, message = '禁止访问') => {
  error(ctx, message, 403);
};

// 未找到响应
const notFound = (ctx, message = '资源未找到') => {
  error(ctx, message, 404);
};

// 冲突响应
const conflict = (ctx, message = '资源冲突') => {
  error(ctx, message, 409);
};

// 服务器错误响应
const serverError = (ctx, message = '服务器内部错误') => {
  error(ctx, message, 500);
};

// 验证错误响应
const validationError = (ctx, errors, message = '数据验证失败') => {
  error(ctx, message, 400, errors);
};

module.exports = {
  success,
  error,
  created,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
  validationError
};