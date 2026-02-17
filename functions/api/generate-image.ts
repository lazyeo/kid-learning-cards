import { createImageService } from '../../src/services/image';
import type { ColoringCardParams, ImageServiceConfig } from '../../src/services/image';

function buildConfig(env: Env): ImageServiceConfig {
  return {
    supabase: env.SUPABASE_URL && env.SUPABASE_ANON_KEY
      ? {
          url: env.SUPABASE_URL,
          anonKey: env.SUPABASE_ANON_KEY
        }
      : undefined,
    providers: {
      antigravity: env.ANTIGRAVITY_BASE_URL
        ? {
            baseUrl: env.ANTIGRAVITY_BASE_URL,
            apiKey: env.ANTIGRAVITY_API_KEY
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
            model: env.MODELSCOPE_MODEL
          }
        : undefined,
      labnana: env.LABNANA_API_KEY
        ? { apiKey: env.LABNANA_API_KEY }
        : undefined
    },
    enableCache: env.ENABLE_CACHE !== 'false',
    enableStorage: true
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers: corsHeaders });
  }

  if (context.request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body = await context.request.json() as {
      params?: ColoringCardParams;
      provider?: string;
      useCache?: boolean;
      forceRefresh?: boolean;
    };
    const params = body.params;
    const providerName = body.provider;
    const useCache = body.useCache !== false;
    const forceRefresh = body.forceRefresh === true;

    if (!params) {
      return new Response(
        JSON.stringify({ error: 'Missing params' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generate-image] Generating image with provider: ${providerName || 'auto'}`);

    const imageService = createImageService(buildConfig(context.env));
    const result = await imageService.generate(params, {
      provider: providerName,
      skipCache: !useCache,
      forceRefresh
    });

    console.log(`[generate-image] Success! Provider: ${result.provider}, Cached: ${result.cached}`);

    return new Response(
      JSON.stringify({
        imageUrl: result.imageUrl,
        cached: result.cached,
        cacheId: result.cacheId,
        provider: result.provider,
        storagePath: result.storagePath,
        failedProviders: result.failedProviders
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[generate-image] Failed:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};
