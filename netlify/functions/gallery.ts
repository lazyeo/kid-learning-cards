import { type Handler } from '@netlify/functions';
import { createImageService } from '../../src/services/image';
import type { ImageServiceConfig } from '../../src/services/image';

function buildConfig(): ImageServiceConfig {
  return {
    supabase: process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
      ? {
          url: process.env.SUPABASE_URL,
          anonKey: process.env.SUPABASE_ANON_KEY
        }
      : undefined,
    providers: {},
    enableCache: process.env.ENABLE_CACHE !== 'false',
    enableStorage: true
  };
}

const imageService = createImageService(buildConfig());

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const params = event.queryStringParameters || {};
    const theme = params.theme;
    const limit = parseInt(params.limit || '20', 10);
    const offset = parseInt(params.offset || '0', 10);
    const orderBy = (params.orderBy || 'popular') as 'popular' | 'recent';

    const cacheManager = imageService.getCacheManager();

    if (!cacheManager.isEnabled()) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ images: [] })
      };
    }

    const images = await cacheManager.getGalleryImages({
      theme: theme || undefined,
      limit,
      offset,
      orderBy
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ images })
    };
  } catch (error) {
    console.error('[Gallery] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: (error as Error).message })
    };
  }
};
