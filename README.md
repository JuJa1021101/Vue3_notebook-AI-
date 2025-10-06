# Vue3 智能笔记应用

一个基于 Vue3 + Koa2 的现代化笔记管理系统，支持富文本编辑、图片上传、分类管理、标签系统等功能。未来将集成 AI 续写功能，让笔记创作更智能。

## ✨ 功能特性

### 已实现功能
- 🔐 用户注册/登录系统（JWT 认证）
- 📝 富文本编辑器（基于 Quill）
- 🖼️ 图片上传与管理
- 📁 笔记分类管理
- 🏷️ 标签系统
- 🔍 全文搜索
- 📱 响应式设计（移动端适配）
- 🎨 自定义分类图标和颜色
- 🗑️ 软删除机制
- 📸 缩略图自动提取

### 即将推出
- 🤖 AI 智能续写功能
- 📊 数据统计与可视化
- 🔄 笔记版本管理
- 📤 导出功能（PDF/Markdown）

## 🛠️ 技术栈

### 前端
- Vue 3.4 + TypeScript
- Vite 5.0
- Vue Router 4.2
- Pinia 2.1（状态管理）
- Vant 4.9（移动端 UI 组件库）
- Quill（富文本编辑器）
- Tailwind CSS + Less
- Axios（HTTP 客户端）

### 后端
- Node.js + Koa 2
- MySQL 8.0+
- Sequelize（ORM）
- JWT（身份认证）
- Multer（文件上传）
- Sharp（图片处理）
- Winston（日志管理）

## 📋 环境要求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm 或 yarn

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/JuJa1021101/Vue3_notebook-AI-.git
cd Vue3_notebook-AI-
```

### 2. 数据库配置

创建 MySQL 数据库：

```sql
CREATE DATABASE personal_notes CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

导入数据库架构：

```bash
mysql -u root -p personal_notes < server/db_schema.sql
```

### 3. 后端配置

进入后端目录并安装依赖：

```bash
cd server
npm install
```

配置环境变量：

```bash
copy .env.example .env
```

编辑 `.env` 文件，填入你的配置：

```env
NODE_ENV=development
PORT=5000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=personal_notes
DB_USER=root
DB_PASSWORD=你的数据库密码

# JWT配置
JWT_SECRET=你的JWT密钥（建议使用随机字符串）
JWT_EXPIRES_IN=7d

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp

# 日志配置
LOG_LEVEL=info
```

启动后端服务：

```bash
npm run dev
```

后端服务将运行在 `http://localhost:5000`

### 4. 前端配置

打开新终端，进入前端目录并安装依赖：

```bash
cd client
npm install
```

启动前端开发服务器：

```bash
npm run dev
```

前端应用将自动在浏览器中打开 `http://localhost:5173`

## 📁 项目结构

```
Vue3_notebook-AI-/
├── client/                 # 前端项目
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── assets/        # 静态资源
│   │   ├── components/    # 公共组件
│   │   ├── router/        # 路由配置
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── types/         # TypeScript 类型定义
│   │   ├── utils/         # 工具函数
│   │   └── views/         # 页面组件
│   ├── package.json
│   └── vite.config.ts
│
├── server/                # 后端项目
│   ├── src/
│   │   ├── config/        # 配置文件
│   │   ├── controllers/   # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── services/      # 业务逻辑
│   │   └── utils/         # 工具函数
│   ├── uploads/           # 上传文件目录
│   ├── logs/              # 日志目录
│   ├── .env.example       # 环境变量示例
│   ├── db_schema.sql      # 数据库架构
│   └── package.json
│
└── README.md
```

## 🔑 核心功能说明

### 用户认证
- 注册时自动创建默认分类
- JWT Token 认证机制
- 密码加密存储（bcrypt）

### 笔记管理
- 支持富文本编辑（标题、列表、代码块等）
- 图片直接粘贴上传
- 自动提取缩略图
- 软删除机制（30天后物理删除）

### 分类系统
- 自定义分类名称、图标、颜色
- 分类不可删除（保护数据完整性）
- 每个用户独立的分类空间

### 标签系统
- 灵活的标签管理
- 多标签关联
- 标签搜索和筛选

### 文件上传
- 支持多种图片格式
- 自动压缩和优化
- 文件大小限制（默认 5MB）

## 🧪 测试

后端提供了多个测试脚本：

```bash
# 测试认证 API
npm run test:auth

# 测试分类 API
npm run test:category

# 测试笔记 API
npm run test:note

# 测试文件上传
npm run test:file
```

## 📝 API 文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 笔记接口
- `GET /api/notes` - 获取笔记列表
- `POST /api/notes` - 创建笔记
- `GET /api/notes/:id` - 获取笔记详情
- `PUT /api/notes/:id` - 更新笔记
- `DELETE /api/notes/:id` - 删除笔记（软删除）

### 分类接口
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类
- `PUT /api/categories/:id` - 更新分类

### 标签接口
- `GET /api/tags` - 获取标签列表
- `POST /api/tags` - 创建标签
- `DELETE /api/tags/:id` - 删除标签

### 文件接口
- `POST /api/files/upload` - 上传文件

## 🔮 未来规划

### AI 续写功能
- 集成大语言模型 API
- 智能内容补全
- 写作风格学习
- 多语言支持

### 其他功能
- 笔记分享功能
- 协作编辑
- 云端同步
- 移动端 APP

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目采用 MIT 协议开源

## 👨‍💻 作者

JuJa1021101

## 🙏 致谢

感谢所有开源项目的贡献者们！

---

如有问题或建议，欢迎提交 Issue 或联系作者。
