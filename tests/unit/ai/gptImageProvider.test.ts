import { afterEach, describe, expect, it, vi } from 'vitest';
import { GptImageProvider } from '../../../src/services/ai/providers/gptImage';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('GptImageProvider', () => {
  it.each([
    ['https://images.example.com', 'https://images.example.com/v1/images/generations'],
    ['https://images.example.com/', 'https://images.example.com/v1/images/generations'],
    ['https://images.example.com/v1', 'https://images.example.com/v1/images/generations'],
    [
      'https://images.example.com/v1/images/generations',
      'https://images.example.com/v1/images/generations',
    ],
  ])('normalizes %s to the generations endpoint', async (baseUrl, expectedEndpoint) => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      data: [{ b64_json: 'cG5n' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    const provider = new GptImageProvider({
      baseUrl,
      apiKey: 'test-key',
      model: 'gpt-image-2',
    });

    const result = await provider.generateImage('draw a moon', {
      width: 1024,
      height: 1024,
      quality: 'standard',
    });

    expect(result).toBe('data:image/png;base64,cG5n');
    expect(fetchMock).toHaveBeenCalledWith(
      expectedEndpoint,
      expect.objectContaining({
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json',
        },
      })
    );

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(request.body as string)).toEqual({
      model: 'gpt-image-2',
      prompt: 'draw a moon',
      n: 1,
      size: '1024x1024',
      quality: 'medium',
    });
  });

  it('maps hd quality to high and accepts URL-compatible responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({
      data: [{ url: 'https://cdn.example.com/image.webp' }],
    }));
    vi.stubGlobal('fetch', fetchMock);

    const provider = new GptImageProvider({
      baseUrl: 'https://images.example.com/v1',
      apiKey: 'test-key',
    });

    await expect(provider.generateImage('draw a cat', {
      quality: 'hd',
    })).resolves.toBe('https://cdn.example.com/image.webp');

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(request.body as string)).toEqual(expect.objectContaining({
      model: 'gpt-image-2',
      quality: 'high',
    }));
  });

  it('surfaces an upstream API error message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      error: { message: 'model is unavailable' },
    }, 503)));

    const provider = new GptImageProvider({
      baseUrl: 'https://images.example.com',
      apiKey: 'test-key',
    });

    await expect(provider.generateImage('draw a dog', {}))
      .rejects.toThrow('GPT Image API Error: model is unavailable');
  });

  it('rejects a successful response without image data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ data: [{}] })));

    const provider = new GptImageProvider({
      baseUrl: 'https://images.example.com',
      apiKey: 'test-key',
    });

    await expect(provider.generateImage('draw a dog', {}))
      .rejects.toThrow('No image data received from GPT Image provider');
  });
});
