import { afterEach, describe, expect, it, vi } from 'vitest';

import { R2StorageAdapter } from '../../../src/services/image/storage/R2StorageAdapter';

function createBucket() {
  return {
    put: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
  };
}

function createTransformer(bytes = new Uint8Array([9, 8, 7])) {
  const output = vi.fn(async () => ({
    response: () => new Response(bytes, {
      headers: { 'Content-Type': 'image/webp' },
    }),
  }));
  const input = vi.fn(() => ({ output }));

  return { input, output };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('R2StorageAdapter', () => {
  it('converts PNG bytes to quality-80 WebP before storing them', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T00:00:00.000Z'));
    const bucket = createBucket();
    const transformer = createTransformer();
    const adapter = new R2StorageAdapter(
      bucket,
      'https://example.test/api/images',
      transformer
    );

    const result = await adapter.storeFromBase64(
      'data:image/png;base64,AQID',
      'Smiling Star'
    );

    expect(transformer.input).toHaveBeenCalledOnce();
    expect(transformer.output).toHaveBeenCalledWith({
      format: 'image/webp',
      quality: 80,
    });
    expect(result.storagePath).toBe('1786492800000-smiling-star.webp');
    const uploaded = bucket.put.mock.calls[0][1] as ArrayBuffer;
    expect(Array.from(new Uint8Array(uploaded))).toEqual([9, 8, 7]);
    expect(bucket.put).toHaveBeenCalledWith(result.storagePath, uploaded, {
      httpMetadata: {
        contentType: 'image/webp',
        cacheControl: 'public, max-age=31536000, immutable',
      },
    });
  });

  it('does not transform an existing WebP image', async () => {
    const bucket = createBucket();
    const transformer = createTransformer();
    const adapter = new R2StorageAdapter(
      bucket,
      'https://example.test/api/images',
      transformer
    );

    await adapter.storeFromBase64('data:image/webp;base64,AQID', 'Moon');

    expect(transformer.input).not.toHaveBeenCalled();
    expect(bucket.put).toHaveBeenCalledWith(
      expect.stringMatching(/-moon\.webp$/),
      expect.any(Uint8Array),
      expect.objectContaining({
        httpMetadata: expect.objectContaining({ contentType: 'image/webp' }),
      })
    );
  });

  it('stores the original image when WebP conversion fails', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const bucket = createBucket();
    const transformer = {
      input: vi.fn(() => ({
        output: vi.fn(async () => {
          throw new Error('transform unavailable');
        }),
      })),
    };
    const adapter = new R2StorageAdapter(
      bucket,
      'https://example.test/api/images',
      transformer
    );

    const result = await adapter.storeFromBase64(
      'data:image/png;base64,AQID',
      'Fallback'
    );

    expect(transformer.input).toHaveBeenCalledOnce();
    expect(warning).toHaveBeenCalledOnce();
    expect(result.storagePath).toMatch(/-fallback\.png$/);
    const uploaded = bucket.put.mock.calls[0][1] as Uint8Array;
    expect(Array.from(uploaded)).toEqual([1, 2, 3]);
    expect(bucket.put).toHaveBeenCalledWith(
      result.storagePath,
      uploaded,
      expect.objectContaining({
        httpMetadata: expect.objectContaining({ contentType: 'image/png' }),
      })
    );
  });

  it('stores a fetched image with HTTP metadata and returns its Pages URL', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T00:00:00.000Z'));
    vi.stubGlobal('fetch', vi.fn(async () => new Response(
      new Uint8Array([1, 2, 3]),
      { headers: { 'Content-Type': 'image/png' } }
    )));
    const bucket = createBucket();
    const adapter = new R2StorageAdapter(
      bucket,
      'https://kids-learning-cards.pages.dev/api/images'
    );

    const result = await adapter.storeFromUrl('https://source.test/cat', 'Cute Cat');

    expect(result.storagePath).toBe('1786492800000-cute-cat.png');
    expect(result.publicUrl).toBe(
      'https://kids-learning-cards.pages.dev/api/images/1786492800000-cute-cat.png'
    );
    expect(bucket.put).toHaveBeenCalledWith(
      result.storagePath,
      expect.any(ArrayBuffer),
      {
        httpMetadata: {
          contentType: 'image/png',
          cacheControl: 'public, max-age=31536000, immutable',
        },
      }
    );
  });

  it('stores a base64 data URI without Node-only APIs', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-12T00:00:00.000Z'));
    const bucket = createBucket();
    const adapter = new R2StorageAdapter(bucket, 'https://example.test/api/images/');

    const result = await adapter.storeFromBase64(
      'data:image/webp;base64,AQID',
      '月亮 恐龙'
    );

    expect(result.storagePath).toBe('1786492800000-image.webp');
    const uploaded = bucket.put.mock.calls[0][1] as Uint8Array;
    expect(Array.from(uploaded)).toEqual([1, 2, 3]);
  });

  it('deletes an object by storage path', async () => {
    const bucket = createBucket();
    const adapter = new R2StorageAdapter(bucket, 'https://example.test/api/images');

    await adapter.delete('folder/cat.webp');

    expect(bucket.delete).toHaveBeenCalledWith('folder/cat.webp');
  });

  it('encodes each public URL path segment', () => {
    const adapter = new R2StorageAdapter(
      createBucket(),
      'https://example.test/api/images/'
    );

    expect(adapter.getPublicUrl('legacy/cat picture.webp')).toBe(
      'https://example.test/api/images/legacy/cat%20picture.webp'
    );
  });
});
