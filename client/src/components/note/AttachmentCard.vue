<template>
  <div
    class="attachment-card flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group"
    @click="handlePreview"
  >
    <div class="flex items-center space-x-3 flex-1 min-w-0">
      <!-- 文件图标 -->
      <div
        class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        :class="iconBgClass"
      >
        <i :class="iconClass" class="text-lg"></i>
      </div>

      <!-- 文件信息 -->
      <div class="flex-1 min-w-0">
        <div class="text-sm font-medium text-gray-900 truncate">
          {{ attachment.original_name }}
        </div>
        <div class="text-xs text-gray-500">{{ formattedSize }}</div>
      </div>
    </div>

    <!-- 删除按钮 -->
    <button
      v-if="showDelete"
      @click.stop="handleDelete"
      class="flex-shrink-0 ml-2 w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity hover:bg-red-200"
      title="删除附件"
    >
      <i class="fas fa-times text-sm"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

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
  attachment: Attachment;
  showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showDelete: true,
});

const emit = defineEmits<{
  delete: [id: number];
  preview: [attachment: Attachment];
}>();

// 格式化文件大小
const formattedSize = computed(() => {
  const size = props.attachment.file_size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
});

// 根据文件类型获取图标
const iconClass = computed(() => {
  const type = props.attachment.file_type;
  const mime = props.attachment.mime_type;

  if (type === "image") return "fas fa-image text-blue-600";
  if (type === "video") return "fas fa-video text-purple-600";
  if (type === "audio") return "fas fa-music text-pink-600";
  if (type === "archive") return "fas fa-file-archive text-yellow-600";

  // 文档类型细分
  if (mime.includes("pdf")) return "fas fa-file-pdf text-red-600";
  if (mime.includes("word")) return "fas fa-file-word text-blue-600";
  if (mime.includes("excel") || mime.includes("spreadsheet"))
    return "fas fa-file-excel text-green-600";
  if (mime.includes("powerpoint") || mime.includes("presentation"))
    return "fas fa-file-powerpoint text-orange-600";
  if (mime.includes("text") || mime.includes("markdown"))
    return "fas fa-file-alt text-gray-600";

  return "fas fa-file text-gray-600";
});

// 图标背景颜色
const iconBgClass = computed(() => {
  const type = props.attachment.file_type;
  const mime = props.attachment.mime_type;

  if (type === "image") return "bg-blue-100";
  if (type === "video") return "bg-purple-100";
  if (type === "audio") return "bg-pink-100";
  if (type === "archive") return "bg-yellow-100";

  if (mime.includes("pdf")) return "bg-red-100";
  if (mime.includes("word")) return "bg-blue-100";
  if (mime.includes("excel") || mime.includes("spreadsheet"))
    return "bg-green-100";
  if (mime.includes("powerpoint") || mime.includes("presentation"))
    return "bg-orange-100";

  return "bg-gray-100";
});

const handleDelete = () => {
  emit("delete", props.attachment.id);
};

const handlePreview = () => {
  emit("preview", props.attachment);
};
</script>

<style scoped>
.attachment-card {
  user-select: none;
}
</style>
