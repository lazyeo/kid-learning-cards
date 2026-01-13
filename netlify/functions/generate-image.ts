import { type Handler } from '@netlify/functions';
import { ImageGenerator } from '../../src/services/ai/imageGenerator';
import { OpenAIProvider } from '../../src/services/ai/providers/openai';
import { GeminiProvider } from '../../src/services/ai/providers/gemini';
import { AntigravityProvider } from '../../src/services/ai/providers/antigravity';
import { ImageCacheService } from '../../src/services/cache/imageCache';
import { ImageStorageService } from '../../src/services/storage/imageStorage';
import { type ColoringCardParams } from '../../src/services/ai/types';
import { buildColoringPrompt } from '../../src/services/ai/utils/promptBuilder';

// 初始化 Supabase 服务（如果配置了环境变量）
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const enableCache = process.env.ENABLE_CACHE !== 'false'; // 默认启用

const cacheService = supabaseUrl && supabaseKey
  ? new ImageCacheService(supabaseUrl, supabaseKey)
  : null;

const storageService = supabaseUrl && supabaseKey
  ? new ImageStorageService(supabaseUrl, supabaseKey)
  : null;

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
    const providerName: string = body.provider || 'openai';
    const useCache: boolean = body.useCache !== false && enableCache; // 默认使用缓存
    const forceRefresh: boolean = body.forceRefresh === true; // 强制刷新

    if (!params) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing params' })
      };
    }

    // 1. 检查缓存（如果启用且不强制刷新）
    if (useCache && !forceRefresh && cacheService) {
      try {
        const cached = await cacheService.findExactMatch(params, providerName);
        if (cached) {
          console.log(`Cache hit for provider ${providerName}, id: ${cached.id}`);
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              imageUrl: cached.image_url,
              cached: true,
              cacheId: cached.id,
              provider: providerName
            })
          };
        }
      } catch (cacheError) {
        console.warn('Cache lookup failed, proceeding with generation:', cacheError);
      }
    }

    // 2. 配置 AI Provider
    const imageGenerator = new ImageGenerator();

    if (providerName === 'openai') {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('Server configuration error: Missing OpenAI API Key');
      }
      imageGenerator.registerProvider(new OpenAIProvider(apiKey));
      imageGenerator.switchProvider('openai');
    }
    else if (providerName === 'gemini') {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Server configuration error: Missing Gemini API Key');
      }
      imageGenerator.registerProvider(new GeminiProvider(apiKey));
      imageGenerator.switchProvider('gemini');
    }
    else if (providerName === 'antigravity') {
      const baseUrl = process.env.ANTIGRAVITY_BASE_URL;
      const apiKey = process.env.ANTIGRAVITY_API_KEY || 'local';
      if (!baseUrl) {
        throw new Error('Server configuration error: Missing Antigravity Base URL');
      }
      imageGenerator.registerProvider(new AntigravityProvider({ baseUrl, apiKey }));
      imageGenerator.switchProvider('antigravity');
    }
    else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Unsupported provider: ${providerName}` })
      };
    }

    // 3. 生成图片
    console.log(`Generating image with provider: ${providerName}`);
    const imageUrl = await imageGenerator.generate(params);

    // 4. 存储到缓存（如果启用）
    let finalUrl = imageUrl;
    let cacheId: string | undefined;
    let storagePath: string | undefined;

    if (useCache && cacheService) {
      try {
        // 如果配置了存储服务，将图片持久化
        if (storageService) {
          const filename = `${params.theme}-${params.subject}`.replace(/\s+/g, '-');
          finalUrl = await storageService.storeFromUrl(imageUrl, filename);
          storagePath = finalUrl; // 简化处理，使用完整 URL 作为 path
          console.log(`Image stored to Supabase Storage: ${finalUrl}`);
        }

        // 构建完整 prompt 用于记录
        const promptText = buildColoringPrompt(params);

        // 存储缓存记录
        cacheId = await cacheService.store(
          params,
          promptText,
          providerName,
          finalUrl,
          storagePath
        );
        console.log(`Cache entry created: ${cacheId}`);
      } catch (storageError) {
        console.warn('Cache/storage failed, returning original URL:', storageError);
        // 存储失败不影响返回结果
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        imageUrl: finalUrl,
        cached: false,
        cacheId,
        provider: providerName
      })
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Function execution failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: errorMessage })
    };
  }
};
