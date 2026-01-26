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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { imageId } = body;

    if (!imageId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'imageId is required' })
      };
    }

    const cacheManager = imageService.getCacheManager();

    if (!cacheManager.isEnabled()) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, message: 'Cache disabled' })
      };
    }

    await cacheManager.incrementAccessCount(imageId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('[Gallery Increment] Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: (error as Error).message })
    };
  }
};
