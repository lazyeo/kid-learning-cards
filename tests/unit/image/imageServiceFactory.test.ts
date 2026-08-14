import { describe, expect, it, vi } from 'vitest';

import { createImageService } from '../../../src/services/image/config/factory';

describe('createImageService storage backend selection', () => {
  it('uses D1 and R2 when Cloudflare bindings are supplied', () => {
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

    const service = createImageService({
      cloudflare: {
        db,
        images,
        publicBaseUrl: 'https://kids-learning-cards.pages.dev/api/images',
      },
      providers: {},
      enableCache: true,
      enableStorage: true,
    });

    expect(service.getCacheManager().isEnabled()).toBe(true);
    expect(service.getStorageManager().isEnabled()).toBe(true);
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
