const path = require('path');
const multer = require('koa-multer');
const fs = require('fs');
const logger = require('../utils/logger');

// 上传配置
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024; // 50MB（支持更大的文件）
const ALLOWED_IMAGE_TYPES = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(',');

// 支持的文件类型
const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  video: ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac', 'audio/aac', 'audio/ogg'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/markdown',
    'text/x-markdown',
    'application/markdown',
    'text/csv'
  ],
  archive: ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed']
};

// 获取所有允许的文件类型
const getAllAllowedTypes = () => {
  return Object.values(ALLOWED_FILE_TYPES).flat();
};

// 确保上传目录存在
const ensureUploadDir = () => {
  const dirs = [
    UPLOAD_PATH,
    path.join(UPLOAD_PATH, 'images'),
    path.join(UPLOAD_PATH, 'videos'),
    path.join(UPLOAD_PATH, 'audios'),
    path.join(UPLOAD_PATH, 'documents'),
    path.join(UPLOAD_PATH, 'others'),
    path.join(UPLOAD_PATH, 'temp')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// 生成唯一文件名
const generateFilename = (originalname) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalname);
  return `${timestamp}-${random}${ext}`;
};

// 根据 MIME 类型获取文件类型分类
const getFileTypeCategory = (mimetype) => {
  for (const [category, types] of Object.entries(ALLOWED_FILE_TYPES)) {
    if (types.includes(mimetype)) {
      return category;
    }
  }
  return 'other';
};

// 配置 multer 存储（仅用于图片上传）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(UPLOAD_PATH, 'images');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  }
});

// 配置 multer 存储（用于附件上传，支持所有类型）
const attachmentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    // 优先使用 MIME 类型判断，如果失败则使用扩展名判断
    let fileType = getFileTypeCategory(file.mimetype);

    // 如果 MIME 类型无法识别（如 application/octet-stream），使用扩展名判断
    if (fileType === 'other') {
      fileType = getFileTypeCategoryByExtension(file.originalname) || 'other';
    }

    const uploadDir = path.join(UPLOAD_PATH, fileType + 's');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file.originalname);
    cb(null, filename);
  }
});

// 文件过滤器（仅图片）
const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}。仅支持: ${ALLOWED_IMAGE_TYPES.join(', ')}`), false);
  }
};

// 根据文件扩展名获取文件类型分类
const getFileTypeCategoryByExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();

  const extensionMap = {
    // 图片
    '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image',
    '.webp': 'image', '.svg': 'image', '.bmp': 'image',
    // 视频
    '.mp4': 'video', '.avi': 'video', '.mov': 'video', '.mkv': 'video',
    '.webm': 'video', '.flv': 'video',
    // 音频
    '.mp3': 'audio', '.wav': 'audio', '.flac': 'audio', '.aac': 'audio',
    '.ogg': 'audio', '.m4a': 'audio',
    // 文档
    '.pdf': 'document', '.doc': 'document', '.docx': 'document',
    '.xls': 'document', '.xlsx': 'document', '.ppt': 'document', '.pptx': 'document',
    '.txt': 'document', '.md': 'document', '.markdown': 'document', '.csv': 'document',
    // 压缩包
    '.zip': 'archive', '.rar': 'archive', '.7z': 'archive', '.tar': 'archive', '.gz': 'archive'
  };

  return extensionMap[ext] || null;
};

// 检查文件扩展名是否被支持
const isExtensionAllowed = (filename) => {
  return getFileTypeCategoryByExtension(filename) !== null;
};

// 危险文件扩展名黑名单（可执行文件）
const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.msi', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.sh', '.bash', '.ps1',
  '.php', '.asp', '.aspx', '.jsp', '.cgi', '.pl', '.py', '.rb'
];

// 检查是否为危险文件
const isDangerousFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return DANGEROUS_EXTENSIONS.includes(ext);
};

// 文件过滤器（所有支持的类型）
const attachmentFilter = (req, file, cb) => {
  const allowedTypes = getAllAllowedTypes();
  const ext = path.extname(file.originalname).toLowerCase();

  // 安全检查：拒绝危险文件类型
  if (isDangerousFile(file.originalname)) {
    const errorMsg = `禁止上传可执行文件: ${ext}`;
    logger.error('文件类型安全检查失败:', errorMsg);
    cb(new Error(errorMsg), false);
    return;
  }

  // 详细日志：记录文件信息
  logger.debug('附件过滤器检查:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    extension: ext,
    size: file.size
  });

  // 优先检查 MIME 类型
  const mimeTypeAllowed = allowedTypes.includes(file.mimetype);
  // 其次检查文件扩展名（处理中文文件名或 MIME 类型识别错误的情况）
  const extensionAllowed = isExtensionAllowed(file.originalname);

  logger.debug('MIME 类型检查:', mimeTypeAllowed ? '通过' : '未通过');
  logger.debug('扩展名检查:', extensionAllowed ? '通过' : '未通过');

  // 只要 MIME 类型或扩展名有一个匹配就允许上传
  if (mimeTypeAllowed || extensionAllowed) {
    logger.debug('文件类型验证通过');
    cb(null, true);
  } else {
    const errorMsg = `不支持的文件类型: ${file.mimetype}, 扩展名: ${ext}`;
    logger.error('文件类型验证失败:', errorMsg);
    cb(new Error(errorMsg), false);
  }
};

// 创建 multer 实例（图片上传）
const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: imageFilter
});

// 创建 multer 实例（附件上传）
const attachmentUpload = multer({
  storage: attachmentStorage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: attachmentFilter
});

module.exports = {
  upload,
  attachmentUpload,
  UPLOAD_PATH,
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_FILE_TYPES,
  DANGEROUS_EXTENSIONS,
  ensureUploadDir,
  generateFilename,
  getFileTypeCategoryByExtension,
  isExtensionAllowed,
  getFileTypeCategory,
  getAllAllowedTypes,
  isDangerousFile
};
