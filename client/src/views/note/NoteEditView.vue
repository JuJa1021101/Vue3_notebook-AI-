<template>
  <div class="bg-gray-50 h-full flex flex-col">
    <!-- Header -->
    <div class="bg-white px-4 py-3 border-b border-gray-100 flex-shrink-0">
      <div class="flex items-center justify-between">
        <button @click="goBack" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600"></i>
        </button>
        <h1 class="text-lg font-semibold text-gray-900">
          {{ isEdit ? "编辑笔记" : "新建笔记" }}
        </h1>
        <button
          @click="saveNote"
          :disabled="saving"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {{ saving ? "保存中..." : "保存" }}
        </button>
      </div>
    </div>

    <!-- Title Input -->
    <div class="bg-white px-4 py-4 border-b border-gray-100 flex-shrink-0">
      <input
        type="text"
        v-model="noteForm.title"
        placeholder="请输入标题..."
        class="w-full text-xl font-semibold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
      />
    </div>

    <!-- Category and Tags -->
    <div class="bg-white px-4 py-3 border-b border-gray-100 flex-shrink-0">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <i class="fas fa-folder text-gray-400"></i>
          <select
            v-model="noteForm.categoryId"
            class="text-sm text-gray-600 border-none outline-none bg-transparent"
          >
            <option value="">选择分类</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="flex items-center space-x-2">
          <i class="fas fa-tag text-gray-400"></i>
          <input
            type="text"
            v-model="tagInput"
            @keydown.enter="addTag"
            @keydown.space="addTag"
            placeholder="添加标签"
            class="text-sm text-gray-600 border-none outline-none bg-transparent"
          />
        </div>
      </div>

      <!-- Tags Display -->
      <div v-if="noteForm.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
        <span
          v-for="(tag, index) in noteForm.tags"
          :key="index"
          class="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
        >
          {{ tag }}
          <button
            @click="removeTag(index)"
            class="ml-1 text-blue-600 hover:text-blue-800"
          >
            <i class="fas fa-times text-xs"></i>
          </button>
        </span>
      </div>
    </div>

    <!-- Quill Editor -->
    <div class="bg-white flex-1 overflow-hidden">
      <QuillEditor
        ref="quillEditor"
        :content="noteForm.content"
        contentType="html"
        :toolbar="toolbarOptions"
        placeholder="开始记录你的想法..."
        theme="snow"
        @update:content="noteForm.content = $event"
        @ready="onEditorReady"
      />
    </div>

    <!-- Floating Action Menu -->
    <div class="fixed bottom-20 right-6 flex flex-col space-y-3 z-20">
      <button
        @click="insertImageFromFloat"
        class="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
      >
        <i class="fas fa-camera text-lg"></i>
      </button>
      <button
        @click="insertAudio"
        class="w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-600 transition-colors"
      >
        <i class="fas fa-microphone text-lg"></i>
      </button>
      <button
        @click="insertAttachment"
        class="w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-colors"
      >
        <i class="fas fa-paperclip text-lg"></i>
      </button>
    </div>

    <!-- 确认离开对话框 -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      title="提示"
      message="有未保存的内容，确定要离开吗？"
      type="warning"
      @confirm="handleConfirmLeave"
      @cancel="handleCancelLeave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { getCategories } from "@/api/category";
import type { Category } from "@/api/category";
import { createNote, getNoteById, updateNote } from "@/api/note";
import { uploadImage, uploadAttachment } from "@/api/file";
import { toast } from "@/utils/toast";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";

const router = useRouter();
const route = useRoute();

const quillEditor = ref();
const saving = ref(false);
const tagInput = ref("");
const loadingCategories = ref(false);

const isEdit = computed(() => !!route.params.id && route.params.id !== "new");

const noteForm = ref({
  title: "",
  content: "",
  categoryId: 0,
  tags: [] as string[],
});

const categories = ref<Category[]>([]);

// Quill 工具栏配置
const toolbarOptions = [
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  [{ header: [1, 2, 3, false] }],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["clean"],
];

onMounted(() => {
  loadCategories();
  if (isEdit.value) {
    loadNote();
  }
});

const onEditorReady = () => {
  // 编辑器准备就绪
  console.log("编辑器已准备就绪");
};

// 加载分类列表
const loadCategories = async () => {
  try {
    loadingCategories.value = true;
    const response = await getCategories();
    if (response.data.success) {
      categories.value = response.data.data;
    } else {
      console.error("获取分类列表失败:", response.data.message);
    }
  } catch (error: any) {
    console.error("加载分类失败:", error);
  } finally {
    loadingCategories.value = false;
  }
};

const loadNote = async () => {
  try {
    const noteId = parseInt(route.params.id as string);
    const response = await getNoteById(noteId);

    if (response.data.success) {
      const note = response.data.data;
      noteForm.value = {
        title: note.title,
        content: note.content,
        categoryId: note.category_id,
        tags: note.tags?.map((t) => t.name) || [],
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

const addTag = () => {
  const tag = tagInput.value.trim();
  if (tag && !noteForm.value.tags.includes(tag)) {
    noteForm.value.tags.push(tag);
    tagInput.value = "";
  }
};

const removeTag = (index: number) => {
  noteForm.value.tags.splice(index, 1);
};

// 压缩图片
const compressImage = (
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // 限制最大宽度
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedDataUrl);
        } else {
          reject(new Error("无法创建 canvas context"));
        }
      };
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
};

// 从浮动按钮插入图片
const insertImageFromFloat = async () => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "image/*");
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (file) {
      // 检查文件大小（限制为 10MB）
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("图片大小不能超过 10MB，请选择较小的图片");
        return;
      }

      try {
        // 压缩图片
        const compressedDataUrl = await compressImage(file, 800, 0.7);

        // 检查压缩后的大小
        const compressedSize = compressedDataUrl.length * 0.75; // 估算字节大小
        if (compressedSize > 2 * 1024 * 1024) {
          // 2MB
          toast.error("图片压缩后仍然过大，请选择更小的图片或降低分辨率");
          return;
        }

        const quill = quillEditor.value.getQuill();
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", compressedDataUrl);
        quill.setSelection(range.index + 1);
      } catch (error) {
        console.error("图片处理失败:", error);
        toast.error("图片处理失败，请重试");
      }
    }
  };
};

