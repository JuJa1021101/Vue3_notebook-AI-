const Router = require('koa-router');
const noteController = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');

const router = new Router({
  prefix: '/api'
});

// 所有笔记相关路由都需要身份验证
router.use(authenticate);

// 笔记相关路由
router.get('/notes/stats', noteController.getUserStats);          // 获取用户统计数据
router.get('/notes', noteController.getNotes);                    // 获取笔记列表
router.post('/notes', noteController.createNote);                 // 创建笔记
router.get('/notes/:id', noteController.getNoteById);             // 获取笔记详情
router.put('/notes/:id', noteController.updateNote);              // 更新笔记
router.delete('/notes/:id', noteController.deleteNote);           // 删除笔记

// 搜索相关路由
router.get('/search', noteController.searchNotes);                // 搜索笔记

// 标签相关路由
router.get('/tags/popular', noteController.getPopularTags);       // 获取热门标签
router.get('/tags', noteController.getAllTags);                   // 获取所有标签

module.exports = router;