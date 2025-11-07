/**
 * 用户等级管理脚本
 * 用于升级/降级用户等级和管理订阅
 */

const { sequelize } = require('../src/config/database');
const { USER_TIERS } = require('../src/config/aiLimits');

/**
 * 升级用户等级
 * @param {number} userId - 用户 ID
 * @param {string} tier - 目标等级
 * @param {number} months - 订阅月数（0 表示永久）
 */
async function upgradeUser(userId, tier, months = 1) {
  try {
    // 验证等级
    if (!Object.values(USER_TIERS).includes(tier)) {
      throw new Error(`无效的等级: ${tier}`);
    }

    // 计算过期时间
    let expiryDate = null;
    if (months > 0) {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + months);
    }

    // 更新用户
    const result = await sequelize.query(
      `UPDATE users 
       SET tier = ?, 
           is_subscribed = 1, 
           subscription_expiry = ?
       WHERE id = ?`,
      {
        replacements: [tier, expiryDate, userId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    if (result[1] === 0) {
      throw new Error(`用户不存在: ${userId}`);
    }

    console.log(`✅ 用户 ${userId} 已升级为 ${tier}`);
    if (expiryDate) {
      console.log(`   订阅到期时间: ${expiryDate.toISOString().split('T')[0]}`);
    } else {
      console.log(`   订阅类型: 永久`);
    }

    return true;
  } catch (error) {
    console.error('❌ 升级失败:', error.message);
    return false;
  }
}

/**
 * 降级用户为免费用户
 * @param {number} userId - 用户 ID
 */
async function downgradeUser(userId) {
  try {
    const result = await sequelize.query(
      `UPDATE users 
       SET tier = 'free', 
           is_subscribed = 0, 
           subscription_expiry = NULL
       WHERE id = ?`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    if (result[1] === 0) {
      throw new Error(`用户不存在: ${userId}`);
    }

    console.log(`✅ 用户 ${userId} 已降级为免费用户`);
    return true;
  } catch (error) {
    console.error('❌ 降级失败:', error.message);
    return false;
  }
}

/**
 * 续费用户订阅
 * @param {number} userId - 用户 ID
 * @param {number} months - 续费月数
 */
async function renewSubscription(userId, months = 1) {
  try {
    // 获取当前订阅信息
    const rows = await sequelize.query(
      'SELECT tier, subscription_expiry FROM users WHERE id = ?',
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!rows || rows.length === 0) {
      throw new Error(`用户不存在: ${userId}`);
    }

    const user = rows[0];

    // 计算新的过期时间
    let newExpiry = new Date();
    if (user.subscription_expiry && new Date(user.subscription_expiry) > new Date()) {
      // 如果当前订阅未过期，从过期时间开始续费
      newExpiry = new Date(user.subscription_expiry);
    }
    newExpiry.setMonth(newExpiry.getMonth() + months);

    // 更新订阅
    await sequelize.query(
      `UPDATE users 
       SET is_subscribed = 1, 
           subscription_expiry = ?
       WHERE id = ?`,
      {
        replacements: [newExpiry, userId],
        type: sequelize.QueryTypes.UPDATE
      }
    );

    console.log(`✅ 用户 ${userId} 订阅已续费 ${months} 个月`);
    console.log(`   新的到期时间: ${newExpiry.toISOString().split('T')[0]}`);
    return true;
  } catch (error) {
    console.error('❌ 续费失败:', error.message);
    return false;
  }
}

/**
 * 查看用户信息
 * @param {number} userId - 用户 ID
 */
async function viewUser(userId) {
  try {
    const rows = await sequelize.query(
      `SELECT id, username, email, tier, is_subscribed, subscription_expiry 
       FROM users WHERE id = ?`,
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (!rows || rows.length === 0) {
      console.log(`❌ 用户不存在: ${userId}`);
      return;
    }

    const user = rows[0];
    console.log('\n用户信息:');
    console.log('  ID:', user.id);
    console.log('  用户名:', user.username);
    console.log('  邮箱:', user.email);
    console.log('  等级:', user.tier);
    console.log('  订阅状态:', user.is_subscribed ? '已订阅' : '未订阅');

    if (user.subscription_expiry) {
      const expiry = new Date(user.subscription_expiry);
      const isExpired = expiry < new Date();
      console.log('  订阅到期:', expiry.toISOString().split('T')[0], isExpired ? '(已过期)' : '');
    } else {
      console.log('  订阅到期: 永久');
    }

    // 查询使用情况
    const today = new Date().toISOString().split('T')[0];
    const usageRows = await sequelize.query(
      'SELECT hourly_count, daily_count FROM ai_rate_limits WHERE user_id = ? AND request_date = ?',
      {
        replacements: [userId, today],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (usageRows && usageRows.length > 0) {
      console.log('\n今日使用情况:');
      console.log('  本小时:', usageRows[0].hourly_count);
      console.log('  今日:', usageRows[0].daily_count);
    }

    console.log('');
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

/**
 * 列出所有用户
 */
async function listUsers() {
  try {
    const rows = await sequelize.query(
      `SELECT id, username, email, tier, is_subscribed, subscription_expiry 
       FROM users 
       ORDER BY tier DESC, id ASC`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    console.log('\n用户列表:');
    console.log('ID\t用户名\t\t等级\t\t订阅状态\t到期时间');
    console.log('─'.repeat(80));

    for (const user of rows) {
      const expiry = user.subscription_expiry
        ? new Date(user.subscription_expiry).toISOString().split('T')[0]
        : '永久';

      console.log(
        `${user.id}\t${user.username.padEnd(12)}\t${user.tier.padEnd(10)}\t` +
        `${user.is_subscribed ? '已订阅' : '未订阅'}\t\t${expiry}`
      );
    }

    console.log('');
  } catch (error) {
    console.error('❌ 查询失败:', error.message);
  }
}

/**
 * 批量检查过期订阅
 */
async function checkExpiredSubscriptions() {
  try {
    const rows = await sequelize.query(
      `SELECT id, username, tier, subscription_expiry 
       FROM users 
       WHERE is_subscribed = 1 
       AND subscription_expiry IS NOT NULL 
       AND subscription_expiry < NOW()`,
      {
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (rows.length === 0) {
      console.log('✅ 没有过期的订阅');
      return;
    }

    console.log(`\n发现 ${rows.length} 个过期订阅:`);
    for (const user of rows) {
      console.log(`  用户 ${user.id} (${user.username}): ${user.tier} -> free`);
    }

    // 降级过期用户
    const result = await sequelize.query(
      `UPDATE users 
       SET tier = 'free', is_subscribed = 0 
       WHERE is_subscribed = 1 
       AND subscription_expiry IS NOT NULL 
       AND subscription_expiry < NOW()`,
      {
        type: sequelize.QueryTypes.UPDATE
      }
    );

    console.log(`✅ 已降级 ${result[1]} 个用户\n`);
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'upgrade':
        // node manageUserTier.js upgrade <userId> <tier> [months]
        const userId = parseInt(args[1]);
        const tier = args[2];
        const months = parseInt(args[3]) || 1;
        await upgradeUser(userId, tier, months);
        break;

      case 'downgrade':
        // node manageUserTier.js downgrade <userId>
        await downgradeUser(parseInt(args[1]));
        break;

      case 'renew':
        // node manageUserTier.js renew <userId> [months]
        await renewSubscription(parseInt(args[1]), parseInt(args[2]) || 1);
        break;

      case 'view':
        // node manageUserTier.js view <userId>
        await viewUser(parseInt(args[1]));
        break;

      case 'list':
        // node manageUserTier.js list
        await listUsers();
        break;

      case 'check':
        // node manageUserTier.js check
        await checkExpiredSubscriptions();
        break;

      default:
        console.log('用户等级管理脚本');
        console.log('\n用法:');
        console.log('  node manageUserTier.js upgrade <userId> <tier> [months]  - 升级用户');
        console.log('  node manageUserTier.js downgrade <userId>                - 降级用户');
        console.log('  node manageUserTier.js renew <userId> [months]           - 续费订阅');
        console.log('  node manageUserTier.js view <userId>                     - 查看用户');
        console.log('  node manageUserTier.js list                              - 列出所有用户');
        console.log('  node manageUserTier.js check                             - 检查过期订阅');
        console.log('\n等级选项: free, basic, pro, enterprise');
        console.log('\n示例:');
        console.log('  node manageUserTier.js upgrade 1 pro 12    # 升级用户 1 为专业会员，12 个月');
        console.log('  node manageUserTier.js upgrade 2 enterprise 0  # 升级用户 2 为企业用户，永久');
        console.log('  node manageUserTier.js renew 1 3           # 为用户 1 续费 3 个月');
        console.log('  node manageUserTier.js view 1              # 查看用户 1 的信息');
    }
  } catch (error) {
    console.error('❌ 执行失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = {
  upgradeUser,
  downgradeUser,
  renewSubscription,
  viewUser,
  listUsers,
  checkExpiredSubscriptions
};
