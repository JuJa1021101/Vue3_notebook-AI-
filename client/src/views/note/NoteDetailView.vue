<template>
  <div
    class="bg-gray-50 dark:bg-gray-900 h-full flex flex-col transition-colors"
  >
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 transition-colors"
    >
      <div class="flex items-center justify-between">
        <button @click="$router.back()" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600 dark:text-gray-300"></i>
        </button>
        <div class="flex items-center space-x-2">
          <button @click="toggleStar" class="p-2">
            <i
              :class="
                note?.isStarred
                  ? 'fas fa-star text-yellow-500'
                  : 'far fa-star text-gray-400'
              "
            ></i>
          </button>
          <button @click="shareNote" class="p-2">
            <i class="fas fa-share text-gray-600 dark:text-gray-300"></i>
          </button>
          <button @click="showMenu" class="p-2">
            <i class="fas fa-ellipsis-h text-gray-600 dark:text-gray-300"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div
      v-if="note"
      class="flex-1 overflow-y-auto bg-white dark:bg-gray-800 transition-colors"
    >
      <div class="p-4">
        <!-- Note Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {{ note.title }}
          </h1>
          <div
            class="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
          >
            <span>{{ note.createdAt }}</span>
            <span>{{ note.updatedAt !== note.createdAt ? "已编辑" : "" }}</span>
            <span
              class="px-2 py-1 rounded-full text-xs"
              :style="{
                backgroundColor: note.categoryColor + '20',
                color: note.categoryColor,
              }"
            >
              {{ note.categoryName }}
            </span>
          </div>
          <div v-if="note.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="tag in note.tags"
              :key="tag"
              class="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full"
            >
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Note Content -->
        <div class="prose prose-sm max-w-none" v-html="note.content"></div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"
        ></div>
        <p class="text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    </div>

    <!-- Attachments -->
    <div
      v-if="note && attachments.length > 0"
      class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 transition-colors"
      style="padding-right: 100px"
    >
      <div class="flex items-center mb-2">
        <i class="fas fa-paperclip text-gray-400 dark:text-gray-500 mr-2"></i>
        <span class="text-sm font-medium text-gray-700 dark:text-gray-300"
          >附件 ({{ attachments.length }})</span
        >
      </div>
      <div class="space-y-2 max-h-40 overflow-y-auto pr-2 relative z-10">
        <AttachmentCard
          v-for="attachment in attachments"
          :key="attachment.id"
          :attachment="attachment"
          :show-delete="false"
          @preview="handlePreviewAttachment"
        />
      </div>
    </div>

    <!-- Floating Edit Button -->
    <button
      v-if="note"
      @click="editNote"
      class="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110 z-20"
      title="编辑笔记"
    >
      <i class="fas fa-edit text-lg"></i>
    </button>

    <!-- Attachment Preview Dialog -->
    <AttachmentPreview
      :visible="showPreview"
      :attachment="previewAttachment"
      @update:visible="showPreview = $event"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getNoteById, toggleFavorite } from "@/api/note";
import type { Note } from "@/api/note";
import { getNoteAttachments, deleteFile } from "@/api/file";
import { toast } from "@/utils/toast";
import AttachmentCard from "@/components/note/AttachmentCard.vue";
import AttachmentPreview from "@/components/note/AttachmentPreview.vue";

interface Attachment {
  id: number;
  original_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  url: string;
}

const route = useRoute();
const router = useRouter();

// 定义本地使用的Note类型（兼容模板）
interface LocalNote {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isStarred?: boolean;
}

const note = ref<LocalNote | null>(null);
const attachments = ref<Attachment[]>([]);
const showPreview = ref(false);
const previewAttachment = ref<Attachment | null>(null);

// 标题折叠清理函数
let cleanupHeadingCollapse: (() => void) | null = null;

onMounted(() => {
  loadNote();
  loadAttachments();
});

onBeforeUnmount(() => {
  // 清理标题折叠功能
  if (cleanupHeadingCollapse) {
    cleanupHeadingCollapse();
  }
});

// 格式化时间显示
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const loadNote = async () => {
  try {
    const noteId = parseInt(route.params.id as string);
    const response = await getNoteById(noteId);

    if (response.data.success) {
      const apiNote = response.data.data;
      note.value = {
        id: apiNote.id.toString(),
        title: apiNote.title,
        content: apiNote.content,
        categoryId: apiNote.category_id.toString(),
        categoryName: apiNote.category?.name || "",
        categoryColor: apiNote.category?.color || "#667eea",
        tags: apiNote.tags?.map((t) => t.name) || [],
        createdAt: formatDate(apiNote.created_at),
        updatedAt: formatDate(apiNote.updated_at),
        isStarred: apiNote.is_favorited || false,
      };

      // 等待 DOM 更新后初始化标题折叠功能
      await nextTick();
      setupHeadingCollapse();
    } else {
      toast.error(response.data.message || "加载笔记失败");
      router.back();
    }
  } catch (error: any) {
    console.error("加载笔记失败:", error);
    toast.error(error.response?.data?.message || "加载笔记失败");
    router.back();
  }
};

