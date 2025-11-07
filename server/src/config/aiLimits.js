/**
 * AI 限流配置
 * 根据用户等级和订阅状态动态调整限制
 */

/**
 * 用户等级定义
 */
const USER_TIERS = {
  FREE: 'free',           // 免费用户
  BASIC: 'basic',         // 基础会员
  PRO: 'pro',             // 专业会员
  ENTERPRISE: 'enterprise' // 企业用户
};

/**
 * 限流配置
 * 每个等级的小时和每日限制
 */
const RATE_LIMITS = {
  [USER_TIERS.FREE]: {
    hourly: 10,      // 每小时 10 次
    daily: 50,       // 每天 50 次
    maxTokens: 2048, // 单次最大 token 数
    description: '免费用户'
  },
  [USER_TIERS.BASIC]: {
    hourly: 30,      // 每小时 30 次
    daily: 200,      // 每天 200 次
    maxTokens: 4096, // 单次最大 token 数
    description: '基础会员'
  },
  [USER_TIERS.PRO]: {
    hourly: 100,     // 每小时 100 次
    daily: 1000,     // 每天 1000 次
    maxTokens: 8192, // 单次最大 token 数
    description: '专业会员'
  },
  [USER_TIERS.ENTERPRISE]: {
    hourly: -1,      // 无限制（-1 表示不限制）
    daily: -1,       // 无限制
    maxTokens: 16384, // 单次最大 token 数
    description: '企业用户'
  }
};

/**
 * 默认限制（用于环境变量配置）
 */
const DEFAULT_LIMITS = {
  hourly: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR || '30'),
  daily: parseInt(process.env.AI_RATE_LIMIT_PER_DAY || '200'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS_PER_REQUEST || '4096')
};

/**
 * 获取用户的限流配置
 * @param {Object} user - 用户对象
 * @param {string} user.tier - 用户等级
 * @param {boolean} user.isSubscribed - 是否订阅
 * @param {Date} user.subscriptionExpiry - 订阅过期时间
 * @returns {Object} 限流配置
 */
function getUserLimits(user) {
  // 如果没有用户信息，返回默认限制
  if (!user) {
    return DEFAULT_LIMITS;
  }

  // 检查订阅状态
  const isSubscriptionActive = user.isSubscribed &&
    user.subscriptionExpiry &&
    new Date(user.subscriptionExpiry) > new Date();

  // 确定用户等级
  let tier = USER_TIERS.FREE;

  if (isSubscriptionActive) {
    tier = user.tier || USER_TIERS.BASIC;
  }

  // 获取对应等级的限制
  const limits = RATE_LIMITS[tier] || RATE_LIMITS[USER_TIERS.FREE];

  return {
    hourly: limits.hourly,
    daily: limits.daily,
    maxTokens: limits.maxTokens,
    tier: tier,
    description: limits.description,
    isUnlimited: limits.hourly === -1 && limits.daily === -1
  };
}

/**
 * 检查是否超过限制
 * @param {number} currentCount - 当前使用次数
 * @param {number} limit - 限制次数
 * @returns {boolean} 是否超过限制
 */
function isLimitExceeded(currentCount, limit) {
  // -1 表示无限制
  if (limit === -1) {
    return false;
  }
  return currentCount >= limit;
}

/**
 * 计算剩余配额
 * @param {number} currentCount - 当前使用次数
 * @param {number} limit - 限制次数
 * @returns {number} 剩余配额
 */
function getRemainingQuota(currentCount, limit) {
  // -1 表示无限制
  if (limit === -1) {
    return -1; // 返回 -1 表示无限
  }
  return Math.max(0, limit - currentCount);
}

/**
 * 获取配额使用百分比
 * @param {number} currentCount - 当前使用次数
 * @param {number} limit - 限制次数
 * @returns {number} 使用百分比 (0-100)
 */
function getUsagePercentage(currentCount, limit) {
  // -1 表示无限制
  if (limit === -1) {
    return 0;
  }
  if (limit === 0) {
    return 100;
  }
  return Math.min(100, Math.round((currentCount / limit) * 100));
}

/**
 * 获取配额警告级别
 * @param {number} percentage - 使用百分比
 * @returns {string} 警告级别: 'safe', 'warning', 'danger'
 */
function getWarningLevel(percentage) {
  if (percentage >= 90) {
    return 'danger';  // 危险：使用超过 90%
  } else if (percentage >= 70) {
    return 'warning'; // 警告：使用超过 70%
  } else {
    return 'safe';    // 安全：使用低于 70%
  }
}

/**
 * 格式化限制信息（用于前端显示）
 * @param {Object} limits - 限制配置
 * @param {Object} usage - 当前使用情况
 * @returns {Object} 格式化后的信息
 */
function formatLimitInfo(limits, usage) {
  const hourlyRemaining = getRemainingQuota(usage.hourly_count, limits.hourly);
  const dailyRemaining = getRemainingQuota(usage.daily_count, limits.daily);

  const hourlyPercentage = getUsagePercentage(usage.hourly_count, limits.hourly);
  const dailyPercentage = getUsagePercentage(usage.daily_count, limits.daily);

  return {
    tier: limits.tier,
    description: limits.description,
    isUnlimited: limits.isUnlimited,
    hourly: {
      used: usage.hourly_count,
      limit: limits.hourly,
      remaining: hourlyRemaining,
      percentage: hourlyPercentage,
      warningLevel: getWarningLevel(hourlyPercentage),
      display: limits.hourly === -1 ? '无限制' : `${usage.hourly_count} / ${limits.hourly}`
    },
    daily: {
      used: usage.daily_count,
      limit: limits.daily,
      remaining: dailyRemaining,
      percentage: dailyPercentage,
      warningLevel: getWarningLevel(dailyPercentage),
      display: limits.daily === -1 ? '无限制' : `${usage.daily_count} / ${limits.daily}`
    },
    maxTokens: limits.maxTokens
  };
}

module.exports = {
  USER_TIERS,
  RATE_LIMITS,
  DEFAULT_LIMITS,
  getUserLimits,
  isLimitExceeded,
  getRemainingQuota,
  getUsagePercentage,
  getWarningLevel,
  formatLimitInfo
};
