/**
 * 统一的数据验证中间件
 * 使用 Joi 进行请求数据验证
 */

const logger = require('../utils/logger');

/**
 * 创建验证中间件
 * @param {Object} schema - Joi 验证模式
 * @param {string} source - 数据来源 ('body', 'query', 'params')
 * @returns {Function} Koa 中间件函数
 */
function validate(schema, source = 'body') {
  return async (ctx, next) => {
    try {
      // 获取要验证的数据
      const dataToValidate = ctx.request[source] || ctx[source];

      // 执行验证
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // 返回所有错误，而不是第一个
        stripUnknown: true // 移除未知字段
      });

      if (error) {
        // 格式化错误信息
        const errors = error.details.map(detail => detail.message);

        logger.warn('数据验证失败:', {
          source,
          errors,
          path: ctx.path
        });

        ctx.status = 400;
        ctx.body = {
          code: 400,
          success: false,
          message: '数据验证失败',
          errors
        };
        return;
      }

      // 验证通过，将清理后的数据赋值回去
      if (source === 'body') {
        ctx.request.body = value;
      } else {
        ctx[source] = value;
      }

      await next();
    } catch (err) {
      logger.error('验证中间件错误:', err);
      ctx.status = 500;
      ctx.body = {
        code: 500,
        success: false,
        message: '服务器错误'
      };
    }
  };
}

/**
 * 验证请求体
 */
function validateBody(schema) {
  return validate(schema, 'body');
}

/**
 * 验证查询参数
 */
function validateQuery(schema) {
  return validate(schema, 'query');
}

/**
 * 验证路径参数
 */
function validateParams(schema) {
  return validate(schema, 'params');
}

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams
};
