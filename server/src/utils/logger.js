/**
 * 日志工具
 * 根据环境控制日志级别，自动过滤敏感信息
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// 从环境变量获取日志级别，默认为 INFO
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

// 敏感字段列表
const SENSITIVE_FIELDS = [
  'password', 'password_hash', 'oldPassword', 'newPassword', 'confirmPassword',
  'token', 'accessToken', 'refreshToken', 'jwt', 'secret', 'apiKey', 'api_key',
  'privateKey', 'private_key', 'authorization'
];

/**
 * 过滤敏感信息
 */
function sanitizeData(data) {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item));
  }

  const sanitized = {};
  for (const key in data) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '***';
    } else if (typeof data[key] === 'object' && data[key] !== null) {
      sanitized[key] = sanitizeData(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }
  return sanitized;
}

class Logger {
  /**
   * 格式化参数（过滤敏感信息）
   */
  formatArgs(args) {
    return args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        return sanitizeData(arg);
      }
      return arg;
    });
  }

  /**
   * 错误日志（总是输出）
   */
  error(message, ...args) {
    if (currentLevel >= LOG_LEVELS.ERROR) {
      const sanitizedArgs = this.formatArgs(args);
      console.error(`[ERROR] ${message}`, ...sanitizedArgs);
    }
  }

  /**
   * 警告日志
   */
  warn(message, ...args) {
    if (currentLevel >= LOG_LEVELS.WARN) {
      const sanitizedArgs = this.formatArgs(args);
      console.warn(`[WARN] ${message}`, ...sanitizedArgs);
    }
  }

  /**
   * 信息日志
   */
  info(message, ...args) {
    if (currentLevel >= LOG_LEVELS.INFO) {
      const sanitizedArgs = this.formatArgs(args);
      console.log(`[INFO] ${message}`, ...sanitizedArgs);
    }
  }

  /**
   * 调试日志（仅开发环境）
   */
  debug(message, ...args) {
    if (currentLevel >= LOG_LEVELS.DEBUG) {
      const sanitizedArgs = this.formatArgs(args);
      console.log(`[DEBUG] ${message}`, ...sanitizedArgs);
    }
  }

  /**
   * 格式化对象输出
   */
  logObject(level, message, obj) {
    const logMethod = this[level] || this.info;
    const sanitized = sanitizeData(obj);
    logMethod.call(this, message, JSON.stringify(sanitized, null, 2));
  }
}

module.exports = new Logger();