const insertAudio = () => {
  toast.info("录音功能开发中...");
};

// 插入附件
const insertAttachment = async () => {
  const input = document.createElement("input");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "*/*"); // 接受所有文件类型
  input.click();

  input.onchange = async () => {
    const file = input.files?.[0];
    if (file) {
      // 检查文件大小（限制为 50MB）
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("文件大小不能超过 50MB");
        return;
      }

      try {
        toast.info("正在上传附件...");

        // 上传附件到服务器（OSS）
        const noteId = isEdit.value
          ? parseInt(route.params.id as string)
          : undefined;
        const response = await uploadAttachment(file, noteId);

        if (response.data.success) {
          const fileData = response.data.data;
          const fileUrl = fileData.url;
          const fileName = fileData.original_name;
          const fileSize = (fileData.file_size / 1024).toFixed(2); // KB
          const fileType = fileData.file_type;

          // 根据文件类型插入不同的内容
          const quill = quillEditor.value.getQuill();
          const range = quill.getSelection(true);

          if (fileType === "image") {
            // 图片直接插入
            quill.insertEmbed(range.index, "image", fileUrl);
          } else if (fileType === "video") {
            // 视频插入
            quill.insertEmbed(range.index, "video", fileUrl);
          } else {
            // 其他文件插入为链接
            const linkText = `📎 ${fileName} (${fileSize} KB)`;
            quill.insertText(range.index, linkText, "link", fileUrl);
          }

          quill.setSelection(range.index + 1);
          toast.success("附件上传成功");
        } else {
          toast.error(response.data.message || "附件上传失败");
        }
      } catch (error: any) {
        console.error("附件上传失败:", error);
        toast.error(error.response?.data?.message || "附件上传失败，请重试");
      }
    }
  };
};

const saveNote = async () => {
  if (!noteForm.value.title.trim()) {
    toast.error("请输入笔记标题");
    return;
  }

  if (!noteForm.value.categoryId) {
    toast.error("请选择分类");
    return;
  }

  saving.value = true;

  try {
    const noteData = {
      title: noteForm.value.title,
      content: noteForm.value.content,
      category_id: noteForm.value.categoryId,
      tags: noteForm.value.tags,
    };

    if (isEdit.value) {
      const noteId = parseInt(route.params.id as string);
      const response = await updateNote(noteId, noteData);

      if (response.data.success) {
        toast.success("更新成功");
        router.push(`/main/notes/${noteId}`);
      } else {
        toast.error(response.data.message || "更新失败");
      }
    } else {
      const response = await createNote(noteData);

      if (response.data.success) {
        toast.success("保存成功");
        router.push(`/main/notes/${response.data.data.id}`);
      } else {
        toast.error(response.data.message || "保存失败");
      }
    }
  } catch (error: any) {
    console.error("保存笔记失败:", error);
    toast.error(error.response?.data?.message || "保存失败，请重试");
  } finally {
    saving.value = false;
  }
};

const showConfirmDialog = ref(false);

const goBack = () => {
  if (noteForm.value.title || noteForm.value.content) {
    showConfirmDialog.value = true;
  } else {
    router.back();
  }
};

const handleConfirmLeave = () => {
  router.back();
};

const handleCancelLeave = () => {
  showConfirmDialog.value = false;
};
</script>

<style>
/* Quill 编辑器样式 */
.ql-container {
  font-size: 16px;
  height: calc(100vh - 280px);
}

.ql-editor {
  min-height: 300px;
  padding: 20px;
}

.ql-editor.ql-blank::before {
  color: #9ca3af;
  font-style: normal;
  left: 20px;
  right: 20px;
  pointer-events: none;
}

/* 列表样式 */
.ql-editor ul,
.ql-editor ol {
  padding-left: 1.5em;
}

.ql-editor ul {
  list-style-type: disc;
}

.ql-editor ol {
  list-style-type: decimal;
}

.ql-editor li {
  margin-bottom: 0.5em;
}

/* 链接样式 */
.ql-editor a {
  color: #3b82f6;
  text-decoration: underline;
}

/* 图片样式 */
.ql-editor img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}

/* 表格样式 */
.ql-editor table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.ql-editor table td,
.ql-editor table th {
  border: 1px solid #e5e7eb;
  padding: 8px;
}

/* 引用样式 */
.ql-editor blockquote {
  border-left: 4px solid #3b82f6;
  padding-left: 1em;
  margin: 1em 0;
  color: #6b7280;
}

/* 代码块样式 */
.ql-editor pre {
  background-color: #f3f4f6;
  border-radius: 4px;
  padding: 1em;
  overflow-x: auto;
}

.ql-editor code {
  background-color: #f3f4f6;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}
</style>
