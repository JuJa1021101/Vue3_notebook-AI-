/**
 * AI 路由
 */

const Router = require('koa-router');
const aiController = require('../../controllers/ai/aiController');

const router = new Router({
  prefix: '/api/ai'
});

// 认证中间件
const verifyToken = async (ctx, next) => {
  try {
    const token = ctx.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '未提供认证令牌'
      };
      return;
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    ctx.state.user = decoded;
    await next();
  } catch (error) {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: '认证失败'
    };
  }
};

// 所有 AI 路由都需要认证
router.use(verifyToken);

// AI 功能接口
router.post('/continue', aiController.continue);      // 智能续写
router.post('/format', aiController.format);          // 格式优化
router.post('/beautify', aiController.beautify);      // 排版美化
router.post('/polish', aiController.polish);          // 内容润色
router.post('/summarize', aiController.summarize);    // 生成摘要
router.post('/expand', aiController.expand);          // 内容扩写

// 设置接口
router.get('/settings', aiController.getSettings);    // 获取设置
router.put('/settings', aiController.updateSettings); // 更新设置

// 统计接口
router.get('/stats', aiController.getUsageStats);     // 获取使用统计

module.exports = router;
