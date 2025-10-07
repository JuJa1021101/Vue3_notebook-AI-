/**
 * 测试 Markdown 文件的 MIME 类型检测
 */

const path = require('path');
const fs = require('fs');

// 创建测试 markdown 文件
const testMdPath = path.join(__dirname, 'test.md');
fs.writeFileSync(testMdPath, '# 测试 Markdown 文件\n\n这是一个测试文件。');

console.log('=== Markdown MIME 类型测试 ===\n');

// 测试不同的 MIME 类型检测方法
console.log('📁 测试文件:', testMdPath);
console.log('📏 文件大小:', fs.statSync(testMdPath).size, 'bytes');
console.log('📝 文件扩展名:', path.extname(testMdPath));

// 模拟浏览器可能发送的 MIME 类型
const possibleMimeTypes = [
  'text/markdown',
  'text/x-markdown',
  'application/markdown',
  'text/plain',
  'application/octet-stream' // 浏览器无法识别时的默认类型
];

console.log('\n🌐 浏览器可能发送的 MIME 类型:');
possibleMimeTypes.forEach((type, index) => {
  console.log(`  ${index + 1}. ${type}`);
});

// 检查配置
const { ALLOWED_FILE_TYPES, getAllAllowedTypes } = require('./src/config/upload');

console.log('\n📋 服务器支持的文档 MIME 类型:');
ALLOWED_FILE_TYPES.document.forEach(type => {
  console.log(`  ✓ ${type}`);
});

console.log('\n🧪 MIME 类型匹配测试:');
const allAllowed = getAllAllowedTypes();
possibleMimeTypes.forEach(mimeType => {
  const isAllowed = allAllowed.includes(mimeType);
  const icon = isAllowed ? '✅' : '❌';
  console.log(`  ${icon} ${mimeType.padEnd(30)} ${isAllowed ? '支持' : '不支持'}`);
});

// 清理测试文件
fs.unlinkSync(testMdPath);

console.log('\n💡 建议:');
console.log('  1. 如果浏览器发送 application/octet-stream，需要添加到支持列表');
console.log('  2. 可以在前端强制设置文件类型');
console.log('  3. 可以根据文件扩展名判断而不是 MIME 类型');
console.log('\n✅ 测试完成！');
