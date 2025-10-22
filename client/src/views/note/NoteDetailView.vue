<template>
  <div class="bg-gray-50 h-full flex flex-col">
    <!-- Header -->
    <div class="bg-white px-4 py-3 border-b border-gray-100 flex-shrink-0">
      <div class="flex items-center justify-between">
        <button @click="$router.back()" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600"></i>
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
            <i class="fas fa-share text-gray-600"></i>
          </button>
          <button @click="showMenu" class="p-2">
            <i class="fas fa-ellipsis-h text-gray-600"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div v-if="note" class="flex-1 overflow-y-auto bg-white">
      <div class="p-4">
        <!-- Note Header -->
        <div class="mb-6">
          <h1 class="text-2xl font-bold text-gray-900 mb-2">
            {{ note.title }}
          </h1>
          <div class="flex items-center space-x-4 text-sm text-gray-500">
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
              class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
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
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <!-- Attachments -->
    <div
      v-if="note && attachments.length > 0"
      class="bg-white px-4 py-3 border-t border-gray-100 flex-shrink-0"
      style="padding-right: 100px"
    >
      <div class="flex items-center mb-2">
        <i class="fas fa-paperclip text-gray-400 mr-2"></i>
        <span class="text-sm font-medium text-gray-700"
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getNoteById } from "@/api/note";
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

onMounted(() => {
  loadNote();
  loadAttachments();
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
        isStarred: false,
      };
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

const toggleStar = () => {
  if (note.value) {
    note.value.isStarred = !note.value.isStarred;
    // TODO: 调用API更新收藏状态
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

/* 标题样式 */
.prose h1 {
  font-size: 2em;
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
  color: #111827;
  line-height: 1.2;
}

.prose h2 {
  font-size: 1.5em;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #1f2937;
  line-height: 1.3;
}

.prose h3 {
  font-size: 1.25em;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: #374151;
  line-height: 1.4;
}

.prose h4 {
  font-size: 1.1em;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.prose h5 {
  font-size: 1em;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
}

.prose h6 {
  font-size: 0.9em;
  font-weight: 600;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: #9ca3af;
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

.prose table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.prose table tr:nth-child(even) {
  background-color: #f9fafb;
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