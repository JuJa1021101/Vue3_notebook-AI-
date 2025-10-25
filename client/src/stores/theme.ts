import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

export interface ThemeSettings {
  themeMode: 'light' | 'dark' | 'auto';
  themeColor: string;
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  showLineNumbers: boolean;
  autoSave: boolean;
}

export const useThemeStore = defineStore('theme', () => {
  // 默认设置
  const defaultSettings: ThemeSettings = {
    themeMode: 'light',
    themeColor: 'blue',
    fontSize: 16,
    fontFamily: 'system',
    lineHeight: 1.6,
    showLineNumbers: false,
    autoSave: true
  };

  // 当前设置
  const settings = ref<ThemeSettings>({ ...defaultSettings });

  // 当前实际主题（考虑 auto 模式）
  const currentTheme = computed(() => {
    if (settings.value.themeMode === 'auto') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return settings.value.themeMode;
  });

  // 是否为深色模式
  const isDark = computed(() => currentTheme.value === 'dark');

  // 加载设置
  const loadSettings = () => {
    const saved = localStorage.getItem('themeSettings');
    if (saved) {
      try {
        settings.value = { ...defaultSettings, ...JSON.parse(saved) };
      } catch (error) {
        console.error('加载主题设置失败:', error);
      }
    }
    applyTheme();
  };

  // 保存设置
  const saveSettings = () => {
    localStorage.setItem('themeSettings', JSON.stringify(settings.value));
    applyTheme();
  };

  // 应用主题到 DOM
  const applyTheme = () => {
    const html = document.documentElement;

    // 应用深色模式
    if (isDark.value) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    // 应用字体大小（基础字体大小）
    html.style.fontSize = `${settings.value.fontSize}px`;

    // 应用行间距
    html.style.setProperty('--line-height', settings.value.lineHeight.toString());

    // 应用主题色（可以通过 CSS 变量）
    const colorMap: Record<string, string> = {
      blue: '#3b82f6',
      purple: '#8b5cf6',
      green: '#10b981',
      orange: '#f59e0b',
      pink: '#ec4899'
    };
    html.style.setProperty('--theme-color', colorMap[settings.value.themeColor] || colorMap.blue);

    // 应用字体族
    const fontMap: Record<string, string> = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      serif: 'Georgia, "Times New Roman", serif',
      sans: 'Arial, Helvetica, sans-serif',
      mono: '"Courier New", Courier, monospace'
    };
    html.style.setProperty('--font-family', fontMap[settings.value.fontFamily] || fontMap.system);
  };

  // 更新设置
  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    settings.value = { ...settings.value, ...newSettings };
    saveSettings();
  };

  // 重置设置
  const resetSettings = () => {
    settings.value = { ...defaultSettings };
    saveSettings();
  };

  // 监听系统主题变化
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      if (settings.value.themeMode === 'auto') {
        applyTheme();
      }
    });
  }

  // 监听设置变化
  watch(settings, () => {
    saveSettings();
  }, { deep: true });

  return {
    settings,
    currentTheme,
    isDark,
    loadSettings,
    saveSettings,
    updateSettings,
    resetSettings,
    applyTheme
  };
});
