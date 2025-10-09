/**
 * AI Prompt 模板
 */

const PromptTemplates = {
  // 智能续写
  continue: {
    zh: {
      short: `你是一个专业的写作助手。用户已经写了一段内容，现在需要你接着往下写。

用户已写的内容：
{content}

【重要规则】
1. 绝对不要重复用户已写的内容
2. 直接从用户内容的结尾处继续写
3. 续写长度：50-200字
4. 写作风格：{style}
5. 保持语气和主题一致

请直接输出续写的新内容，不要有任何前缀、解释或重复。`,

      medium: `你是一个专业的写作助手。用户已经写了一段内容，现在需要你接着往下写。

用户已写的内容：
{content}

【重要规则】
1. 绝对不要重复用户已写的内容
2. 直接从用户内容的结尾处继续写
3. 续写长度：200-500字
4. 写作风格：{style}
5. 保持语气和主题一致
6. 可以适当展开论述

请直接输出续写的新内容，不要有任何前缀、解释或重复。`,

      long: `你是一个专业的写作助手。用户已经写了一段内容，现在需要你接着往下写。

用户已写的内容：
{content}

【重要规则】
1. 绝对不要重复用户已写的内容
2. 直接从用户内容的结尾处继续写
3. 续写长度：500-800字
4. 写作风格：{style}
5. 保持语气和主题一致
6. 充分展开论述，可以添加例子和细节

请直接输出续写的新内容，不要有任何前缀、解释或重复。`
    },
    en: {
      short: `You are a professional writing assistant. Please continue writing based on the following content, maintaining consistent style and coherent content.

Existing content:
{content}

Requirements:
- Length: 50-200 words
- Writing style: {style}
- Maintain consistent tone and theme
- Content should be valuable and in-depth

Please output the continuation directly without any explanation.`,

      medium: `You are a professional writing assistant. Please continue writing based on the following content, maintaining consistent style and coherent content.

Existing content:
{content}

Requirements:
- Length: 200-500 words
- Writing style: {style}
- Maintain consistent tone and theme
- Content should be valuable and in-depth
- Expand the discussion appropriately

Please output the continuation directly without any explanation.`,

      long: `You are a professional writing assistant. Please continue writing based on the following content, maintaining consistent style and coherent content.

Existing content:
{content}

Requirements:
- Length: 500-800 words
- Writing style: {style}
- Maintain consistent tone and theme
- Content should be valuable and in-depth
- Fully expand the discussion with examples and details

Please output the continuation directly without any explanation.`
    }
  },

  // 格式优化
  format: {
    zh: `请优化以下文本的格式，使其更加规范和易读：

原文：
{content}

要求：
- 识别并设置合适的标题级别（H1-H6）
- 统一列表格式（有序/无序）
- 规范代码块格式
- 调整段落间距
- 优化引用格式
- 保持原文内容不变，只优化格式

请输出优化后的 Markdown 格式文本。`,

    en: `Please optimize the format of the following text to make it more standardized and readable:

Original text:
{content}

Requirements:
- Identify and set appropriate heading levels (H1-H6)
- Unify list formats (ordered/unordered)
- Standardize code block formats
- Adjust paragraph spacing
- Optimize quote formats
- Keep the original content unchanged, only optimize the format

Please output the optimized Markdown formatted text.`
  },

  // 排版美化
  beautify: {
    zh: `请美化以下文本的排版，使其结构更清晰：

原文：
{content}

要求：
- 自动分段（识别语义断点）
- 添加合适的标题层级
- 优化列表结构
- 添加必要的分隔线
- 改善整体可读性
- 保持原文意思不变

请输出排版优化后的 Markdown 文本。`,

    en: `Please beautify the layout of the following text to make its structure clearer:

Original text:
{content}

Requirements:
- Auto-paragraph (identify semantic breakpoints)
- Add appropriate heading hierarchy
- Optimize list structure
- Add necessary dividers
- Improve overall readability
- Keep the original meaning unchanged

Please output the layout-optimized Markdown text.`
  },

  // 内容润色
  polish: {
    zh: `请润色以下文本，使其更加流畅和专业：

原文：
{content}

要求：
- 修正语法错误
- 优化用词
- 改善句式结构
- 消除冗余表达
- 写作风格：{style}
- 保持原文核心意思不变

请输出润色后的文本。`,

    en: `Please polish the following text to make it more fluent and professional:

Original text:
{content}

Requirements:
- Correct grammatical errors
- Optimize word choice
- Improve sentence structure
- Eliminate redundant expressions
- Writing style: {style}
- Keep the core meaning unchanged

Please output the polished text.`
  },

  // 生成摘要
  summarize: {
    zh: {
      short: `请为以下文本生成简洁的摘要：

原文：
{content}

要求：
- 提取核心要点
- 长度控制在 100 字左右
- 保留关键信息
- 语言简洁明了

请输出摘要内容。`,

      medium: `请为以下文本生成摘要：

原文：
{content}

要求：
- 提取核心要点
- 长度控制在 200 字左右
- 保留关键信息和重要细节
- 语言简洁明了

请输出摘要内容。`,

      long: `请为以下文本生成详细摘要：

原文：
{content}

要求：
- 提取核心要点
- 长度控制在 300 字左右
- 保留关键信息和重要细节
- 可以分点列出
- 语言简洁明了

请输出摘要内容。`
    },
    en: {
      short: `Please generate a concise summary for the following text:

Original text:
{content}

Requirements:
- Extract core points
- Length around 100 words
- Retain key information
- Clear and concise language

Please output the summary.`,

      medium: `Please generate a summary for the following text:

Original text:
{content}

Requirements:
- Extract core points
- Length around 200 words
- Retain key information and important details
- Clear and concise language

Please output the summary.`,

      long: `Please generate a detailed summary for the following text:

Original text:
{content}

Requirements:
- Extract core points
- Length around 300 words
- Retain key information and important details
- Can be listed in points
- Clear and concise language

Please output the summary.`
    }
  },

  // 内容扩写
  expand: {
    zh: `请扩写以下简短内容，使其更加详细和完整：

原文：
{content}

要求：
- 补充细节描述
- 添加示例说明
- 扩展论述
- 目标长度：{length}
- 写作风格：{style}
- 保持原文核心观点
- 【重要】只输出扩写的新增内容，不要重复原文

请直接输出扩写的新增内容，不要重复原文。`,

    en: `Please expand the following brief content to make it more detailed and complete:

Original text:
{content}

Requirements:
- Add detailed descriptions
- Add examples
- Expand the discussion
- Target length: {length}
- Writing style: {style}
- Keep the core viewpoint

Please output the expanded content.`
  }
};

