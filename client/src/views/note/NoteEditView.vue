<template>
  <div
    class="bg-gray-50 dark:bg-gray-900 h-full flex flex-col transition-colors"
  >
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 transition-colors"
    >
      <div class="flex items-center justify-between">
        <button @click="goBack" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600 dark:text-gray-300"></i>
        </button>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ isEdit ? "编辑笔记" : "新建笔记" }}
        </h1>
        <button
          @click="saveNote"
          :disabled="saving"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {{ saving ? "保存中..." : "完成" }}
        </button>
      </div>
    </div>

    <!-- Title Input -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 transition-colors"
    >
      <input
        type="text"
        v-model="noteForm.title"
        placeholder="今天写点什么？"
        class="w-full text-xl font-semibold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none bg-transparent"
      />
    </div>

    <!-- Category and Tags -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex-shrink-0 transition-colors"
    >
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <i class="fas fa-folder text-gray-400 dark:text-gray-500"></i>
          <select
            v-model="noteForm.categoryId"
            class="text-sm text-gray-600 dark:text-gray-300 border-none outline-none bg-transparent"
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
          <i class="fas fa-tag text-gray-400 dark:text-gray-500"></i>
          <input
            type="text"
            v-model="tagInput"
            @keydown.enter="addTag"
            @keydown.space="addTag"
            placeholder="添加标签"
            class="text-sm text-gray-600 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none bg-transparent"
          />
        </div>
      </div>

      <!-- Tags Display -->
      <div v-if="noteForm.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
        <span
          v-for="(tag, index) in noteForm.tags"
          :key="index"
          class="inline-flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
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
    <div
      class="bg-white dark:bg-gray-800 flex-1 overflow-y-auto transition-colors"
      style="margin-bottom: 0"
    >
      <QuillEditor
        ref="quillEditor"
        :content="noteForm.content"
        contentType="html"
        :toolbar="toolbarOptions"
        placeholder="从这里开始..."
        theme="snow"
        @update:content="noteForm.content = $event"
        @ready="onEditorReady"
      />
    </div>

    <!-- 附件列表 -->
    <div
      v-if="attachments.length > 0"
      class="bg-white dark:bg-gray-800 px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 transition-colors"
      style="margin-right: 100px"
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
          @delete="handleDeleteAttachment"
          @preview="handlePreviewAttachment"
        />
      </div>
    </div>

    <!-- 智能悬浮球 - 可拖动的编辑工具 -->
    <div
      ref="floatingBall"
      class="edit-tools-fab"
      :class="{ active: showFloatingButtons, dragging: isDragging }"
      :style="floatingBallStyle"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      @mousedown="handleMouseDown"
    >
      <!-- 主按钮 -->
      <button
        @click="toggleFloatingMenu"
        class="fab-button"
        :title="showFloatingButtons ? '收起工具' : '编辑工具'"
      >
        <i class="fas fa-bolt fab-icon"></i>
      </button>

      <!-- 功能菜单 - 向上展开 -->
      <transition name="slide-up-menu">
        <div v-if="showFloatingButtons" class="tools-menu" @click.stop>
          <button @click="handleToolClick(toggleAIPanel)" class="tool-item">
            <div
              class="tool-icon-wrapper"
              style="background: rgba(91, 127, 242, 0.1)"
            >
              <i class="fas fa-magic" style="color: #5b7ff2"></i>
            </div>
            <span class="tool-label">AI 助手</span>
          </button>
          <button @click="handleToolClick(insertAttachment)" class="tool-item">
            <div
              class="tool-icon-wrapper"
              style="background: rgba(249, 115, 22, 0.1)"
            >
              <i class="fas fa-paperclip" style="color: #f97316"></i>
            </div>
            <span class="tool-label">上传附件</span>
          </button>
          <button @click="handleToolClick(insertAudio)" class="tool-item">
            <div
              class="tool-icon-wrapper"
              style="background: rgba(217, 93, 235, 0.1)"
            >
              <i class="fas fa-microphone" style="color: #d95deb"></i>
            </div>
            <span class="tool-label">录音</span>
          </button>
        </div>
      </transition>
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
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import { getCategories } from "@/api/category";
import type { Category } from "@/api/category";
import { createNote, getNoteById, updateNote } from "@/api/note";
import { deleteFile, getNoteAttachments, updateFilesNoteId } from "@/api/file";
import { toast } from "@/utils/toast";
import { uploadImageFile, uploadAttachmentFile } from "@/utils/fileUpload";
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
const showFloatingButtons = ref(false); // 控制浮动按钮显示/隐藏

