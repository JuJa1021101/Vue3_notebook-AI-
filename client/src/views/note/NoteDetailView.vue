<template>
  <div class="bg-gray-50 h-full overflow-y-auto">
    <!-- Header -->
    <div class="bg-white px-4 py-3 border-b border-gray-100">
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

    <div v-if="note" class="p-4">
      <!-- Note Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ note.title }}</h1>
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

      <!-- Attachments -->
      <div v-if="attachments.length > 0" class="mt-6">
        <div class="flex items-center mb-3">
          <i class="fas fa-paperclip text-gray-400 mr-2"></i>
          <span class="text-sm font-medium text-gray-700"
            >附件 ({{ attachments.length }})</span
          >
        </div>
        <div class="space-y-2">
          <AttachmentCard
            v-for="attachment in attachments"
            :key="attachment.id"
            :attachment="attachment"
            :show-delete="false"
            @preview="handlePreviewAttachment"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else class="flex items-center justify-center h-full">
      <div class="text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"
        ></div>
        <p class="text-gray-500">加载中...</p>
      </div>
    </div>

    <!-- Floating Edit Button -->
    <button
      v-if="note"
      @click="editNote"
      class="fixed bottom-24 right-4 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center"
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

<style scoped>
.prose {
  color: #374151;
  line-height: 1.75;
}

.prose h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-bottom: 1rem;
}

.prose strong {
  font-weight: 600;
}
</style>

<style>
/* 全局样式：用于 v-html 渲染的列表内容 */
.prose ul,
.prose ol {
  margin-bottom: 1rem !important;
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

.prose blockquote {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin: 1.5rem 0;
  font-style: italic;
  color: #6b7280;
}
</style>