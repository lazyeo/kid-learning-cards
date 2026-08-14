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
- **AI 服务**: Cloudflare Workers AI 语音转写 + 多图像 Provider

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

### 启动完整开发环境

```bash
npm run dev:full
```

请访问 `http://localhost:3001`。该命令通过 Wrangler 运行 Pages Functions 和
Workers AI binding，使用 Wrangler 的 Cloudflare 登录态，不需要在项目中保存
Cloudflare API Token。如果只调试前端，仍可使用 `npm run dev`。
远程 Pages secret 的值不会被 Wrangler 下载；如果需要在本地调试图片
Provider，请将必要的值放入已被 Git 忽略的 `.dev.vars`。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

使用 Cloudflare Pages Functions 预览：

```bash
npm run build
npm run preview:cf
```

### Cloudflare 数据存储

生产环境使用 D1 `kids-learning-cards-db` 存储图片索引，使用 R2
`kids-learning-cards-images` 存储图片。`wrangler.toml` 是 binding 和
`STORAGE_BACKEND` 的配置来源。Supabase 数据和 secrets 暂时保留作为回退路径。

回退时将 `wrangler.toml` 中的 `STORAGE_BACKEND` 改为 `supabase`，重新构建并
执行 `npm run deploy:cf`。本地 `npm run dev:full` 会显式覆盖为 Supabase，
不会误写远程 D1/R2。

### AI 图片 Provider

默认图片生成顺序为 ListenHub/LabNana 主用，GPT Image 兼容接口作为第一
fallback：

```text
labnana → gpt-image → antigravity → modelscope → gemini → openai
```

GPT Image provider 使用独立的服务端环境变量，不会暴露到浏览器：

```bash
GPT_IMAGE_BASE_URL=https://your-compatible-api.example.com/v1
GPT_IMAGE_API_KEY=your-api-key
GPT_IMAGE_MODEL=gpt-image-2
```

`GPT_IMAGE_MODEL` 可省略，默认使用 `gpt-image-2`。Base URL 可以是服务根地址、
`/v1` 地址或完整的 `/v1/images/generations` 地址。只有 Base URL 和 API key
同时存在时 provider 才会注册。

需要调整主备顺序时设置服务端 `PROVIDER_PRIORITY`，例如未来将 GPT Image
切为主用：

```bash
PROVIDER_PRIORITY=gpt-image,labnana,antigravity,modelscope,gemini,openai
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