// 智能悬浮球相关状态
const floatingBall = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const ballPosition = ref({
  x: window.innerWidth - 76, // 默认右侧，距离右边 20px
  y: window.innerHeight - 183, // 默认位置，避开导航栏
});

// 拖动相关变量
let startX = 0;
let startY = 0;
let startPosX = 0;
let startPosY = 0;
let hasMoved = false;

// 安全区域配置（避开导航栏等）
const safeArea = {
  top: 60,
  bottom: 100, // 导航栏高度 + 边距
  left: 20,
  right: 20,
};

// AI Store
const aiStore = useAIStore();

// 标题折叠清理函数
let cleanupHeadingCollapse: (() => void) | null = null;

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

// 计算悬浮球样式
const floatingBallStyle = computed(() => ({
  left: `${ballPosition.value.x}px`,
  top: `${ballPosition.value.y}px`,
}));

// 切换浮动菜单显示/隐藏
const toggleFloatingMenu = () => {
  if (!hasMoved) {
    showFloatingButtons.value = !showFloatingButtons.value;
  }
  hasMoved = false;
};

// 处理工具点击
const handleToolClick = (action: Function) => {
  action();
  showFloatingButtons.value = false;
};

// 触摸开始
const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0];
  startX = touch.clientX;
  startY = touch.clientY;
  startPosX = ballPosition.value.x;
  startPosY = ballPosition.value.y;
  isDragging.value = true;
  hasMoved = false;
};

// 触摸移动
const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  e.preventDefault();

  const touch = e.touches[0];
  const deltaX = touch.clientX - startX;
  const deltaY = touch.clientY - startY;

  // 判断是否移动
  if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
    hasMoved = true;
  }

  // 计算新位置
  let newX = startPosX + deltaX;
  let newY = startPosY + deltaY;

  // 限制在安全区域内
  const maxX = window.innerWidth - 56 - safeArea.right;
  const maxY = window.innerHeight - 56 - safeArea.bottom;

  newX = Math.max(safeArea.left, Math.min(newX, maxX));
  newY = Math.max(safeArea.top, Math.min(newY, maxY));

  ballPosition.value = { x: newX, y: newY };
};

// 触摸结束
const handleTouchEnd = () => {
  isDragging.value = false;
};

// 鼠标按下（PC端）
const handleMouseDown = (e: MouseEvent) => {
  if (e.button !== 0) return; // 只响应左键

  startX = e.clientX;
  startY = e.clientY;
  startPosX = ballPosition.value.x;
  startPosY = ballPosition.value.y;
  isDragging.value = true;
  hasMoved = false;

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // 判断是否移动
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      hasMoved = true;
    }

    // 计算新位置
    let newX = startPosX + deltaX;
    let newY = startPosY + deltaY;

    // 限制在安全区域内
    const maxX = window.innerWidth - 56 - safeArea.right;
    const maxY = window.innerHeight - 56 - safeArea.bottom;

    newX = Math.max(safeArea.left, Math.min(newX, maxX));
    newY = Math.max(safeArea.top, Math.min(newY, maxY));

    ballPosition.value = { x: newX, y: newY };
  };

  const handleMouseUp = () => {
    isDragging.value = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  document.addEventListener("mousemove", handleMouseMove);
  document.addEventListener("mouseup", handleMouseUp);
};

