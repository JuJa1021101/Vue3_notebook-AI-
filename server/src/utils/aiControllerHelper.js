/**
 * AI Controller 辅助函数
 * 提取公共方法，减少代码重复
 */

/**
 * 验证内容参数
 * @param {string} content - 内容
 * @param {number} minLength - 最小长度（可选）
 * @param {number} maxLength - 最大长度（默认10000）
 * @returns {Object|null} 错误对象或null
 */
function validateContent(content, minLength = 0, maxLength = 10000) {
  if (!content || typeof content !== 'string') {
    return {
      status: 400,
      body: {
        success: false,
        message: '内容不能为空'
      }
    };
  }

  if (minLength > 0 && content.length < minLength) {
    return {
      status: 400,
      body: {
        success: false,
        message: `内容太短，至少需要 ${minLength} 个字符`
      }
    };
  }

  if (content.length > maxLength) {
    return {
      status: 400,
      body: {
        success: false,
        message: `内容过长，请控制在 ${maxLength} 字以内`
      }
    };
  }

  return null;
}

/**
 * 处理AI请求（统一处理流式和非流式）
 * @param {Object} ctx - Koa上下文
 * @param {Object} aiService - AI服务实例
 * @param {string} action - 操作类型
 * @param {string} content - 内容
 * @param {Object} options - 选项
 */
async function handleAIRequest(ctx, aiService, action, content, options = {}) {
  try {
    const userId = ctx.state.user.id;

    if (options.streamEnabled) {
      await aiService.processAIStream(userId, action, content, options, ctx);
    } else {
      const result = await aiService[action](userId, content, options);
      ctx.body = result;
    }
  } catch (error) {
    throw error; // 让全局错误处理器处理
  }
}

/**
 * 处理错误响应
 * @param {Object} ctx - Koa上下文
 * @param {Error} error - 错误对象
 * @param {string} action - 操作名称
 */
function handleError(ctx, error, action) {
  console.error(`AIController.${action} error:`, error);
  ctx.status = 500;
  ctx.body = {
    success: false,
    message: '服务器错误'
  };
}

module.exports = {
  validateContent,
  handleAIRequest,
  handleError
};
