import { createImageService } from '../../src/services/image';
import type { ImageServiceConfig } from '../../src/services/image';

function buildConfig(env: Env): ImageServiceConfig {
  return {
    supabase: env.SUPABASE_URL && env.SUPABASE_ANON_KEY
      ? {
          url: env.SUPABASE_URL,
          anonKey: env.SUPABASE_ANON_KEY
        }
      : undefined,
    providers: {},
    enableCache: env.ENABLE_CACHE !== 'false',
    enableStorage: true
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: corsHeaders });
  }

  if (context.request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const body = await context.request.json() as { imageId?: string };
    const { imageId } = body;

    if (!imageId) {
      return new Response(
        JSON.stringify({ error: 'imageId is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const imageService = createImageService(buildConfig(context.env));
    const cacheManager = imageService.getCacheManager();

    if (!cacheManager.isEnabled()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Cache disabled' }),
        { status: 200, headers: corsHeaders }
      );
    }

    await cacheManager.incrementAccessCount(imageId);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Gallery Increment] Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: corsHeaders }
    );
  }
};
