const path = require('path');
const multer = require('koa-multer');
const fs = require('fs');

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
    const fileType = getFileTypeCategory(file.mimetype);
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

// 文件过滤器（所有支持的类型）
const attachmentFilter = (req, file, cb) => {
  const allowedTypes = getAllAllowedTypes();
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${file.mimetype}`), false);
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
  ensureUploadDir,
  generateFilename,
  getFileTypeCategory,
  getAllAllowedTypes
};