// 设置标题折叠功能
const setupHeadingCollapse = () => {
  const contentElement = document.querySelector(".prose");
  if (!contentElement) return;

  // 创建 tooltip 元素
  const tooltip = document.createElement("div");
  tooltip.className = "heading-collapse-tooltip";
  tooltip.style.cssText = `
    position: absolute;
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.2s ease;
    z-index: 1000;
  `;
  document.body.appendChild(tooltip);

  // 鼠标移动事件 - 显示 tooltip
  const handleMouseMove = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const heading = target.closest("h1, h2, h3, h4, h5, h6");

    if (heading) {
      const rect = heading.getBoundingClientRect();
      const clickX = e.clientX - rect.left;

      // 如果鼠标在 H 标签区域
      if (clickX >= 2 && clickX <= 20) {
        const headingLevel = heading.tagName;
        tooltip.textContent = headingLevel;
        // 固定在 H 标签上方
        tooltip.style.left = `${rect.left + 11}px`;
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.opacity = "1";
      }
      // 如果鼠标在箭头区域
      else if (clickX >= 21 && clickX <= 37) {
        const isCollapsed = heading.classList.contains("collapsed");
        tooltip.textContent = isCollapsed ? "展开" : "收起";
        // 固定在箭头上方
        tooltip.style.left = `${rect.left + 29}px`;
        tooltip.style.top = `${rect.top - 30}px`;
        tooltip.style.opacity = "1";
      } else {
        tooltip.style.opacity = "0";
      }
    } else {
      tooltip.style.opacity = "0";
    }
  };

  // 点击事件
  const handleHeadingClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const heading = target.closest("h1, h2, h3, h4, h5, h6");
    if (!heading) return;

    const rect = heading.getBoundingClientRect();
    const clickX = e.clientX - rect.left;

    // 如果点击位置在箭头区域，触发折叠
    if (clickX >= 21 && clickX <= 37) {
      e.preventDefault();
      e.stopPropagation();
      toggleHeadingInView(heading);
      // 更新 tooltip 文字
      const isCollapsed = heading.classList.contains("collapsed");
      tooltip.textContent = isCollapsed ? "展开" : "收起";
    }
  };

  contentElement.addEventListener("click", handleHeadingClick);
  contentElement.addEventListener("mousemove", handleMouseMove);

  // 返回清理函数
  cleanupHeadingCollapse = () => {
    contentElement.removeEventListener("click", handleHeadingClick);
    contentElement.removeEventListener("mousemove", handleMouseMove);
    tooltip.remove();
  };
};

// 在查看页面中切换标题折叠状态
const toggleHeadingInView = (heading: Element) => {
  const isCollapsed = heading.classList.contains("collapsed");

  if (isCollapsed) {
    heading.classList.remove("collapsed");
  } else {
    heading.classList.add("collapsed");
  }

  // 获取当前标题的级别
  const currentLevel = parseInt(heading.tagName.substring(1));

  // 查找需要折叠/展开的内容
  let nextElement = heading.nextElementSibling;
  const elementsToToggle: Element[] = [];

  while (nextElement) {
    // 如果遇到同级或更高级的标题，停止
    if (nextElement.tagName && nextElement.tagName.match(/^H[1-6]$/)) {
      const nextLevel = parseInt(nextElement.tagName.substring(1));
      if (!isNaN(nextLevel) && nextLevel <= currentLevel) {
        break;
      }
    }

    elementsToToggle.push(nextElement);
    nextElement = nextElement.nextElementSibling;
  }

  // 切换显示状态
  elementsToToggle.forEach((element) => {
    if (!isCollapsed) {
      (element as HTMLElement).style.display = "none";
    } else {
      (element as HTMLElement).style.display = "";
    }
  });
};

const toggleStar = async () => {
  if (!note.value) return;

  try {
    const noteId = parseInt(note.value.id);
    const response = await toggleFavorite(noteId);

    if (response.data.success) {
      note.value.isStarred = response.data.data.is_favorited;
      toast.success(response.data.data.is_favorited ? "已收藏" : "已取消收藏");
    }
  } catch (error: any) {
    console.error("切换收藏状态失败:", error);
    toast.error("操作失败，请重试");
  }
};

const shareNote = () => {
  // TODO: 分享功能
  toast.info("分享功能开发中...");
};

const showMenu = () => {
  // TODO: 显示更多操作菜单
  toast.info("更多操作菜单开发中...");
};

const editNote = () => {
  router.push(`/main/notes/${note.value?.id}/edit`);
};

