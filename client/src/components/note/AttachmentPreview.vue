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
      <div class="p-6 overflow-auto max-h-[calc(90vh-180px)]">
        <!-- 图片预览 -->
        <div v-if="attachment?.file_type === 'image'" class="text-center">
          <img
            :src="attachment.url"
            :alt="attachment.original_name"
            class="max-w-full h-auto rounded-lg"
          />
        </div>

        <!-- 视频预览 -->
        <div v-else-if="attachment?.file_type === 'video'" class="text-center">
          <video
            :src="attachment.url"
            controls
            class="max-w-full h-auto rounded-lg"
          >
            您的浏览器不支持视频播放
          </video>
        </div>

        <!-- 音频预览 -->
        <div v-else-if="attachment?.file_type === 'audio'" class="text-center">
          <audio :src="attachment.url" controls class="w-full">
            您的浏览器不支持音频播放
          </audio>
        </div>

        <!-- PDF 预览 -->
        <div
          v-else-if="attachment?.mime_type === 'application/pdf'"
          class="text-center"
        >
          <iframe
            :src="attachment.url"
            class="w-full h-[600px] border-0 rounded-lg"
          ></iframe>
        </div>

        <!-- 其他文件类型 -->
        <div v-else class="text-center py-12">
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
  visible: boolean;
  attachment: Attachment | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  "update:visible": [value: boolean];
}>();

const formattedSize = computed(() => {
  if (!props.attachment) return "";
  const size = props.attachment.file_size;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
});

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
