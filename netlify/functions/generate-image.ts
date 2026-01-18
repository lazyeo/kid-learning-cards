import { type Handler } from '@netlify/functions';
import { createImageService } from '../../src/services/image';
import type { ColoringCardParams, ImageServiceConfig } from '../../src/services/image';

// 构建配置（Node.js 环境使用 process.env）
function buildConfig(): ImageServiceConfig {
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

// 创建 ImageService 实例（单例）
const imageService = createImageService(buildConfig());

export const handler: Handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: 'Method Not Allowed'
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const params: ColoringCardParams = body.params;
    const providerName: string | undefined = body.provider;
    const useCache: boolean = body.useCache !== false;
    const forceRefresh: boolean = body.forceRefresh === true;

    if (!params) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing params' })
      };
    }

    console.log(`[generate-image] Generating image with provider: ${providerName || 'auto'}`);

    // 使用 ImageService 生成图片
    const result = await imageService.generate(params, {
      provider: providerName,
      skipCache: !useCache,
      forceRefresh
    });

    console.log(`[generate-image] Success! Provider: ${result.provider}, Cached: ${result.cached}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        imageUrl: result.imageUrl,
        cached: result.cached,
        cacheId: result.cacheId,
        provider: result.provider,
        storagePath: result.storagePath,
        failedProviders: result.failedProviders
      })
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[generate-image] Failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};
