# Findings & Decisions - 生图模块重构

## Requirements
<!-- 用户核心需求 -->
- 生图模块应该是一个相对独立的接口
- 系统通过提示词调用出图
- 图片需要保存并有缓存机制
- 生图模块内部处理 provider 选择和调度
- 考虑 netlify + supabase 的部署环境
- 考虑未来继续拓展的可能性

## Research Findings

### 现有架构分析

**目录结构:**
```
src/services/ai/
├── types.ts                    # 接口定义
├── config.ts                   # 工厂函数和默认策略
├── imageGenerator.ts           # 主控制器
├── providerScheduler.ts        # 优先级调度器
├── providers/
│   ├── antigravity.ts
│   ├── modelscope.ts
│   ├── openai.ts
│   ├── gemini.ts
│   └── index.ts
└── utils/
    └── promptBuilder.ts

src/services/cache/
└── imageCache.ts               # Supabase 缓存服务

src/services/storage/
└── imageStorage.ts             # Supabase 存储服务
```

**问题识别:**
1. **缓存逻辑重复** - `dev-server.js` 和 `generate-image.ts` 各自实现
2. **Provider 初始化分散** - 后端两个文件各自初始化
3. **类型不一致** - `generate()` 返回 `string` vs `GenerationResult`
4. **环境变量耦合** - `config.ts` 使用 `import.meta.env`，Node.js 无法运行

### 关键代码分析

**ProviderScheduler (providerScheduler.ts):**
- 管理多 Provider 优先级
- 自动降级机制
- 全局超时控制
- 返回 `GenerationResult` 类型

**ImageCacheService (imageCache.ts):**
- SHA-256 hash 算法生成缓存 key
- 精确匹配查询
- 访问计数统计
- 自动清理过期缓存

**缓存 Key 算法 (必须保持兼容):**
```typescript
const normalized = JSON.stringify({
  theme: (params.theme || '').toLowerCase().trim(),
  subject: (params.subject || '').toLowerCase().trim(),
  difficulty: params.difficulty,
  customPrompt: (params.customPrompt || '').toLowerCase().trim()
});
// SHA-256 hash
```

### Provider 默认策略
```typescript
DEFAULT_PROVIDER_STRATEGY = {
  priorities: [
    { id: 'antigravity', priority: 0, enabled: true, timeout: 60000 },
    { id: 'modelscope', priority: 1, enabled: false, timeout: 120000 }, // CORS
    { id: 'openai', priority: 2, enabled: true, timeout: 60000 },
    { id: 'gemini', priority: 3, enabled: true, timeout: 60000 },
  ],
  autoFallback: true,
  globalTimeout: 180000,
}
```

## Technical Decisions

| Decision | Rationale |
|----------|-----------|
| 新建 `src/services/image/` 目录 | 与旧代码并存，渐进式迁移 |
| 使用 Adapter 模式 | 便于测试 mock，易于替换实现 |
| 工厂函数分离环境 | `createBrowserImageService()` vs `createNodeImageService()` |
| 保持 hash 算法不变 | 现有缓存数据继续有效 |
| GenerateResult 作为统一返回类型 | 消除 string vs object 混用 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| ModelScope CORS 限制 | 必须通过后端代理，前端默认禁用 |
| import.meta.env 在 Node.js 不可用 | 使用工厂函数区分环境 |

## Resources

**核心文件路径:**
- `/Users/flash/Claude/projects/kids-learning-cards/src/services/ai/providerScheduler.ts`
- `/Users/flash/Claude/projects/kids-learning-cards/src/services/cache/imageCache.ts`
- `/Users/flash/Claude/projects/kids-learning-cards/src/services/ai/types.ts`
- `/Users/flash/Claude/projects/kids-learning-cards/netlify/functions/generate-image.ts`
- `/Users/flash/Claude/projects/kids-learning-cards/dev-server.js`

**新模块目标结构:**
```
src/services/image/
├── index.ts                         # 公共导出
├── ImageService.ts                  # 主服务类
├── types.ts                         # 类型定义
├── cache/
│   ├── CacheManager.ts
│   ├── CacheAdapter.ts
│   ├── SupabaseCacheAdapter.ts
│   └── NoOpCacheAdapter.ts
├── storage/
│   ├── StorageManager.ts
│   ├── StorageAdapter.ts
│   ├── SupabaseStorageAdapter.ts
│   └── NoOpStorageAdapter.ts
├── providers/
│   ├── ProviderOrchestrator.ts
│   └── ProviderAdapter.ts
└── config/
    └── factory.ts
```

## Visual/Browser Findings
<!-- 暂无浏览器/视觉相关发现 -->
-

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
