/**
 * Markdown 解析工具
 * 统一使用 marked 库处理 Markdown
 */

import { marked } from 'marked'

// 配置 marked 选项
marked.setOptions({
  breaks: true, // 支持 GFM 换行
  gfm: true, // 启用 GitHub Flavored Markdown
  mangle: false, // 不混淆邮箱地址
  pedantic: false // 不使用原始的 markdown.pl 行为
})

/**
 * 解析 Markdown 为 HTML
 * @param markdown - Markdown 文本
 * @returns HTML 字符串
 */
export function parseMarkdown(markdown: string): string {
  if (!markdown) return ''

  try {
    return marked.parse(markdown) as string
  } catch (error) {
    console.error('Markdown 解析失败:', error)
    return markdown
  }
}

/**
 * 异步解析 Markdown 为 HTML
 * @param markdown - Markdown 文本
 * @returns Promise<HTML 字符串>
 */
export async function parseMarkdownAsync(markdown: string): Promise<string> {
  if (!markdown) return ''

  try {
    return await marked.parse(markdown) as string
  } catch (error) {
    console.error('Markdown 解析失败:', error)
    return markdown
  }
}

/**
 * 解析 Markdown 为纯文本（移除所有标记）
 * @param markdown - Markdown 文本
 * @returns 纯文本
 */
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return ''

  try {
    const html = marked.parse(markdown) as string
    // 移除 HTML 标签
    return html.replace(/<[^>]*>/g, '').trim()
  } catch (error) {
    console.error('Markdown 转换失败:', error)
    return markdown
  }
}

/**
 * 检查文本是否包含 Markdown 语法
 * @param text - 文本内容
 * @returns 是否包含 Markdown
 */
export function hasMarkdownSyntax(text: string): boolean {
  if (!text) return false

  // 检查常见的 Markdown 语法
  const markdownPatterns = [
    /^#{1,6}\s/, // 标题
    /\*\*.*\*\*/, // 粗体
    /\*.*\*/, // 斜体
    /\[.*\]\(.*\)/, // 链接
    /!\[.*\]\(.*\)/, // 图片
    /^[-*+]\s/, // 无序列表
    /^\d+\.\s/, // 有序列表
    /^>\s/, // 引用
    /`.*`/, // 行内代码
    /```[\s\S]*```/ // 代码块
  ]

  return markdownPatterns.some(pattern => pattern.test(text))
}

export default {
  parseMarkdown,
  parseMarkdownAsync,
  markdownToPlainText,
  hasMarkdownSyntax
}
