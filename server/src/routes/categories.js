const Router = require('koa-router');
const CategoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { validate, createCategorySchema, updateCategorySchema } = require('../utils/validation');

const router = new Router({
  prefix: '/api/categories'
});

/**
 * 获取分类统计信息
 * GET /api/categories/stats
 * 注意：这个路由必须在 /:id 路由之前定义，避免 "stats" 被当作 ID 处理
 */
router.get('/stats', authenticate, CategoryController.getCategoryStats);

/**
 * 获取用户的所有分类
 * GET /api/categories
 */
router.get('/', authenticate, CategoryController.getCategories);

/**
 * 根据ID获取分类详情
 * GET /api/categories/:id
 */
router.get('/:id', authenticate, CategoryController.getCategoryById);

/**
 * 创建新分类
 * POST /api/categories
 */
router.post('/', authenticate, validate(createCategorySchema), CategoryController.createCategory);

/**
 * 更新分类
 * PUT /api/categories/:id
 */
router.put('/:id', authenticate, validate(updateCategorySchema), CategoryController.updateCategory);

/**
 * 删除分类
 * DELETE /api/categories/:id
 */
router.delete('/:id', authenticate, CategoryController.deleteCategory);

module.exports = router;