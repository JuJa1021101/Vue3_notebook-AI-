/**
 * 直接测试更新设置的 SQL
 */

require('dotenv').config();
const { sequelize } = require('./src/config/database');

async function testUpdate() {
  try {
    const userId = 1;

    console.log('📋 当前设置:');
    const [current] = await sequelize.query(
      'SELECT * FROM ai_settings WHERE user_id = ?',
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    console.log(current);

    console.log('\n🔧 执行更新...');
    const updateFields = ['default_length = ?', 'default_style = ?', 'default_language = ?', 'stream_enabled = ?'];
    const values = ['long', 'creative', 'en', false, userId];

    console.log('SQL:', `UPDATE ai_settings SET ${updateFields.join(', ')} WHERE user_id = ?`);
    console.log('Values:', values);

    const [results] = await sequelize.query(
      `UPDATE ai_settings SET ${updateFields.join(', ')} WHERE user_id = ?`,
      {
        replacements: values,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    console.log('\n✅ 更新结果:', results);
    console.log('影响行数:', results);

    console.log('\n📋 更新后的设置:');
    const [updated] = await sequelize.query(
      'SELECT * FROM ai_settings WHERE user_id = ?',
      {
        replacements: [userId],
        type: sequelize.QueryTypes.SELECT
      }
    );
    console.log(updated);

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    process.exit(0);
  }
}

testUpdate();
