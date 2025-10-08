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
            <option value="" disabled>选择分类</option>
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

    <!-- 附件列表 -->
    <div
      v-if="attachments.length > 0"
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
          @delete="handleDeleteAttachment"
          @preview="handlePreviewAttachment"
        />
      </div>
    </div>

    <!-- Floating Action Menu -->
    <div
      class="fixed right-6 bottom-24 flex flex-col-reverse items-center z-20"
    >
      <!-- 切换按钮（眼睛图标） - 在下面 -->
      <button
        @click="debouncedToggleFloatingButtons"
        class="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110"
        :title="showFloatingButtons ? '隐藏工具栏' : '显示工具栏'"
      >
        <i
          :class="showFloatingButtons ? 'fas fa-eye' : 'fas fa-eye-slash'"
          class="text-lg transition-all"
        ></i>
      </button>

      <!-- 功能按钮组 - 在上面，向上展开 -->
      <div class="flex flex-col-reverse items-center">
        <!-- AI 助手按钮 -->
        <transition name="slide-up-4">
          <button
            v-if="showFloatingButtons"
            @click="toggleAIPanel"
            class="w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 mb-3"
            :class="
              aiStore.showPanel
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                : 'bg-gradient-to-br from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600'
            "
            title="AI 助手"
          >
            <i class="fas fa-magic text-lg"></i>
          </button>
        </transition>
        <!-- 附件按钮 -->
        <transition name="slide-up-3">
          <button
            v-if="showFloatingButtons"
            @click="insertAttachment"
            class="w-14 h-14 bg-orange-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-orange-600 transition-all hover:scale-110 mb-3"
            title="上传附件"
          >
            <i class="fas fa-paperclip text-lg"></i>
          </button>
        </transition>
        <!-- 录音按钮 -->
        <transition name="slide-up-2">
          <button
            v-if="showFloatingButtons"
            @click="insertAudio"
            class="w-14 h-14 bg-purple-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-600 transition-all hover:scale-110 mb-3"
            title="录音"
          >
            <i class="fas fa-microphone text-lg"></i>
          </button>
        </transition>
        <!-- 图片按钮 -->
        <transition name="slide-up-1">
          <button
            v-if="showFloatingButtons"
            @click="insertImageFromFloat"
            class="w-14 h-14 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-all hover:scale-110 mb-3"
            title="上传图片"
          >
            <i class="fas fa-image text-lg"></i>
          </button>
        </transition>
      </div>
    </div>

    <!-- AI 助手面板 -->
    <AIPanel @action="handleAIAction" />
    <AIPreview
      v-if="aiStore.showPreview"
      @apply="applyAIResult"
      @close="aiStore.closePreview()"
      @regenerate="regenerateAI"
    />

    <!-- 确认离开对话框 -->
    <ConfirmDialog
      v-model="showConfirmDialog"
      title="提示"
      message="有未保存的内容，确定要离开吗？"
      type="warning"
      @confirm="handleConfirmLeave"
      @cancel="handleCancelLeave"
    />

    <!-- 附件预览对话框 -->
    <AttachmentPreview
      :visible="showPreview"
      :attachment="previewAttachment"
      @update:visible="showPreview = $event"
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
import {
  uploadAttachment,
  deleteFile,
  getNoteAttachments,
  updateFilesNoteId,
} from "@/api/file";
import { toast } from "@/utils/toast";
import ConfirmDialog from "@/components/common/ConfirmDialog.vue";
import AttachmentCard from "@/components/note/AttachmentCard.vue";
import AttachmentPreview from "@/components/note/AttachmentPreview.vue";
import { AIPanel, AIPreview } from "@/components/ai";
import { useAIStore } from "@/stores/ai";

interface Attachment {
  id: number;
  original_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  url: string;
}

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
const attachments = ref<Attachment[]>([]);
const showPreview = ref(false);
const previewAttachment = ref<Attachment | null>(null);
const showFloatingButtons = ref(true); // 控制浮动按钮显示/隐藏

