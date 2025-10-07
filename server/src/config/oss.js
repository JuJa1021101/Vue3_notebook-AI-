const OSS = require('ali-oss');
require('dotenv').config();

/**
 * 阿里云 OSS 配置
 */
const ossConfig = {
  region: process.env.OSS_REGION || 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET || 'vue3-koa2-notebook',
  endpoint: process.env.OSS_ENDPOINT || 'oss-cn-hangzhou.aliyuncs.com'
};

/**
 * 创建 OSS 客户端实例
 */
function createOSSClient() {
  if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret) {
    throw new Error('OSS 配置信息不完整，请检查环境变量');
  }

  return new OSS(ossConfig);
}

/**
 * 获取存储模式
 */
function getStorageMode() {
  return process.env.STORAGE_MODE || 'local';
}

/**
 * 生成 OSS 文件路径
 * @param {number} userId - 用户ID
 * @param {string} filename - 文件名
 * @param {string} type - 文件类型 (images/documents/videos/others)
 */
function generateOSSPath(userId, filename, type = 'images') {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `users/${userId}/${type}/${year}/${month}/${filename}`;
}

/**
 * 获取文件类型分类
 */
function getFileType(mimetype) {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.startsWith('video/')) return 'videos';
  if (mimetype.startsWith('audio/')) return 'audios';
  if (mimetype.includes('pdf') || mimetype.includes('document') ||
    mimetype.includes('word') || mimetype.includes('excel') ||
    mimetype.includes('powerpoint') || mimetype.includes('text')) {
    return 'documents';
  }
  return 'others';
}

module.exports = {
  ossConfig,
  createOSSClient,
  getStorageMode,
  generateOSSPath,
  getFileType
};