// 旧的切换函数（保留兼容性）
const toggleFloatingButtons = () => {
  showFloatingButtons.value = !showFloatingButtons.value;
};

// 节流版本的切换函数（500豪秒延迟）
const debouncedToggleFloatingButtons = throttle(toggleFloatingButtons, 500);

// 切换 AI 面板
const toggleAIPanel = () => {
  aiStore.togglePanel();
};

// Quill 工具栏配置
const toolbarOptions = [
  ["bold", "italic", "underline"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  [{ header: [1, 2, 3, 4, 5, 6, false] }], // 支持 H1-H6 标题
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["image"], // 添加图片按钮
  ["clean"],
];

onMounted(() => {
  loadCategories();
  if (isEdit.value) {
    loadNote();
  }
});

onBeforeUnmount(() => {
  // 清理标题折叠功能
  if (cleanupHeadingCollapse) {
    cleanupHeadingCollapse();
  }
});

const onEditorReady = () => {
  // 编辑器准备就绪
  console.log("编辑器已准备就绪");

  // 为工具栏按钮添加中文提示
  setTimeout(() => {
    addToolbarTooltips();
    setupImageUploadHandler();
    setupHeadingCollapse();
    setupFormatPersistence();
  }, 100);
};

// 设置格式持久化 - 解决点击格式按钮后输入文字格式消失的问题
const setupFormatPersistence = () => {
  const quill = quillEditor.value?.getQuill();
  if (!quill) return;

  // 保存当前格式状态
  let pendingFormats: any = {};

  // 获取工具栏按钮
  const boldButton = document.querySelector(".ql-bold");

  // 监听格式变化
  quill.on("selection-change", (range: any) => {
    if (range) {
      // 获取当前光标位置的格式
      const formats = quill.getFormat(range);

      // 检查是否在标题行
      const isInHeading = formats.header !== undefined;

      // 如果在标题行，禁用加粗按钮
      if (boldButton) {
        if (isInHeading) {
          boldButton.classList.add("ql-disabled");
          boldButton.setAttribute("disabled", "disabled");
          (boldButton as HTMLElement).style.opacity = "0.5";
          (boldButton as HTMLElement).style.cursor = "not-allowed";
        } else {
          boldButton.classList.remove("ql-disabled");
          boldButton.removeAttribute("disabled");
          (boldButton as HTMLElement).style.opacity = "";
          (boldButton as HTMLElement).style.cursor = "";
        }
      }

      // 如果没有选中文本（range.length === 0），保存格式状态
      if (range.length === 0 && !isInHeading) {
        pendingFormats = formats;
      }
    }
  });

  // 监听文本变化
  quill.on("text-change", (delta: any, oldDelta: any, source: string) => {
    if (source === "user") {
      const selection = quill.getSelection();
      if (selection && Object.keys(pendingFormats).length > 0) {
        // 获取当前格式
        const currentFormats = quill.getFormat(selection);

        // 如果不在标题行，应用保存的格式
        if (currentFormats.header === undefined) {
          // 合并格式
          Object.keys(pendingFormats).forEach((key) => {
            if (pendingFormats[key] && !currentFormats[key]) {
              quill.format(key, pendingFormats[key]);
            }
          });
        }
      }
    }
  });

  // 阻止在标题行中使用加粗功能
  if (boldButton) {
    boldButton.addEventListener(
      "click",
      (e) => {
        const selection = quill.getSelection();
        if (selection) {
          const formats = quill.getFormat(selection);
          if (formats.header !== undefined) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
      },
      true
    );
  }
};

// 设置标题折叠功能
const setupHeadingCollapse = () => {
  const quill = quillEditor.value?.getQuill();
  if (!quill) return;

  const editorElement = quill.root;
  if (editorElement) {
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
        toggleHeadingInEditor(heading);
        // 更新 tooltip 文字
        const isCollapsed = heading.classList.contains("collapsed");
        tooltip.textContent = isCollapsed ? "展开" : "收起";
      }
    };

    editorElement.addEventListener("click", handleHeadingClick);
    editorElement.addEventListener("mousemove", handleMouseMove);

    // 返回清理函数
    cleanupHeadingCollapse = () => {
      editorElement.removeEventListener("click", handleHeadingClick);
      editorElement.removeEventListener("mousemove", handleMouseMove);
      tooltip.remove();
    };
  }
};

