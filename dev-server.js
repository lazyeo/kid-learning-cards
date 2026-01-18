// 开发环境 API 服务器
// 使用统一的 ImageService 模块
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createImageService } from './src/services/image/config/factory.ts';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// 构建配置（Node.js 环境使用 process.env）
function buildConfig() {
  return {
    supabase: process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
      ? {
          url: process.env.SUPABASE_URL,
          anonKey: process.env.SUPABASE_ANON_KEY
        }
      : undefined,
    providers: {
      antigravity: process.env.ANTIGRAVITY_BASE_URL
        ? {
            baseUrl: process.env.ANTIGRAVITY_BASE_URL,
            apiKey: process.env.ANTIGRAVITY_API_KEY
          }
        : undefined,
      openai: process.env.OPENAI_API_KEY
        ? { apiKey: process.env.OPENAI_API_KEY }
        : undefined,
      gemini: process.env.GEMINI_API_KEY
        ? { apiKey: process.env.GEMINI_API_KEY }
        : undefined,
      modelscope: process.env.MODELSCOPE_API_KEY
        ? {
            apiKey: process.env.MODELSCOPE_API_KEY,
            baseUrl: process.env.MODELSCOPE_BASE_URL,
            model: process.env.MODELSCOPE_MODEL
          }
        : undefined
    },
    enableCache: process.env.ENABLE_CACHE !== 'false',
    enableStorage: true
  };
}

// 创建 ImageService 实例
const imageService = createImageService(buildConfig());

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  const orchestrator = imageService.getOrchestrator();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      registeredProviders: orchestrator.getRegisteredProviderIds(),
      enabledProviders: orchestrator.getEnabledProviderIds(),
      cacheEnabled: imageService.getCacheManager().isEnabled(),
      storageEnabled: imageService.getStorageManager().isEnabled()
    }
  });
});

// 图片生成端点
app.post('/api/generate-image', async (req, res) => {
  try {
    const { params, provider, useCache = true, forceRefresh = false } = req.body;

    if (!params) {
      return res.status(400).json({ error: 'Missing params' });
    }

    console.log(`\n[API] Generating image with provider: ${provider || 'auto'}`);
    console.log(`[API] Params:`, params);
    console.log(`[API] Cache: ${useCache ? 'enabled' : 'disabled'}, Force refresh: ${forceRefresh}`);

    // 使用 ImageService 生成图片
    const result = await imageService.generate(params, {
      provider,
      skipCache: !useCache,
      forceRefresh
    });

    console.log(`[API] ✅ Success! Provider: ${result.provider}, Cached: ${result.cached}`);

    res.json({
      imageUrl: result.imageUrl,
      cached: result.cached,
      cacheId: result.cacheId,
      provider: result.provider,
      storagePath: result.storagePath,
      failedProviders: result.failedProviders
    });

  } catch (error) {
    console.error('[API] ❌ Generation failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// 缓存统计端点
app.get('/api/cache/stats', async (req, res) => {
  try {
    const stats = await imageService.getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 缓存清理端点
app.post('/api/cache/cleanup', async (req, res) => {
  try {
    const { maxAgeDays = 30, minAccessCount = 1 } = req.body;
    const deleted = await imageService.cleanupCache(maxAgeDays, minAccessCount);
    res.json({ deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
app.listen(PORT, () => {
  const orchestrator = imageService.getOrchestrator();

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Dev API Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate-image`);
  console.log(`💊 Health check: http://localhost:${PORT}/health`);
  console.log(`\n📋 Configuration:`);
  console.log(`   - Registered Providers: ${orchestrator.getRegisteredProviderIds().join(', ') || 'None'}`);
  console.log(`   - Enabled Providers: ${orchestrator.getEnabledProviderIds().join(', ') || 'None'}`);
  console.log(`   - Cache: ${imageService.getCacheManager().isEnabled() ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`   - Storage: ${imageService.getStorageManager().isEnabled() ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`${'='.repeat(60)}\n`);
});