/**
 * 获取 Prompt 模板
 * @param {string} action - 操作类型
 * @param {string} language - 语言
 * @param {string} [length] - 长度（某些操作需要）
 * @returns {string} Prompt 模板
 */
function getPromptTemplate(action, language = 'zh', length = 'medium') {
  const template = PromptTemplates[action];
  if (!template) {
    throw new Error(`Unknown action: ${action}`);
  }

  const langTemplate = template[language];
  if (!langTemplate) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // 如果模板有长度选项，返回对应长度的模板
  if (typeof langTemplate === 'object') {
    return langTemplate[length] || langTemplate.medium;
  }

  return langTemplate;
}

/**
 * 构建 Prompt
 * @param {string} action - 操作类型
 * @param {string} content - 内容
 * @param {Object} options - 选项
 * @returns {string} 完整的 Prompt
 */
function buildPrompt(action, content, options = {}) {
  const {
    language = 'zh',
    length = 'medium',
    style = 'professional'
  } = options;

  let template = getPromptTemplate(action, language, length);

  // 替换模板变量
  template = template.replace('{content}', content);
  template = template.replace('{length}', length);
  template = template.replace('{style}', style);

  return template;
}

module.exports = {
  PromptTemplates,
  getPromptTemplate,
  buildPrompt
};
