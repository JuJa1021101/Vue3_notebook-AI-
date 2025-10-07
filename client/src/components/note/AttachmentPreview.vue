<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
    @click="handleClose"
  >
    <div
      class="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-gray-200"
      >
        <div class="flex-1 min-w-0">
          <h3 class="text-lg font-semibold text-gray-900 truncate">
            {{ attachment?.original_name }}
          </h3>
          <p class="text-sm text-gray-500">{{ formattedSize }}</p>
        </div>
        <button
          @click="handleClose"
          class="ml-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-auto max-h-[calc(90vh-180px)]">
        <!-- 图片预览 -->
        <div v-if="isImage && attachment" class="p-6 text-center">
          <img
            :src="attachment.url"
            :alt="attachment.original_name"
            class="max-w-full h-auto rounded-lg"
          />
        </div>

        <!-- Markdown 预览 -->
        <div v-else-if="isMarkdown" class="p-6">
          <div v-if="loadingMarkdown" class="text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">正在加载预览...</p>
          </div>
          <div
            v-else
            class="prose prose-sm max-w-none"
            v-html="markdownContent"
          ></div>
        </div>

        <!-- Word/Excel/PPT 预览 -->
        <div v-else-if="isOfficeDocument" class="text-center">
          <iframe
            :src="officeViewerUrl"
            class="w-full h-[600px] border-0"
            v-if="officeViewerUrl"
          ></iframe>
          <div v-else class="p-6 text-center py-12">
            <i class="fas fa-spinner fa-spin text-4xl text-gray-400 mb-4"></i>
            <p class="text-gray-600">正在加载预览...</p>
          </div>
        </div>

        <!-- 不支持预览的文件类型 -->
        <div v-else class="p-6 text-center py-12">
          <i class="fas fa-file text-6xl text-gray-300 mb-4"></i>
          <p class="text-gray-600 mb-4">此文件类型不支持预览</p>
          <button
            @click="handleDownload"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <i class="fas fa-download mr-2"></i>
            下载文件
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50"
      >
        <button
          @click="handleDownload"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <i class="fas fa-download mr-2"></i>
          下载
        </button>
        <button
          @click="handleClose"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
        >
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getFileContentProxy } from "@/api/file";

interface Attachment {
  id: number;
  original_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  url: string;
}

interface Props {
  visible: boolean;
  attachment: Attachment | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const markdownContent = ref("");
const officeViewerUrl = ref("");
const loadingMarkdown = ref(false);
const useProxy = ref(true); // 是否使用代理获取文件内容

// 判断文件类型
const isImage = computed(() => {
  return props.attachment?.file_type === "images";
});

const isMarkdown = computed(() => {
  if (!props.attachment) return false;
  const name = props.attachment.original_name.toLowerCase();
  return name.endsWith(".md") || name.endsWith(".markdown");
});

const isOfficeDocument = computed(() => {
  if (!props.attachment) return false;
  const mimeType = props.attachment.mime_type;
  const name = props.attachment.original_name.toLowerCase();
  return (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || // .docx
    mimeType === "application/msword" || // .doc
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
    mimeType === "application/vnd.ms-excel" || // .xls
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" || // .pptx
    mimeType === "application/vnd.ms-powerpoint" || // .ppt
    name.endsWith(".docx") ||
    name.endsWith(".doc") ||
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    name.endsWith(".pptx") ||
    name.endsWith(".ppt")
  );
});

const formattedSize = computed(() => {
  if (!props.attachment) return "";
  const size = props.attachment.file_size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
});

// 简单的 Markdown 解析器（不依赖外部库）
const parseMarkdown = (text: string): string => {
  let html = text;

  // 代码块
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${lang || "text"}">${escapeHtml(
      code
    )}</code></pre>`;
  });

  // 标题
  html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // 斜体
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // 行内代码
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // 链接
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 图片
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

  // 无序列表
  html = html.replace(/^\* (.*$)/gim, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");

  // 有序列表
  html = html.replace(/^\d+\. (.*$)/gim, "<li>$1</li>");

  // 引用
  html = html.replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>");

  // 段落
  html = html.replace(/\n\n/g, "</p><p>");
  html = `<p>${html}</p>`;

  return html;
};

const escapeHtml = (text: string): string => {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
};

// 监听附件变化，加载预览内容
watch(
  () => props.attachment,
  async (newAttachment) => {
    if (!newAttachment) return;

    // 重置状态
    markdownContent.value = "";
    officeViewerUrl.value = "";

    // 加载 Markdown 内容
    if (isMarkdown.value) {
      loadingMarkdown.value = true;
      try {
        let text = "";

        if (useProxy.value) {
          // 使用代理 API 获取文件内容（解决 CORS 问题）
          try {
            const response = await getFileContentProxy(newAttachment.id);
            text = response.data;
          } catch (proxyError) {
            console.warn("代理获取失败，尝试直接获取:", proxyError);
            // 如果代理失败，尝试直接获取
            const response = await fetch(newAttachment.url);
            text = await response.text();
          }
        } else {
          // 直接从 URL 获取
          const response = await fetch(newAttachment.url);
          text = await response.text();
        }

        markdownContent.value = parseMarkdown(text);
      } catch (error) {
        console.error("加载 Markdown 文件失败:", error);
        markdownContent.value =
          "<p class='text-red-600'>加载失败，请检查网络连接或稍后重试</p>";
      } finally {
        loadingMarkdown.value = false;
      }
    }

    // 生成 Office 文档预览 URL
    if (isOfficeDocument.value) {
      // 使用 Microsoft Office Online Viewer
      // 注意：这需要文件 URL 是公网可访问的
      officeViewerUrl.value = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        newAttachment.url
      )}`;
    }
  },
  { immediate: true }
);

const handleClose = () => {
  emit("update:visible", false);
};

const handleDownload = () => {
  if (!props.attachment) return;

  const link = document.createElement("a");
  link.href = props.attachment.url;
  link.download = props.attachment.original_name;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
/* Markdown 样式 */
.prose {
  color: #374151;
  line-height: 1.75;
}

.prose h1 {
  font-size: 1.875rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
}

.prose p {
  margin-bottom: 1rem;
}

.prose ul,
.prose ol {
  margin-bottom: 1rem;
  padding-left: 2em;
}

.prose ul {
  list-style-type: disc;
}

.prose ol {
  list-style-type: decimal;
}

.prose li {
  margin-bottom: 0.5rem;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}

.prose code {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.875em;
}

.prose pre {
  background-color: #f3f4f6;
  border-radius: 4px;
  padding: 1em;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.prose pre code {
  background-color: transparent;
  padding: 0;
}

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
}

.prose a {
  color: #3b82f6;
  text-decoration: underline;
}

.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}

.prose table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.prose table td,
.prose table th {
  border: 1px solid #e5e7eb;
  padding: 8px;
}

.prose table th {
  background-color: #f3f4f6;
  font-weight: 600;
}
</style>
