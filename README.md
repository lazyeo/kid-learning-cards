# Kids Learning Cards

一个使用 AI 生成儿童教育资源的 Web 应用。

## 项目简介

本项目旨在通过 AI 技术为儿童生成各类学习资源，包括：

- **涂色卡片**: 使用 AI 图像生成技术创建适合儿童涂色的线稿图片
- **数学练习**: 自动生成加减乘除等数学练习题
- **英文练习**: 生成英文单词、句子书写和阅读练习
- **书写练习**: 创建各类书写练习模板和工作表

## 技术栈

- **前端框架**: React 19 + TypeScript
- **样式系统**: Tailwind CSS v4
- **构建工具**: Vite
- **AI 服务**: 待集成 (OpenAI DALL-E / Stability AI / 其他)

## 项目结构

```
src/
├── components/     # 可复用 UI 组件
├── pages/          # 页面组件
├── services/       # API 服务层 (AI 接口调用)
├── hooks/          # 自定义 React Hooks
├── types/          # TypeScript 类型定义
└── utils/          # 工具函数
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 项目状态

🚀 **规划中** - 项目架构设计阶段

## 后续计划

1. 设计用户界面和交互流程
2. 集成 AI 图像生成 API
3. 实现涂色卡片生成功能
4. 添加数学和英文练习生成器
5. 优化用户体验和响应速度

## License

MIT