const loadAttachments = async () => {
  try {
    const noteId = parseInt(route.params.id as string);
    const response = await getNoteAttachments(noteId);

    if (response.data.success) {
      attachments.value = response.data.data.files;
    }
  } catch (error: any) {
    console.error("加载附件失败:", error);
  }
};

const handleDeleteAttachment = async (fileId: number) => {
  try {
    const response = await deleteFile(fileId);
    if (response.data.success) {
      attachments.value = attachments.value.filter((a) => a.id !== fileId);
      toast.success("附件删除成功");
    } else {
      toast.error(response.data.message || "删除失败");
    }
  } catch (error: any) {
    console.error("删除附件失败:", error);
    toast.error(error.response?.data?.message || "删除失败，请重试");
  }
};

const handlePreviewAttachment = (attachment: Attachment) => {
  previewAttachment.value = attachment;
  showPreview.value = true;
};
</script>

<style>
/* 全局样式：用于 v-html 渲染的内容 */
.prose {
  color: #374151;
  line-height: 1.75;
  font-size: 16px;
}

.dark .prose {
  color: #d1d5db;
}

/* 标题样式 - 只在悬停时显示折叠功能 */
.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
  position: relative;
  padding-left: 42px;
  margin-left: 0;
  transition: background-color 0.2s ease;
}

/* 正文内容与标题对齐 */
.prose p,
.prose ul,
.prose ol,
.prose blockquote,
.prose pre,
.prose table {
  margin-left: 42px;
}

.prose h1:hover,
.prose h2:hover,
.prose h3:hover,
.prose h4:hover,
.prose h5:hover,
.prose h6:hover {
  background-color: rgba(59, 130, 246, 0.05);
  border-radius: 4px;
}

.dark .prose h1:hover,
.dark .prose h2:hover,
.dark .prose h3:hover,
.dark .prose h4:hover,
.dark .prose h5:hover,
.dark .prose h6:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

/* 标题级别标签 - 默认隐藏，悬停时显示，在最左边 */
.prose h1::before {
  content: "H1";
}

.prose h2::before {
  content: "H2";
}

.prose h3::before {
  content: "H3";
}

.prose h4::before {
  content: "H4";
}

.prose h5::before {
  content: "H5";
}

.prose h6::before {
  content: "H6";
}

