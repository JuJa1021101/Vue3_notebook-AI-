/**
 * 数据清理和敏感信息过滤工具
 */

// 敏感字段列表
const SENSITIVE_FIELDS = [
  'password',
  'password_hash',
  'oldPassword',
  'newPassword',
  'confirmPassword',
  'token',
  'accessToken',
  'refreshToken',
  'jwt',
  'secret',
  'apiKey',
  'api_key',
  'privateKey',
  'private_key',
  'authorization',
  'cookie',
  'session'
];

/**
 * 过滤对象中的敏感字段
 * @param {Object} obj - 要过滤的对象
 * @param {Array} additionalFields - 额外的敏感字段
 * @returns {Object} 过滤后的对象
 */
function sanitizeObject(obj, additionalFields = []) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // 如果是数组，递归处理每个元素
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, additionalFields));
  }

  const sensitiveFields = [...SENSITIVE_FIELDS, ...additionalFields];
  const sanitized = {};

  for (const key in obj) {
    const lowerKey = key.toLowerCase();

    // 检查是否为敏感字段
    if (sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '***';
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      // 递归处理嵌套对象
      sanitized[key] = sanitizeObject(obj[key], additionalFields);
    } else {
      sanitized[key] = obj[key];
    }
  }

  return sanitized;
}

/**
 * 过滤用户对象，移除敏感信息
 * @param {Object} user - 用户对象
 * @returns {Object} 安全的用户对象
 */
function sanitizeUser(user) {
  if (!user) return null;

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

/**
 * 过滤请求体中的敏感信息（用于日志）
 * @param {Object} body - 请求体
 * @returns {Object} 过滤后的请求体
 */
function sanitizeRequestBody(body) {
  return sanitizeObject(body);
}

/**
 * 过滤响应数据中的敏感信息
 * @param {Object} data - 响应数据
 * @returns {Object} 过滤后的响应数据
 */
function sanitizeResponse(data) {
  return sanitizeObject(data);
}

/**
 * 验证并清理文件名（防止路径遍历攻击）
 * @param {string} filename - 文件名
 * @returns {string} 清理后的文件名
 */
function sanitizeFilename(filename) {
  if (!filename) return '';

  // 移除路径分隔符和特殊字符
  return filename
    .replace(/[\/\\]/g, '') // 移除路径分隔符
    .replace(/\.\./g, '') // 移除 ..
    .replace(/[<>:"|?*]/g, '') // 移除 Windows 不允许的字符
    .trim();
}

/**
 * 验证文件扩展名是否在白名单中
 * @param {string} filename - 文件名
 * @param {Array} allowedExtensions - 允许的扩展名列表
 * @returns {boolean} 是否允许
 */
function isFileExtensionAllowed(filename, allowedExtensions) {
  if (!filename || !allowedExtensions || !Array.isArray(allowedExtensions)) {
    return false;
  }

  const ext = filename.toLowerCase().split('.').pop();
  return allowedExtensions.includes(`.${ext}`);
}

/**
 * 验证 MIME 类型是否在白名单中
 * @param {string} mimetype - MIME 类型
 * @param {Array} allowedMimeTypes - 允许的 MIME 类型列表
 * @returns {boolean} 是否允许
 */
function isMimeTypeAllowed(mimetype, allowedMimeTypes) {
  if (!mimetype || !allowedMimeTypes || !Array.isArray(allowedMimeTypes)) {
    return false;
  }

  return allowedMimeTypes.includes(mimetype.toLowerCase());
}

module.exports = {
  sanitizeObject,
  sanitizeUser,
  sanitizeRequestBody,
  sanitizeResponse,
  sanitizeFilename,
  isFileExtensionAllowed,
  isMimeTypeAllowed,
  SENSITIVE_FIELDS
};
