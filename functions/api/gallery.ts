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
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method === 'OPTIONS') {
    return new Response('', { status: 204, headers: corsHeaders });
  }

  if (context.request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    const url = new URL(context.request.url);
    const theme = url.searchParams.get('theme') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);
    const orderBy = (url.searchParams.get('orderBy') || 'popular') as 'popular' | 'recent';

    const imageService = createImageService(buildConfig(context.env));
    const cacheManager = imageService.getCacheManager();

    if (!cacheManager.isEnabled()) {
      return new Response(
        JSON.stringify({ images: [] }),
        { status: 200, headers: corsHeaders }
      );
    }

    const images = await cacheManager.getGalleryImages({
      theme,
      limit,
      offset,
      orderBy
    });

    return new Response(
      JSON.stringify({ images }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[Gallery] Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: corsHeaders }
    );
  }
};
