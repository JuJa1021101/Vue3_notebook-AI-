const bcrypt = require('bcryptjs');

/**
 * 密码加密和验证工具
 */

// 加密密码
const hashPassword = async (password) => {
  try {
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error('密码加密失败');
  }
};

// 验证密码
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error('密码验证失败');
  }
};

// 生成随机密码
const generateRandomPassword = (length = 8) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// 密码强度检查
const checkPasswordStrength = (password) => {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 0;
  let feedback = [];

  if (password.length >= minLength) {
    strength += 1;
  } else {
    feedback.push('密码长度至少6位');
  }

  if (hasUpperCase) strength += 1;
  if (hasLowerCase) strength += 1;
  if (hasNumbers) strength += 1;
  if (hasSpecialChar) strength += 1;

  let level = 'weak';
  if (strength >= 4) level = 'strong';
  else if (strength >= 3) level = 'medium';

  return {
    strength,
    level,
    feedback,
    isValid: password.length >= minLength
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomPassword,
  checkPasswordStrength
};