const jwt = require('jsonwebtoken');

// 主JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// Access Token配置
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';

// Refresh Token配置
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your_refresh_token_secret_key';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * 生成Access Token
 * @param {Object} payload - 令牌负载
 * @returns {string} - Access Token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

/**
 * 生成Refresh Token
 * @param {Object} payload - 令牌负载
 * @returns {string} - Refresh Token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};

/**
 * 验证Access Token
 * @param {string} token - Access Token
 * @returns {Object} - 解码后的令牌负载
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * 验证Refresh Token
 * @param {string} token - Refresh Token
 * @returns {Object} - 解码后的令牌负载
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
};

module.exports = {
  // Access Token配置
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  generateAccessToken,
  verifyAccessToken,
  
  // Refresh Token配置
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
  generateRefreshToken,
  verifyRefreshToken
};