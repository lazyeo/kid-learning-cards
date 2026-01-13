import { type Handler } from '@netlify/functions';
import { ImageGenerator } from '../../src/services/ai/imageGenerator';
import { OpenAIProvider } from '../../src/services/ai/providers/openai';
import { GeminiProvider } from '../../src/services/ai/providers/gemini';
import { type ColoringCardParams } from '../../src/services/ai/types';

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

    if (!params) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing params' })
      };
    }

    const imageGenerator = new ImageGenerator();

    // 根据请求选择提供商并配置 API Key
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
    else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: `Unsupported provider: ${providerName}` })
      };
    }

    const imageUrl = await imageGenerator.generate(params);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ imageUrl })
    };
  } catch (error: any) {
    console.error('Function execution failed:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