// AI Store
const aiStore = useAIStore();

// 节流函数 - 第一次立即执行，后续点击在延迟时间内被忽略
const throttle = (fn: Function, delay: number) => {
  let lastTime = 0;
  return function (this: any, ...args: any[]) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};

// 切换浮动按钮显示/隐藏
const toggleFloatingButtons = () => {
  showFloatingButtons.value = !showFloatingButtons.value;
};

// 节流版本的切换函数（1秒延迟）
const debouncedToggleFloatingButtons = throttle(toggleFloatingButtons, 1000);

// 切换 AI 面板
const toggleAIPanel = () => {
  aiStore.togglePanel();
};

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
        tags: note.tags?.map((t: any) => t.name) || [],
      };

      // 加载附件
      await loadAttachments();
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

          // 添加到附件列表
          attachments.value.push(fileData);

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

// 删除附件
const handleDeleteAttachment = async (fileId: number) => {
  try {
    const response = await deleteFile(fileId);
    if (response.data.success) {
      // 从列表中移除
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

// 预览附件
const handlePreviewAttachment = (attachment: Attachment) => {
  previewAttachment.value = attachment;
  showPreview.value = true;
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
      // 新建笔记：先保存笔记，再关联附件
      const response = await createNote(noteData);

      if (response.data.success) {
        const newNoteId = response.data.data.id;

        // 如果有附件，关联到新创建的笔记
        if (attachments.value.length > 0) {
          try {
            const fileIds = attachments.value.map((a) => a.id);
            await updateFilesNoteId(fileIds, newNoteId);
            console.log("附件已关联到笔记");
          } catch (error: any) {
            console.error("关联附件失败:", error);
            toast.error("笔记保存成功，但附件关联失败");
          }
        }

        toast.success("保存成功");
        router.push(`/main/notes/${newNoteId}`);
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

// ==================== AI 助手功能 ====================

/**
 * 处理 AI 操作
 */
const handleAIAction = async (actionId: string) => {
  try {
    const quill = quillEditor.value?.getQuill();
    if (!quill) {
      toast.error("编辑器未就绪");
      return;
    }

    // 获取选中的文本或全部内容
    const selection = quill.getSelection();
    let content = "";

    if (selection && selection.length > 0) {
      // 有选中文本
      content = quill.getText(selection.index, selection.length);
    } else {
      // 没有选中，使用全部内容
      content = quill.getText();
    }

    if (!content.trim()) {
      toast.error("请先输入或选中内容");
      return;
    }

    // 调用 AI 服务
    const options = {
      noteId: isEdit.value ? parseInt(route.params.id as string) : undefined,
    };

    // 根据 actionId 调用对应的 AI 方法
    switch (actionId) {
      case "continue":
        await aiStore.continue(content, options);
        break;
      case "format":
        await aiStore.format(content, options);
        break;
      case "beautify":
        await aiStore.beautify(content, options);
        break;
      case "polish":
        await aiStore.polish(content, options);
        break;
      case "summarize":
        await aiStore.summarize(content, options);
        break;
      case "expand":
        await aiStore.expand(content, options);
        break;
      default:
        toast.error("未知的 AI 操作");
    }
  } catch (error: any) {
    console.error("AI 处理失败:", error);
    toast.error(error.message || "AI 处理失败，请重试");
  }
};

/**
 * 应用 AI 结果
 */
const applyAIResult = (result: string) => {
  try {
    const quill = quillEditor.value?.getQuill();
    if (!quill) return;

    const currentAction = aiStore.currentAction;
    const selection = quill.getSelection();

    // 对于"智能续写"和"内容扩写"，应该追加原内容
    const shouldAppendOriginal =
      currentAction === "continue" || currentAction === "expand";

    if (selection && selection.length > 0) {
      // 有选中文本的情况
      if (shouldAppendOriginal) {
        // 续写/扩写：保留原文 + 追加新内容
        const originalText = quill.getText(selection.index, selection.length);
        const combinedText = originalText + "\n\n" + result;
        quill.deleteText(selection.index, selection.length);
        quill.insertText(selection.index, combinedText);
        quill.setSelection(selection.index + combinedText.length);
      } else {
        // 润色/格式化/美化：直接替换选中文本
        quill.deleteText(selection.index, selection.length);
        quill.insertText(selection.index, result);
        quill.setSelection(selection.index + result.length);
      }
    } else {
      // 没有选中文本的情况（处理全文）
      if (shouldAppendOriginal) {
        // 续写/扩写：在原内容后追加
        const length = quill.getLength();
        quill.insertText(length - 1, "\n\n" + result);
        quill.setSelection(length + result.length);
      } else {
        // 润色/格式化/美化：替换全部内容
        const length = quill.getLength();
        quill.deleteText(0, length);
        quill.insertText(0, result);
        quill.setSelection(result.length);
      }
    }

    toast.success("已应用 AI 结果");

    // 关闭预览和 AI 面板
    aiStore.closePreview();
    aiStore.closePanel();
  } catch (error) {
    console.error("应用结果失败:", error);
    toast.error("应用结果失败");
  }
};

/**
 * 重新生成
 */
const regenerateAI = async () => {
  if (!aiStore.currentAction || !aiStore.originalContent) return;

  try {
    const action = aiStore.currentAction;
    const content = aiStore.originalContent;
    const options = {
      noteId: isEdit.value ? parseInt(route.params.id as string) : undefined,
    };

    // 根据当前操作重新生成
    switch (action) {
      case "continue":
        await aiStore.continue(content, options);
        break;
      case "format":
        await aiStore.format(content, options);
        break;
      case "beautify":
        await aiStore.beautify(content, options);
        break;
      case "polish":
        await aiStore.polish(content, options);
        break;
      case "summarize":
        await aiStore.summarize(content, options);
        break;
      case "expand":
        await aiStore.expand(content, options);
        break;
    }
  } catch (error: any) {
    toast.error(error.message || "重新生成失败");
  }
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

/* 浮动按钮动画 - 从眼睛按钮位置向上展开 */
/* 第一个按钮（图片） */
.slide-up-1-enter-active {
  transition: all 0.3s ease;
}

.slide-up-1-leave-active {
  transition: all 0.2s ease;
}

.slide-up-1-enter-from {
  opacity: 0;
  transform: translateY(68px) scale(0.3);
}

.slide-up-1-leave-to {
  opacity: 0;
  transform: translateY(68px) scale(0.3);
}

/* 第二个按钮（录音） */
.slide-up-2-enter-active {
  transition: all 0.3s ease 0.05s;
}

.slide-up-2-leave-active {
  transition: all 0.2s ease;
}

.slide-up-2-enter-from {
  opacity: 0;
  transform: translateY(68px) scale(0.3);
}

.slide-up-2-leave-to {
  opacity: 0;
  transform: translateY(68px) scale(0.3);
}

/* 第三个按钮（附件） */
.slide-up-3-enter-active {
  transition: all 0.3s ease 0.1s;
}

.slide-up-3-leave-active {
  transition: all 0.2s ease;
}

.slide-up-3-enter-from {
  opacity: 0;
  transform: translateY(68px) scale(0.3);
}

.slide-up-3-leave-to {
  opacity: 0;
  transform: translateY(68px) scale(0.3);
}

/* 第四个按钮（AI 助手） */
.slide-up-4-enter-active {
  transition: all 0.3s ease 0.15s;
}

.slide-up-4-leave-active {
  transition: all 0.2s ease;
}

.slide-up-4-enter-from {
  opacity: 0;
  transform: translateY(68px) scale(0.3);
}

.slide-up-4-leave-to {
  opacity: 0;
  transform: translateY(68px) scale(0.3);
}
</style>
