import { createImageService } from '../../src/services/image';
import type { ColoringCardParams } from '../../src/services/image';
import {
  buildImageServiceConfig,
  type PagesImageEnv,
} from '../lib/imageServiceConfig';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

export const onRequest: PagesFunction<PagesImageEnv> = async (context) => {
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

    const imageService = createImageService(
      buildImageServiceConfig(context.env, context.request.url)
    );
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
