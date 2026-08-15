import { describe, expect, it, vi } from 'vitest';

import { createImageService } from '../../../src/services/image/config/factory';

describe('createImageService storage backend selection', () => {
  it('uses D1, R2, and the image transformer when Cloudflare bindings are supplied', async () => {
    const statement = {
      bind: vi.fn(),
      first: vi.fn(),
      all: vi.fn(),
      run: vi.fn(),
    };
    statement.bind.mockReturnValue(statement);
    const db = { prepare: vi.fn(() => statement) };
    const images = {
      put: vi.fn(),
      delete: vi.fn(),
    };
    const output = vi.fn(async () => ({
      response: () => new Response(new Uint8Array([9, 8, 7]), {
        headers: { 'Content-Type': 'image/webp' },
      }),
    }));
    const imageTransformer = {
      input: vi.fn(() => ({ output })),
    };

    const service = createImageService({
      cloudflare: {
        db,
        images,
        imageTransformer,
        publicBaseUrl: 'https://kids-learning-cards.pages.dev/api/images',
      },
      providers: {},
      enableCache: true,
      enableStorage: true,
    });

    expect(service.getCacheManager().isEnabled()).toBe(true);
    expect(service.getStorageManager().isEnabled()).toBe(true);

    await service.getStorageManager().storeFromBase64(
      'data:image/png;base64,AQID',
      'Factory Test'
    );

    expect(imageTransformer.input).toHaveBeenCalledOnce();
    expect(output).toHaveBeenCalledWith({ format: 'image/webp', quality: 80 });
    expect(images.put).toHaveBeenCalledWith(
      expect.stringMatching(/-factory-test\.webp$/),
      expect.any(ArrayBuffer),
      expect.objectContaining({
        httpMetadata: expect.objectContaining({ contentType: 'image/webp' }),
      })
    );
  });

  it('keeps the existing no-op fallback without either backend', () => {
    const service = createImageService({
      providers: {},
      enableCache: true,
      enableStorage: true,
    });

    expect(service.getCacheManager().isEnabled()).toBe(false);
    expect(service.getStorageManager().isEnabled()).toBe(false);
  });

  it('registers GPT Image only when its complete credentials are supplied', () => {
    const configured = createImageService({
      providers: {
        gptImage: {
          baseUrl: 'https://images.example.com/v1',
          apiKey: 'test-key',
          model: 'gpt-image-2',
        },
      },
      enableCache: false,
      enableStorage: false,
    });
    const incomplete = createImageService({
      providers: {},
      enableCache: false,
      enableStorage: false,
    });

    expect(configured.getOrchestrator().getRegisteredProviderIds()).toContain('gpt-image');
    expect(incomplete.getOrchestrator().getRegisteredProviderIds()).not.toContain('gpt-image');
  });
});
