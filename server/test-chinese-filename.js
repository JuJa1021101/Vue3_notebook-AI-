/**
 * 测试中文文件名的 Markdown 上传
 */

const path = require('path');

// 模拟文件对象
const testFiles = [
  {
    originalname: '面试题目.md',
    mimetype: 'application/octet-stream', // 中文文件名常见的 MIME 类型
    size: 1024
  },
  {
    originalname: 'README.md',
    mimetype: 'text/markdown',
    size: 2048
  },
  {
    originalname: '测试文档.txt',
    mimetype: 'application/octet-stream',
    size: 512
  },
  {
    originalname: 'test.exe',
    mimetype: 'application/x-msdownload',
    size: 1024
  }
];

// 扩展名映射
const extensionMap = {
  '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image',
  '.webp': 'image', '.svg': 'image', '.bmp': 'image',
  '.mp4': 'video', '.avi': 'video', '.mov': 'video', '.mkv': 'video',
  '.webm': 'video', '.flv': 'video',
  '.mp3': 'audio', '.wav': 'audio', '.flac': 'audio', '.aac': 'audio',
  '.ogg': 'audio', '.m4a': 'audio',
  '.pdf': 'document', '.doc': 'document', '.docx': 'document',
  '.xls': 'document', '.xlsx': 'document', '.ppt': 'document', '.pptx': 'document',
  '.txt': 'document', '.md': 'document', '.markdown': 'document', '.csv': 'document',
  '.zip': 'archive', '.rar': 'archive', '.7z': 'archive', '.tar': 'archive', '.gz': 'archive'
};

const isExtensionAllowed = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  return extensionMap[ext] !== undefined;
};

console.log('=== 中文文件名上传测试 ===\n');

testFiles.forEach((file, index) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const extensionAllowed = isExtensionAllowed(file.originalname);
  const fileType = extensionMap[ext] || 'unknown';

  console.log(`\n测试 ${index + 1}: ${file.originalname}`);
  console.log('  MIME 类型:', file.mimetype);
  console.log('  扩展名:', ext);
  console.log('  文件类型:', fileType);
  console.log('  扩展名检查:', extensionAllowed ? '✅ 通过' : '❌ 未通过');
  console.log('  上传结果:', extensionAllowed ? '✅ 允许上传' : '❌ 拒绝上传');
});

console.log('\n=== 测试完成 ===');
console.log('\n💡 关键发现:');
console.log('  - 中文文件名的 .md 文件 MIME 类型可能是 application/octet-stream');
console.log('  - 通过扩展名检查可以正确识别文件类型');
console.log('  - 面试题目.md 现在应该可以正常上传了！');
