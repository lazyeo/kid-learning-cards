import type {
  D1DatabaseLike,
  ImageServiceConfig,
  R2BucketLike,
} from '../../src/services/image/types';

export interface PagesImageEnv {
  STORAGE_BACKEND?: 'supabase' | 'cloudflare';
  DB?: D1DatabaseLike;
  IMAGES?: R2BucketLike;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  ANTIGRAVITY_API_KEY?: string;
  ANTIGRAVITY_BASE_URL?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  MODELSCOPE_API_KEY?: string;
  MODELSCOPE_BASE_URL?: string;
  MODELSCOPE_MODEL?: string;
  LABNANA_API_KEY?: string;
  ENABLE_CACHE?: string;
}

export function buildImageServiceConfig(
  env: PagesImageEnv,
  requestUrl: string
): ImageServiceConfig {
  const useCloudflare = env.STORAGE_BACKEND === 'cloudflare';

  if (useCloudflare && (!env.DB || !env.IMAGES)) {
    throw new Error('Cloudflare storage bindings are unavailable');
  }

  const origin = new URL(requestUrl).origin;

  return {
    cloudflare: useCloudflare
      ? {
          db: env.DB!,
          images: env.IMAGES!,
          publicBaseUrl: `${origin}/api/images`,
        }
      : undefined,
    supabase: !useCloudflare && env.SUPABASE_URL && env.SUPABASE_ANON_KEY
      ? {
          url: env.SUPABASE_URL,
          anonKey: env.SUPABASE_ANON_KEY,
        }
      : undefined,
    providers: {
      antigravity: env.ANTIGRAVITY_BASE_URL
        ? {
            baseUrl: env.ANTIGRAVITY_BASE_URL,
            apiKey: env.ANTIGRAVITY_API_KEY,
          }
        : undefined,
      openai: env.OPENAI_API_KEY
        ? { apiKey: env.OPENAI_API_KEY }
        : undefined,
      gemini: env.GEMINI_API_KEY
        ? { apiKey: env.GEMINI_API_KEY }
        : undefined,
      modelscope: env.MODELSCOPE_API_KEY
        ? {
            apiKey: env.MODELSCOPE_API_KEY,
            baseUrl: env.MODELSCOPE_BASE_URL,
            model: env.MODELSCOPE_MODEL,
          }
        : undefined,
      labnana: env.LABNANA_API_KEY
        ? { apiKey: env.LABNANA_API_KEY }
        : undefined,
    },
    enableCache: env.ENABLE_CACHE !== 'false',
    enableStorage: true,
  };
}