.prose h1::before,
.prose h2::before,
.prose h3::before,
.prose h4::before,
.prose h5::before,
.prose h6::before {
  position: absolute;
  left: 2px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 11px;
  color: #9ca3af;
  font-weight: 500;
  width: 18px;
  text-align: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.prose h1:hover::before,
.prose h2:hover::before,
.prose h3:hover::before,
.prose h4:hover::before,
.prose h5:hover::before,
.prose h6:hover::before {
  opacity: 1;
}

/* 折叠按钮 - 默认隐藏，悬停时显示，在 H 标签右边 */
.prose h1::after,
.prose h2::after,
.prose h3::after,
.prose h4::after,
.prose h5::after,
.prose h6::after {
  content: "\f078"; /* Font Awesome chevron-down */
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  position: absolute;
  left: 21px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #60a5fa;
  font-size: 10px;
  transition: all 0.2s ease;
  border-radius: 3px;
  opacity: 0;
}

.prose h1:hover::after,
.prose h2:hover::after,
.prose h3:hover::after,
.prose h4:hover::after,
.prose h5:hover::after,
.prose h6:hover::after {
  opacity: 1;
}

.prose h1::after:hover,
.prose h2::after:hover,
.prose h3::after:hover,
.prose h4::after:hover,
.prose h5::after:hover,
.prose h6::after:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

/* 折叠状态的标题 - 箭头向右，且始终显示 */
.prose h1.collapsed::before,
.prose h2.collapsed::before,
.prose h3.collapsed::before,
.prose h4.collapsed::before,
.prose h5.collapsed::before,
.prose h6.collapsed::before {
  opacity: 1;
}

.prose h1.collapsed::after,
.prose h2.collapsed::after,
.prose h3.collapsed::after,
.prose h4.collapsed::after,
.prose h5.collapsed::after,
.prose h6.collapsed::after {
  content: "\f054"; /* Font Awesome chevron-right */
  opacity: 1;
}

.prose h1.collapsed,
.prose h2.collapsed,
.prose h3.collapsed,
.prose h4.collapsed,
.prose h5.collapsed,
.prose h6.collapsed {
  margin-bottom: 0.5em;
}

/* 暗色模式下的样式 */
.dark .prose h1::before,
.dark .prose h2::before,
.dark .prose h3::before,
.dark .prose h4::before,
.dark .prose h5::before,
.dark .prose h6::before {
  color: #6b7280;
}

.dark .prose h1::after,
.dark .prose h2::after,
.dark .prose h3::after,
.dark .prose h4::after,
.dark .prose h5::after,
.dark .prose h6::after {
  color: #60a5fa;
}

.dark .prose h1::after:hover,
.dark .prose h2::after:hover,
.dark .prose h3::after:hover,
.dark .prose h4::after:hover,
.dark .prose h5::after:hover,
.dark .prose h6::after:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

.prose h1 {
  font-size: 2em;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #111827;
  line-height: 1.2;
}

.dark .prose h1 {
  color: #f9fafb;
}

.prose h2 {
  font-size: 1.75em;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1f2937;
  line-height: 1.3;
}

.dark .prose h2 {
  color: #f3f4f6;
}

.prose h3 {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: #374151;
  line-height: 1.4;
}

.dark .prose h3 {
  color: #e5e7eb;
}

.prose h4 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.dark .prose h4 {
  color: #d1d5db;
}

.prose h5 {
  font-size: 1.125em;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
}

.dark .prose h5 {
  color: #9ca3af;
}

.prose h6 {
  font-size: 1.0625em;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: #9ca3af;
}

.dark .prose h6 {
  color: #6b7280;
}

/* 段落样式 */
.prose p {
  margin-bottom: 1rem;
  margin-top: 0;
}

/* 文本格式 */
.prose strong {
  font-weight: 600;
  color: #111827;
}

.dark .prose strong {
  color: #f9fafb;
}

.prose em {
  font-style: italic;
}

.prose u {
  text-decoration: underline;
}

.prose s {
  text-decoration: line-through;
}

/* 列表样式 */
.prose ul,
.prose ol {
  margin-bottom: 1rem !important;
  margin-top: 0.5rem !important;
  padding-left: 2em !important;
  list-style-position: outside !important;
}

.prose ul {
  list-style-type: disc !important;
}

.prose ol {
  list-style-type: decimal !important;
}

.prose li {
  margin-bottom: 0.5rem;
  display: list-item !important;
}

.prose li > p {
  margin-bottom: 0.5rem;
}

/* 嵌套列表 */
.prose ul ul,
.prose ol ul {
  list-style-type: circle !important;
  margin-top: 0.5rem;
}

.prose ul ul ul,
.prose ol ul ul,
.prose ol ol ul {
  list-style-type: square !important;
}

.prose ol ol {
  list-style-type: lower-alpha !important;
  margin-top: 0.5rem;
}

/* 引用样式 */
.prose blockquote {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 0 4px 4px 0;
}

.dark .prose blockquote {
  color: #9ca3af;
  background-color: #1f2937;
}

.prose blockquote p {
  margin: 0;
}

/* 代码样式 */
.prose code {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.875em;
  color: #e83e8c;
}

.dark .prose code {
  background-color: #374151;
  color: #f472b6;
}

.prose pre {
  background-color: #1f2937;
  color: #f9fafb;
  border-radius: 6px;
  padding: 1em;
  overflow-x: auto;
  margin: 1rem 0;
  line-height: 1.5;
}

.prose pre code {
  background: none;
  padding: 0;
  border-radius: 0;
  color: inherit;
  font-size: 0.875em;
}

/* 链接样式 */
.prose a {
  color: #3b82f6;
  text-decoration: underline;
  transition: color 0.2s;
}

.prose a:hover {
  color: #2563eb;
}

/* 图片样式 */
.prose img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
  display: block;
}

/* 水平分割线 */
.prose hr {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2rem 0;
}

/* 表格样式 */
.prose table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  overflow-x: auto;
  display: block;
}

.prose table td,
.prose table th {
  border: 1px solid #e5e7eb;
  padding: 8px 12px;
  text-align: left;
}

.dark .prose table td,
.dark .prose table th {
  border: 1px solid #4b5563;
}

.prose table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.dark .prose table th {
  background-color: #374151;
  color: #e5e7eb;
}

.prose table tr:nth-child(even) {
  background-color: #f9fafb;
}

.dark .prose table tr:nth-child(even) {
  background-color: #1f2937;
}

/* Quill 特定的类名支持 */
.prose .ql-align-center {
  text-align: center;
}

.prose .ql-align-right {
  text-align: right;
}

.prose .ql-align-justify {
  text-align: justify;
}

.prose .ql-indent-1 {
  padding-left: 3em;
}

.prose .ql-indent-2 {
  padding-left: 6em;
}

.prose .ql-indent-3 {
  padding-left: 9em;
}

/* 字体颜色和背景色 */
.prose .ql-font-serif {
  font-family: Georgia, "Times New Roman", serif;
}

.prose .ql-font-monospace {
  font-family: "Courier New", Courier, monospace;
}

.prose .ql-size-small {
  font-size: 0.75em;
}

.prose .ql-size-large {
  font-size: 1.5em;
}

.prose .ql-size-huge {
  font-size: 2.5em;
}
</style>