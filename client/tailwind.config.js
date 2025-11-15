/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 自定义品牌色系 - 避免使用标准Tailwind色值
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a5bbfc',
          400: '#8199f8',
          500: '#5b7ff2',  // 主色调 - 偏向 #5b7ff2 而非标准蓝
          600: '#4a68d6',
          700: '#3b52b0',
          800: '#2f4189',
          900: '#283665',
        },
        accent: {
          50: '#fef5ff',
          100: '#fce9ff',
          200: '#f9d4ff',
          300: '#f5b3ff',
          400: '#ee88ff',
          500: '#d95deb',  // 强调色 - 自定义紫色
          600: '#b83fc7',
          700: '#9629a0',
          800: '#762380',
          900: '#5f1f66',
        },
        success: {
          50: '#f0fdf5',
          100: '#dcfce8',
          200: '#bbf7d1',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // 成功色 - 微调的绿色
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e8e8e8',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // 暗黑模式专用颜色
        dark: {
          bg: '#1a1a1a',      // 背景色，不用纯黑
          surface: '#2d2d2d',  // 卡片背景
          border: '#3d3d3d',   // 边框
          text: '#e5e5e5',     // 文字，不用纯白
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        // 减少过度圆角
        'lg': '10px',    // 主要卡片用 10px
        'xl': '12px',    // 次要卡片用 12px
        '2xl': '14px',   // 特殊元素用 14px
      },
      boxShadow: {
        // 更自然的阴影 - 避免过度保护
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.08)',
        'DEFAULT': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 20px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
