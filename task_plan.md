# Task Plan: 生图模块重构 - ImageService 统一入口

## Goal
将分散的生图逻辑（Provider调度、缓存、存储）统一为独立的 `ImageService` 模块，对外提供简洁的 `generate(prompt, options)` 接口，内部封装所有复杂性。

## Current Phase
Phase 1

## Phases

### Phase 1: 基础架构搭建
- [ ] 创建 `src/services/image/` 目录结构
- [ ] 定义 `types.ts` 所有接口类型
- [ ] 创建 Adapter 接口 (CacheAdapter, StorageAdapter, ProviderAdapter)
- [ ] 实现 NoOp 适配器 (用于测试/禁用场景)
- **Status:** in_progress

### Phase 2: 核心管理器实现
- [ ] 实现 `CacheManager` (封装 hash 生成 + 缓存逻辑)
- [ ] 实现 `StorageManager` (封装上传 + URL 处理)
- [ ] 实现 `ProviderOrchestrator` (基于现有 ProviderScheduler)
- [ ] 创建 Supabase 适配器实现
- **Status:** pending

### Phase 3: ImageService 集成
- [ ] 实现 `ImageService` 主类
- [ ] 实现 `factory.ts` 环境工厂函数
- [ ] 导出公共 API (`index.ts`)
- [ ] 单元测试核心逻辑
- **Status:** pending

### Phase 4: 后端简化与集成
- [ ] 更新 `netlify/functions/generate-image.ts` 使用 ImageService
- [ ] 更新 `dev-server.js` 使用 ImageService
- [ ] 端到端测试（开发环境）
- [ ] 端到端测试（生产环境模拟）
- **Status:** pending

### Phase 5: 清理与文档
- [ ] 添加 deprecated 注释到旧文件
- [ ] 更新 docs/ai/ 文档
- [ ] 清理未使用代码
- [ ] 最终验证
- **Status:** pending

## Key Questions
1. 缓存 key 算法是否需要与现有兼容？ → **是，必须使用相同的 SHA-256 hash 算法**
2. Provider 优先级配置是否需要运行时可调？ → **是，通过 updateStrategy() 方法**
3. 是否需要支持前端直接调用（无后端代理）？ → **否，CORS 限制需要后端代理**
4. 旧的 ImageGenerator 是否保留？ → **是，向后兼容，内部改为调用 ImageService**

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| 使用 Facade 模式封装 ImageService | 统一入口，隐藏内部复杂性 |
| 使用 Adapter 模式抽象 Cache/Storage | 便于测试和替换实现 |
| 保持缓存 key 算法不变 | 兼容现有缓存数据 |
| 工厂函数区分 Browser/Node 环境 | 解决 import.meta.env vs process.env 问题 |
| 保留旧 API 作为兼容层 | 渐进式迁移，不破坏现有调用 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- 所有新代码放在 `src/services/image/` 目录
- 保持与现有 `src/services/ai/` 和 `src/services/cache/` 的兼容
- 优先级：正确性 > 简洁性 > 性能
- 每个 Phase 完成后更新此文件状态