// 在编辑器中切换标题折叠状态
const toggleHeadingInEditor = (heading: Element) => {
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

// 设置图片上传处理器
const setupImageUploadHandler = () => {
  const quill = quillEditor.value?.getQuill();
  if (!quill) return;

  // 获取工具栏中的图片按钮
  const toolbar = quill.getModule("toolbar");
  if (!toolbar) return;

  // 重写图片按钮的点击事件
  toolbar.addHandler("image", () => {
    // 创建文件选择器
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          // 上传图片到服务器，获取 URL
          const imageUrl = await uploadImageFile(file);

          // 获取当前光标位置
          const range = quill.getSelection(true);

          // 插入图片 URL 到编辑器
          quill.insertEmbed(range.index, "image", imageUrl);

          // 移动光标到图片后面
          quill.setSelection(range.index + 1);
        } catch (error) {
          console.error("图片上传失败:", error);
          // toast 已在 uploadImageFile 中处理
        }
      }
    };
  });
};

// 为工具栏按钮添加中文提示
const addToolbarTooltips = () => {
  // 按钮提示映射
  const tooltips: Record<string, string> = {
    ".ql-bold": "粗体 (Ctrl+B)",
    ".ql-italic": "斜体 (Ctrl+I)",
    ".ql-underline": "下划线 (Ctrl+U)",
    '.ql-list[value="ordered"]': "有序列表",
    '.ql-list[value="bullet"]': "无序列表",
    ".ql-blockquote": "引用",
    ".ql-code-block": "代码块",
    ".ql-image": "上传图片",
    ".ql-clean": "清除格式",
  };

  // 为按钮添加提示
  Object.entries(tooltips).forEach(([selector, title]) => {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute("title", title);
    }
  });

  // 为下拉选择器添加提示
  const pickers = [
    { selector: ".ql-header .ql-picker-label", title: "标题样式" },
    { selector: ".ql-color .ql-picker-label", title: "文字颜色" },
    { selector: ".ql-background .ql-picker-label", title: "背景颜色" },
    { selector: ".ql-align .ql-picker-label", title: "对齐方式" },
  ];

  pickers.forEach(({ selector, title }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute("title", title);
    }
  });
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
      try {
        // 上传附件到服务器/OSS
        const noteId = isEdit.value
          ? parseInt(route.params.id as string)
          : undefined;
        const fileData = await uploadAttachmentFile(file, noteId);

        // 添加到附件列表
        attachments.value.push(fileData);
      } catch (error: any) {
        console.error("附件上传失败:", error);
        // toast 已在 uploadAttachmentFile 中处理
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
        // 编辑完成后直接回退到上一页（详情页）
        // 详情页会自动重新加载最新数据
        router.back();
      } else {
        toast.error(response.data.message || "更新失败");
      }
    } else {
      // 新建笔记：先保存笔记，再关联附件
      const response = await createNote(noteData);

      if (response.data.success) {
        const newNoteId = response.data.data.id;

        // 如果有附件，关联到新创建���笔记
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

        toast.success("已保存");
        // 新建笔记使用 replace，避免返回到空白编辑页
        router.replace(`/main/notes/${newNoteId}`);
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

    // 对于续写和扩写操作，使用 Markdown 格式以保留样式
    const needsMarkdown = ["continue", "expand"].includes(actionId);

    if (needsMarkdown) {
      // 动态导入 Markdown 转换工具
      const { getMarkdownFromQuill } = await import("@/utils/quillToMarkdown");

      if (selection && selection.length > 0) {
        // 有选中文本
        content = getMarkdownFromQuill(
          quill,
          selection.index,
          selection.length
        );
      } else {
        // 没有选中，使用全部内容
        content = getMarkdownFromQuill(quill);
      }
    } else {
      // 其他操作使用纯文本
      if (selection && selection.length > 0) {
        content = quill.getText(selection.index, selection.length);
      } else {
        content = quill.getText();
      }
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
const applyAIResult = async (result: string) => {
  try {
    const quill = quillEditor.value?.getQuill();
    if (!quill) return;

    const currentAction = aiStore.currentAction;
    const selection = quill.getSelection();

    // 检查结果是否包含 Markdown 语法
    const hasMarkdownSyntax =
      /^#{1,6}\s|^\*\*|^\*|^-\s|^\d+\.\s|^>\s|```/m.test(result);

    // 对于格式优化、排版美化、内容润色、续写和扩写操作，都进行 Markdown 解析
    const shouldRenderMarkdown =
      ["format", "beautify", "polish", "continue", "expand"].includes(
        currentAction || ""
      ) || hasMarkdownSyntax;

    if (shouldRenderMarkdown) {
      // 使用统一的 markdown 工具解析
      const { parseMarkdownAsync } = await import("@/utils/markdown");
      const htmlContent = await parseMarkdownAsync(result);

      console.log("应用的HTML内容长度:", htmlContent.length);

      if (selection && selection.length > 0) {
        // 有选中文本的情况 - 直接替换选中文本
        quill.deleteText(selection.index, selection.length);
        quill.clipboard.dangerouslyPasteHTML(selection.index, htmlContent);
        // 设置光标到内容末尾，而不是只前进1个字符
        quill.setSelection(selection.index + htmlContent.length);
      } else {
        // 没有选中文本的情况（处理全文）- 替换全部内容
        const length = quill.getLength();
        quill.deleteText(0, length);
        quill.clipboard.dangerouslyPasteHTML(0, htmlContent);
        // 设置光标到内容末尾
        quill.setSelection(quill.getLength() - 1);
      }

      // 强制编辑器重新渲染并更新布局
      setTimeout(() => {
        const editorContainer = quill.root.parentElement;
        if (editorContainer) {
          editorContainer.scrollTop = 0;
        }
      }, 0);

      toast.success("搞定！文字更通顺了");

      // 关闭预览和 AI 面板
      aiStore.closePreview();
      aiStore.closePanel();
    } else {
      // 纯文本内容，直接插入
      console.log("应用的纯文本内容长度:", result.length);

      if (selection && selection.length > 0) {
        // 有选中文本的情况 - 直接替换选中文本
        quill.deleteText(selection.index, selection.length);
        quill.insertText(selection.index, result);
        quill.setSelection(selection.index + result.length);
      } else {
        // 没有选中文本的情况（处理全文）- 替换全部内容
        const length = quill.getLength();
        quill.deleteText(0, length);
        quill.insertText(0, result);
        // 设置光标到内容末尾
        quill.setSelection(result.length);
      }

      // 强制编辑器重新渲染并更新布局
      setTimeout(() => {
        const editorContainer = quill.root.parentElement;
        if (editorContainer) {
          editorContainer.scrollTop = 0;
        }
      }, 0);

      toast.success("搞定！文字更通顺了");

      // 关闭预览和 AI 面板
      aiStore.closePreview();
      aiStore.closePanel();
    }
  } catch (error) {
    console.error("应用结果失败:", error);
    toast.error("出了点问题，再试一次？");
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
  height: 100%;
  min-height: 300px;
  border: none !important;
}

/* 工具栏吸顶效果 */
.ql-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 暗色模式下的工具栏 - 使用 #1a1a1a 而非纯黑 */
.dark .ql-toolbar {
  background-color: #1a1a1a;
  border-color: #2d2d2d !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 工具栏按钮悬浮效果 */
.ql-toolbar button {
  transition: all 0.2s ease;
}

.ql-toolbar button:hover {
  background-color: #f3f4f6;
  border-radius: 4px;
}

.dark .ql-toolbar button:hover {
  background-color: #374151;
}

/* 工具栏按钮激活状态 */
.ql-toolbar button.ql-active {
  background-color: #e5e7eb;
  border-radius: 4px;
}

.dark .ql-toolbar button.ql-active {
  background-color: #4b5563;
}

/* 工具栏下拉选择器悬浮效果 */
.ql-toolbar .ql-picker-label:hover {
  background-color: #f3f4f6;
  border-radius: 4px;
}

.dark .ql-toolbar .ql-picker-label:hover {
  background-color: #374151;
}

.ql-editor {
  min-height: calc(100vh - 350px);
  padding: 20px;
  padding-bottom: 100px;
  border: none !important;
}

.ql-editor.ql-blank::before {
  color: #9ca3af;
  font-style: normal;
  left: 62px;
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

/* 标题折叠按钮样式 - 只在悬停时显示 */
.ql-editor h1,
.ql-editor h2,
.ql-editor h3,
.ql-editor h4,
.ql-editor h5,
.ql-editor h6 {
  position: relative;
  padding-left: 42px;
  margin-left: 0;
  transition: background-color 0.2s ease;
  font-weight: bold !important;
}

/* 正文内容与标题对齐 */
.ql-editor p,
.ql-editor ul,
.ql-editor ol,
.ql-editor blockquote,
.ql-editor pre,
.ql-editor table {
  margin-left: 42px;
}

.ql-editor h1:hover,
.ql-editor h2:hover,
.ql-editor h3:hover,
.ql-editor h4:hover,
.ql-editor h5:hover,
.ql-editor h6:hover {
  background-color: rgba(59, 130, 246, 0.05);
  border-radius: 4px;
}

.dark .ql-editor h1:hover,
.dark .ql-editor h2:hover,
.dark .ql-editor h3:hover,
.dark .ql-editor h4:hover,
.dark .ql-editor h5:hover,
.dark .ql-editor h6:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

/* 标题级别标签 - 默认隐藏，悬停时显示，在最左边 */
.ql-editor h1::before {
  content: "H1";
}

.ql-editor h2::before {
  content: "H2";
}

.ql-editor h3::before {
  content: "H3";
}

.ql-editor h4::before {
  content: "H4";
}

.ql-editor h5::before {
  content: "H5";
}

.ql-editor h6::before {
  content: "H6";
}

.ql-editor h1::before,
.ql-editor h2::before,
.ql-editor h3::before,
.ql-editor h4::before,
.ql-editor h5::before,
.ql-editor h6::before {
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

.ql-editor h1:hover::before,
.ql-editor h2:hover::before,
.ql-editor h3:hover::before,
.ql-editor h4:hover::before,
.ql-editor h5:hover::before,
.ql-editor h6:hover::before {
  opacity: 1;
}

/* 折叠按钮 - 默认隐藏，悬停时显示，在 H 标签右边 */
.ql-editor h1::after,
.ql-editor h2::after,
.ql-editor h3::after,
.ql-editor h4::after,
.ql-editor h5::after,
.ql-editor h6::after {
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

.ql-editor h1:hover::after,
.ql-editor h2:hover::after,
.ql-editor h3:hover::after,
.ql-editor h4:hover::after,
.ql-editor h5:hover::after,
.ql-editor h6:hover::after {
  opacity: 1;
}

.ql-editor h1::after:hover,
.ql-editor h2::after:hover,
.ql-editor h3::after:hover,
.ql-editor h4::after:hover,
.ql-editor h5::after:hover,
.ql-editor h6::after:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

/* 折叠状态的标题 - 箭头向右，且始终显示 */
.ql-editor h1.collapsed::before,
.ql-editor h2.collapsed::before,
.ql-editor h3.collapsed::before,
.ql-editor h4.collapsed::before,
.ql-editor h5.collapsed::before,
.ql-editor h6.collapsed::before {
  opacity: 1;
}

.ql-editor h1.collapsed::after,
.ql-editor h2.collapsed::after,
.ql-editor h3.collapsed::after,
.ql-editor h4.collapsed::after,
.ql-editor h5.collapsed::after,
.ql-editor h6.collapsed::after {
  content: "\f054"; /* Font Awesome chevron-right */
  opacity: 1;
}

.ql-editor h1.collapsed,
.ql-editor h2.collapsed,
.ql-editor h3.collapsed,
.ql-editor h4.collapsed,
.ql-editor h5.collapsed,
.ql-editor h6.collapsed {
  margin-bottom: 0.5em;
}

/* 暗色模式下的样式 */
.dark .ql-editor h1::before,
.dark .ql-editor h2::before,
.dark .ql-editor h3::before,
.dark .ql-editor h4::before,
.dark .ql-editor h5::before,
.dark .ql-editor h6::before {
  color: #6b7280;
}

.dark .ql-editor h1::after,
.dark .ql-editor h2::after,
.dark .ql-editor h3::after,
.dark .ql-editor h4::after,
.dark .ql-editor h5::after,
.dark .ql-editor h6::after {
  color: #60a5fa;
}

.dark .ql-editor h1::after:hover,
.dark .ql-editor h2::after:hover,
.dark .ql-editor h3::after:hover,
.dark .ql-editor h4::after:hover,
.dark .ql-editor h5::after:hover,
.dark .ql-editor h6::after:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

/* 浮动按钮动画 - 从眼睛按钮位置向上展开 */
/* 第一个按钮（录音） */
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

/* 第二个按钮（附件） */
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

/* 第三个按钮（AI 助手） */
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

/* 智能悬浮球样式 */
.edit-tools-fab {
  position: fixed;
  z-index: 999;
  width: 56px;
  height: 56px;
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.edit-tools-fab.dragging {
  cursor: grabbing;
}

.edit-tools-fab.dragging .fab-button {
  transform: scale(1.1);
}

/* 主按钮 */
.fab-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.dark .fab-button {
  background: #4b5563;
  box-shadow: 0 4px 12px rgba(75, 85, 99, 0.4);
}

.fab-button:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.5);
}

.dark .fab-button:hover {
  box-shadow: 0 6px 16px rgba(75, 85, 99, 0.5);
}

.fab-button:active {
  transform: scale(0.95);
}

/* 图标旋转动画 */
.fab-icon {
  font-size: 20px;
  color: white;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.edit-tools-fab.active .fab-icon {
  transform: rotate(45deg);
}

/* 工具菜单 */
.tools-menu {
  position: absolute;
  bottom: 68px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  min-width: 160px;
  z-index: 1;
}

.dark .tools-menu {
  background: #1f2937;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

/* 工具项 */
.tool-item {
  width: 100%;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease-out;
  text-align: left;
}

.tool-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .tool-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.tool-item:active {
  transform: scale(0.98);
}

/* 工具图标 */
.tool-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.tool-icon-wrapper i {
  font-size: 16px;
}

/* 工具标签 */
.tool-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.dark .tool-label {
  color: #e5e7eb;
}

/* 菜单展开动画 */
.slide-up-menu-enter-active {
  animation: slideUpMenu 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-menu-leave-active {
  animation: slideUpMenu 0.2s cubic-bezier(0.4, 0, 0.2, 1) reverse;
}

@keyframes slideUpMenu {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tools-menu {
    min-width: 140px;
  }

  .tool-label {
    font-size: 13px;
  }

  .tool-icon-wrapper {
    width: 28px;
    height: 28px;
    margin-right: 10px;
  }

  .tool-icon-wrapper i {
    font-size: 14px;
  }
}
</style>
