import { describe, expect, it, vi } from 'vitest';

import { buildImageServiceConfig } from '../../../functions/lib/imageServiceConfig';

function createBindings() {
  const statement = {
    bind: vi.fn(),
    first: vi.fn(),
    all: vi.fn(),
    run: vi.fn(),
  };
  statement.bind.mockReturnValue(statement);
  return {
    DB: { prepare: vi.fn(() => statement) },
    IMAGES: { put: vi.fn(), delete: vi.fn() },
  };
}

describe('buildImageServiceConfig', () => {
  it('keeps Supabase as the default backend before cutover', () => {
    const config = buildImageServiceConfig({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_ANON_KEY: 'public-key',
    }, 'https://kids-learning-cards.pages.dev/api/gallery');

    expect(config.supabase).toEqual({
      url: 'https://project.supabase.co',
      anonKey: 'public-key',
    });
    expect(config.cloudflare).toBeUndefined();
  });

  it('uses bindings and the request origin after explicit cutover', () => {
    const bindings = createBindings();
    const config = buildImageServiceConfig({
      STORAGE_BACKEND: 'cloudflare',
      ...bindings,
    }, 'https://kids.a-dobe.club/api/gallery');

    expect(config.cloudflare).toEqual({
      db: bindings.DB,
      images: bindings.IMAGES,
      publicBaseUrl: 'https://kids.a-dobe.club/api/images',
    });
    expect(config.supabase).toBeUndefined();
  });

  it('fails clearly when cutover bindings are incomplete', () => {
    expect(() => buildImageServiceConfig({
      STORAGE_BACKEND: 'cloudflare',
    }, 'https://example.test/api/gallery')).toThrow(
      'Cloudflare storage bindings are unavailable'
    );
  });

  it('maps complete GPT Image credentials with the default model', () => {
    const config = buildImageServiceConfig({
      GPT_IMAGE_BASE_URL: 'https://images.example.com/v1',
      GPT_IMAGE_API_KEY: 'test-key',
    }, 'https://kids.a-dobe.club/api/gallery');

    expect(config.providers.gptImage).toEqual({
      baseUrl: 'https://images.example.com/v1',
      apiKey: 'test-key',
      model: 'gpt-image-2',
    });
  });

  it('uses the configured GPT Image model and ignores incomplete credentials', () => {
    const configured = buildImageServiceConfig({
      GPT_IMAGE_BASE_URL: 'https://images.example.com/v1',
      GPT_IMAGE_API_KEY: 'test-key',
      GPT_IMAGE_MODEL: 'gpt-image-2-compatible',
    }, 'https://kids.a-dobe.club/api/gallery');
    const incomplete = buildImageServiceConfig({
      GPT_IMAGE_API_KEY: 'test-key',
    }, 'https://kids.a-dobe.club/api/gallery');

    expect(configured.providers.gptImage?.model).toBe('gpt-image-2-compatible');
    expect(incomplete.providers.gptImage).toBeUndefined();
  });
});
