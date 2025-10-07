const Router = require('koa-router');
const FileController = require('../controllers/fileController');
const { authenticate } = require('../middleware/auth');
const { upload, attachmentUpload } = require('../config/upload');

const router = new Router({
  prefix: '/api/files'
});

// 所有文件路由都需要身份验证
router.use(authenticate);

/**
 * 获取存储统计
 * GET /api/files/stats
 * 注意：这个路由必须在 /:id 路由之前定义
 */
router.get('/stats', FileController.getStorageStats);

/**
 * 代理获取文件内容（解决 CORS 问题）
 * GET /api/files/proxy/:id
 */
router.get('/proxy/:id', FileController.proxyFileContent);

/**
 * 上传单个图片
 * POST /api/files/upload
 */
router.post('/upload', upload.single('image'), FileController.uploadImage);

/**
 * 上传多个图片
 * POST /api/files/upload-multiple
 */
router.post('/upload-multiple', upload.array('images', 10), FileController.uploadMultipleImages);

/**
 * 上传单个附件（支持所有文件类型）
 * POST /api/files/upload-attachment
 */
router.post('/upload-attachment', async (ctx, next) => {
  try {
    await attachmentUpload.single('file')(ctx, next);
  } catch (err) {
    console.error('❌ Multer 中间件错误:', err.message);
    ctx.status = 400;
    ctx.body = {
      code: 400,
      success: false,
      message: err.message || '文件上传失败'
    };
  }
}, FileController.uploadAttachment);

/**
 * 批量上传附件
 * POST /api/files/upload-attachments
 */
router.post('/upload-attachments', attachmentUpload.array('files', 10), FileController.uploadMultipleAttachments);

/**
 * 批量删除文件
 * POST /api/files/delete-multiple
 */
router.post('/delete-multiple', FileController.deleteMultipleFiles);

/**
 * 批量更新文件的 note_id
 * POST /api/files/update-note-id
 */
router.post('/update-note-id', FileController.updateFilesNoteId);

/**
 * 获取用户的文件列表
 * GET /api/files
 */
router.get('/', FileController.getFiles);

/**
 * 获取文件详情
 * GET /api/files/:id
 */
router.get('/:id', FileController.getFileById);

/**
 * 转换图片格式
 * POST /api/files/:id/convert
 */
router.post('/:id/convert', FileController.convertImageFormat);

/**
 * 删除文件
 * DELETE /api/files/:id
 */
router.delete('/:id', FileController.deleteFile);

module.exports = router;
