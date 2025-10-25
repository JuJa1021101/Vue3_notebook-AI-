<template>
  <div class="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <div
      class="bg-white dark:bg-gray-800 px-4 py-3 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10"
    >
      <div class="flex items-center justify-between">
        <button @click="$router.back()" class="p-2 -ml-2">
          <i class="fas fa-arrow-left text-gray-600 dark:text-gray-300"></i>
        </button>
        <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
          主题设置
        </h1>
        <div class="w-10"></div>
      </div>
    </div>

    <!-- Theme Mode -->
    <div class="px-4 py-4">
      <h3
        class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1"
      >
        外观模式
      </h3>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <div
          v-for="(mode, index) in themeModes"
          :key="mode.value"
          @click="selectThemeMode(mode.value)"
          class="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
          :class="{
            'border-b border-gray-100 dark:border-gray-700':
              index < themeModes.length - 1,
            'bg-blue-50 dark:bg-blue-900/30':
              themeStore.settings.themeMode === mode.value,
          }"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="
                themeStore.settings.themeMode === mode.value
                  ? 'bg-blue-100 dark:bg-blue-900'
                  : 'bg-gray-100 dark:bg-gray-700'
              "
            >
              <i
                :class="mode.icon"
                :style="{
                  color:
                    themeStore.settings.themeMode === mode.value
                      ? '#3b82f6'
                      : '',
                }"
                class="text-gray-400 dark:text-gray-500"
              ></i>
            </div>
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white">
                {{ mode.label }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ mode.description }}
              </p>
            </div>
          </div>
          <div
            v-if="themeStore.settings.themeMode === mode.value"
            class="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center"
          >
            <i class="fas fa-check text-white text-xs"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Theme Colors -->
    <div class="px-4 py-4">
      <h3
        class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1"
      >
        主题色
      </h3>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
      >
        <div class="grid grid-cols-5 gap-3">
          <div
            v-for="color in themeColors"
            :key="color.value"
            @click="selectThemeColor(color.value)"
            class="relative cursor-pointer"
          >
            <div
              class="w-12 h-12 rounded-full mx-auto transition-transform"
              :style="{ backgroundColor: color.color }"
              :class="{
                'scale-110 ring-2 ring-offset-2 dark:ring-offset-gray-900':
                  themeStore.settings.themeColor === color.value,
              }"
              :data-ring-color="color.color"
            ></div>
            <div
              v-if="themeStore.settings.themeColor === color.value"
              class="absolute top-0 right-0 w-4 h-4 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-md"
            >
              <i
                class="fas fa-check text-xs"
                :style="{ color: color.color }"
              ></i>
            </div>
            <p
              class="text-xs text-gray-600 dark:text-gray-400 text-center mt-1"
            >
              {{ color.label }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Font Settings -->
    <div class="px-4 py-4">
      <h3
        class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1"
      >
        字体设置
      </h3>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <!-- Font Size -->
        <div class="p-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-700 dark:text-gray-300">字体大小</span>
            <span class="text-sm text-blue-600">{{ fontSizeLabel }}</span>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-xs text-gray-500 dark:text-gray-400">A</span>
            <input
              v-model="themeStore.settings.fontSize"
              type="range"
              min="12"
              max="20"
              step="2"
              class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span class="text-base text-gray-500 dark:text-gray-400">A</span>
          </div>
        </div>

        <!-- Font Family -->
        <div class="p-4">
          <div class="flex items-center justify-between">
            <span class="text-gray-700 dark:text-gray-300">字体</span>
            <select
              v-model="themeStore.settings.fontFamily"
              class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="system">系统默认</option>
              <option value="serif">衬线体</option>
              <option value="sans">无衬线体</option>
              <option value="mono">等宽字体</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Settings -->
    <div class="px-4 py-4">
      <h3
        class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1"
      >
        编辑器设置
      </h3>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
      >
        <!-- Line Height -->
        <div class="p-4 border-b border-gray-100 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <span class="text-gray-700 dark:text-gray-300">行间距</span>
            <span class="text-sm text-blue-600">{{ lineHeightLabel }}</span>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-xs text-gray-500 dark:text-gray-400">紧凑</span>
            <input
              v-model="themeStore.settings.lineHeight"
              type="range"
              min="1.2"
              max="2.0"
              step="0.2"
              class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span class="text-xs text-gray-500 dark:text-gray-400">宽松</span>
          </div>
        </div>

        <!-- Show Line Numbers -->
        <div
          class="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between"
        >
          <div>
            <div class="text-gray-700 dark:text-gray-300">显示行号</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              在编辑器中显示行号
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="themeStore.settings.showLineNumbers"
              type="checkbox"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>

        <!-- Auto Save -->
        <div class="p-4 flex items-center justify-between">
          <div>
            <div class="text-gray-700 dark:text-gray-300">自动保存</div>
            <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              编辑时自动保存笔记
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              v-model="themeStore.settings.autoSave"
              type="checkbox"
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Preview -->
    <div class="px-4 py-4">
      <h3
        class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-1"
      >
        预览效果
      </h3>
      <div
        class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4"
      >
        <div
          class="preview-text"
          :style="{
            fontSize: themeStore.settings.fontSize + 'px',
            lineHeight: themeStore.settings.lineHeight,
            fontFamily: getFontFamily(themeStore.settings.fontFamily),
          }"
        >
          <h4 class="font-semibold mb-2 text-gray-900 dark:text-white">
            示例标题
          </h4>
          <p class="text-gray-600 dark:text-gray-400">
            这是一段示例文本，用于预览当前的字体设置效果。您可以调整字体大小、字体类型和行间距来获得最佳的阅读体验。
          </p>
        </div>
      </div>
    </div>

    <!-- Reset Button -->
    <div class="px-4 py-4 pb-8">
      <button
        @click="resetSettings"
        class="w-full py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <i class="fas fa-undo mr-2"></i>
        恢复默认设置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useThemeStore } from "@/stores/theme";
