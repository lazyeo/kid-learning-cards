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
});
