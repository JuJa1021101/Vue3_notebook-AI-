const Router = require('koa-router');
const AuthController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate, registerSchema, loginSchema } = require('../utils/validation');

const router = new Router({
  prefix: '/api/auth'
});

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', validate(registerSchema), AuthController.register);

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', validate(loginSchema), AuthController.login);

/**
 * 刷新令牌
 * POST /api/auth/refresh
 */
router.post('/refresh', authenticate, AuthController.refresh);

/**
 * 用户登出
 * POST /api/auth/logout
 */
router.post('/logout', authenticate, AuthController.logout);

/**
 * 获取用户信息
 * GET /api/auth/profile
 */
router.get('/profile', authenticate, AuthController.profile);

/**
 * 更新用户信息
 * PUT /api/auth/profile
 */
router.put('/profile', authenticate, AuthController.updateProfile);

/**
 * 修改密码
 * PUT /api/auth/password
 */
router.put('/password', authenticate, AuthController.changePassword);

module.exports = router;