import { toast } from "@/utils/toast";

const themeStore = useThemeStore();

// 主题模式选项
const themeModes = [
  {
    value: "light",
    label: "浅色模式",
    description: "适合白天使用",
    icon: "fas fa-sun",
  },
  {
    value: "dark",
    label: "深色模式",
    description: "适合夜间使用",
    icon: "fas fa-moon",
  },
  {
    value: "auto",
    label: "跟随系统",
    description: "根据系统设置自动切换",
    icon: "fas fa-adjust",
  },
];

// 主题色选项
const themeColors = [
  { value: "blue", label: "蓝色", color: "#3b82f6" },
  { value: "purple", label: "紫色", color: "#8b5cf6" },
  { value: "green", label: "绿色", color: "#10b981" },
  { value: "orange", label: "橙色", color: "#f59e0b" },
  { value: "pink", label: "粉色", color: "#ec4899" },
];

// 计算字体大小标签
const fontSizeLabel = computed(() => {
  const sizeMap: Record<number, string> = {
    12: "极小",
    14: "小",
    16: "标准",
    18: "大",
    20: "极大",
  };
  return sizeMap[themeStore.settings.fontSize] || "标准";
});

// 计算行高标签
const lineHeightLabel = computed(() => {
  const height = themeStore.settings.lineHeight;
  if (height <= 1.4) return "紧凑";
  if (height <= 1.6) return "标准";
  if (height <= 1.8) return "舒适";
  return "宽松";
});

// 获取字体族
const getFontFamily = (family: string) => {
  const fontMap: Record<string, string> = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    serif: 'Georgia, "Times New Roman", serif',
    sans: "Arial, Helvetica, sans-serif",
    mono: '"Courier New", Courier, monospace',
  };
  return fontMap[family] || fontMap.system;
};

// 选择主题模式
const selectThemeMode = (mode: string) => {
  themeStore.updateSettings({ themeMode: mode as any });
  toast.success(`已切换到${themeModes.find((m) => m.value === mode)?.label}`);
};

// 选择主题色
const selectThemeColor = (color: string) => {
  themeStore.updateSettings({ themeColor: color });
  toast.success(
    `已切换到${themeColors.find((c) => c.value === color)?.label}主题`
  );
};

// 恢复默认设置
const resetSettings = () => {
  themeStore.resetSettings();
  toast.success("已恢复默认设置");
};
</script>

<style scoped>
/* 滑块样式 */
.slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #3b82f6;
  cursor: pointer;
  border-radius: 50%;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 主题色选中时的环形效果 */
[data-ring-color] {
  transition: all 0.2s ease;
}

.scale-110[data-ring-color="#3b82f6"] {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #3b82f6;
}

.dark .scale-110[data-ring-color="#3b82f6"] {
  box-shadow: 0 0 0 2px rgb(17 24 39), 0 0 0 4px #3b82f6;
}

.scale-110[data-ring-color="#8b5cf6"] {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #8b5cf6;
}

.dark .scale-110[data-ring-color="#8b5cf6"] {
  box-shadow: 0 0 0 2px rgb(17 24 39), 0 0 0 4px #8b5cf6;
}

.scale-110[data-ring-color="#10b981"] {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #10b981;
}

.dark .scale-110[data-ring-color="#10b981"] {
  box-shadow: 0 0 0 2px rgb(17 24 39), 0 0 0 4px #10b981;
}

.scale-110[data-ring-color="#f59e0b"] {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #f59e0b;
}

.dark .scale-110[data-ring-color="#f59e0b"] {
  box-shadow: 0 0 0 2px rgb(17 24 39), 0 0 0 4px #f59e0b;
}

.scale-110[data-ring-color="#ec4899"] {
  box-shadow: 0 0 0 2px white, 0 0 0 4px #ec4899;
}

.dark .scale-110[data-ring-color="#ec4899"] {
  box-shadow: 0 0 0 2px rgb(17 24 39), 0 0 0 4px #ec4899;
}
</style>
