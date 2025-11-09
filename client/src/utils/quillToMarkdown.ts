/**
 * 将 Quill Delta 格式转换为 Markdown
 */

interface DeltaOp {
  insert: string | { image?: string; video?: string };
  attributes?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    link?: string;
    header?: number;
    list?: 'ordered' | 'bullet';
    blockquote?: boolean;
    'code-block'?: boolean;
  };
}

/**
 * 将 Quill Delta 转换为 Markdown
 */
export function deltaToMarkdown(delta: { ops: DeltaOp[] }): string {
  if (!delta || !delta.ops) return '';

  let markdown = '';
  let inCodeBlock = false;

  for (let i = 0; i < delta.ops.length; i++) {
    const op = delta.ops[i];

    if (typeof op.insert !== 'string') {
      // 处理嵌入内容（图片、视频等）
      if (op.insert.image) {
        markdown += `![image](${op.insert.image})\n`;
      }
      continue;
    }

    let text = op.insert;
    const attrs = op.attributes || {};

    // 处理代码块
    if (attrs['code-block']) {
      if (!inCodeBlock) {
        markdown += '```\n';
        inCodeBlock = true;
      }
      markdown += text;

      // 检查下一个操作是否还是代码块
      const nextOp = delta.ops[i + 1];
      if (!nextOp || !nextOp.attributes || !nextOp.attributes['code-block']) {
        markdown += '```\n';
        inCodeBlock = false;
      }
      continue;
    }

    // 处理标题
    if (attrs.header) {
      const level = attrs.header;
      markdown += '#'.repeat(level) + ' ' + text.trim() + '\n';
      continue;
    }

    // 处理引用
    if (attrs.blockquote) {
      markdown += '> ' + text;
      continue;
    }

    // 处理列表
    if (attrs.list) {
      const prefix = attrs.list === 'ordered' ? '1. ' : '- ';
      markdown += prefix + text;
      continue;
    }

    // 处理行内格式
    if (attrs.bold) text = `**${text}**`;
    if (attrs.italic) text = `*${text}*`;
    if (attrs.strike) text = `~~${text}~~`;
    if (attrs.code) text = `\`${text}\``;
    if (attrs.link) text = `[${text}](${attrs.link})`;

    markdown += text;
  }

  return markdown;
}

/**
 * 从 Quill 编辑器获取 Markdown 内容
 */
export function getMarkdownFromQuill(quill: any, index?: number, length?: number): string {
  if (!quill) return '';

  try {
    // 获取指定范围的内容
    const delta = index !== undefined && length !== undefined
      ? quill.getContents(index, length)
      : quill.getContents();

    return deltaToMarkdown(delta);
  } catch (error) {
    console.error('转换 Markdown 失败:', error);
    // 降级到纯文本
    return index !== undefined && length !== undefined
      ? quill.getText(index, length)
      : quill.getText();
  }
}
