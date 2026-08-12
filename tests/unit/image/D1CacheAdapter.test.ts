import { describe, expect, it, vi } from 'vitest';

import { D1CacheAdapter } from '../../../src/services/image/cache/D1CacheAdapter';

interface StatementResult {
  first?: Record<string, unknown> | null;
  all?: Record<string, unknown>[];
  changes?: number;
}

function createDatabase(results: StatementResult[]) {
  const calls: Array<{ sql: string; bindings: unknown[] }> = [];
  const prepare = vi.fn((sql: string) => {
    const result = results.shift() ?? {};
    const call = { sql, bindings: [] as unknown[] };
    calls.push(call);
    const statement = {
      bind: (...bindings: unknown[]) => {
        call.bindings = bindings;
        return statement;
      },
      first: vi.fn(async () => result.first ?? null),
      all: vi.fn(async () => ({ results: result.all ?? [] })),
      run: vi.fn(async () => ({ meta: { changes: result.changes ?? 0 } })),
    };
    return statement;
  });

  return { db: { prepare }, calls };
}

const row = {
  id: 'cache-1',
  prompt_hash: 'hash',
  prompt_text: 'a cat',
  theme: 'animals',
  subject: 'cat',
  difficulty: 'easy',
  custom_prompt: null,
  provider: 'labnana',
  image_url: 'https://example.test/api/images/cat.webp',
  storage_path: 'cat.webp',
  created_at: '2026-01-01T00:00:00.000Z',
  last_accessed_at: '2026-01-01T00:00:00.000Z',
  access_count: 2,
  metadata: '{"source":"supabase"}',
};

describe('D1CacheAdapter', () => {
  it('finds an exact match with the compatible parameter hash', async () => {
    const { db, calls } = createDatabase([{ first: row }, { changes: 1 }]);
    const adapter = new D1CacheAdapter(db);

    const result = await adapter.findExactMatch({
      theme: ' Animals ',
      subject: ' CAT ',
      difficulty: 'easy',
      customPrompt: '',
    }, 'labnana');

    expect(result).toEqual({ ...row, metadata: { source: 'supabase' } });
    expect(calls[0].sql).toContain('prompt_hash = ?');
    expect(calls[0].bindings[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(calls[0].bindings[1]).toBe('labnana');
    expect(calls[1].sql).toContain('access_count = access_count + 1');
  });

  it('stores a cache row and returns its generated id', async () => {
    const { db, calls } = createDatabase([{ changes: 1 }]);
    const adapter = new D1CacheAdapter(db);

    const id = await adapter.store(
      { theme: 'animals', subject: 'cat', difficulty: 'easy', customPrompt: '' },
      'a cat',
      'labnana',
      'https://example.test/api/images/cat.webp',
      'cat.webp'
    );

    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    expect(calls[0].sql).toContain('INSERT INTO image_cache');
    expect(calls[0].bindings).toContain('animals');
    expect(calls[0].bindings).toContain('{}');
  });

  it('returns paginated gallery rows with parsed metadata', async () => {
    const { db, calls } = createDatabase([{ all: [row] }]);
    const adapter = new D1CacheAdapter(db);

    const result = await adapter.getGalleryImages({
      theme: 'animals',
      limit: 10,
      offset: 20,
      orderBy: 'recent',
    });

    expect(result[0].metadata).toEqual({ source: 'supabase' });
    expect(calls[0].sql).toContain('ORDER BY created_at DESC');
    expect(calls[0].bindings).toEqual(['animals', 10, 20]);
  });

  it('increments access count atomically', async () => {
    const { db, calls } = createDatabase([{ changes: 1 }]);
    const adapter = new D1CacheAdapter(db);

    await adapter.incrementAccessCount('cache-1');

    expect(calls[0].sql).toContain('access_count = access_count + 1');
    expect(calls[0].bindings[0]).toMatch(/^2026-/);
    expect(calls[0].bindings.at(-1)).toBe('cache-1');
  });

  it('treats malformed metadata as an empty object', async () => {
    const { db } = createDatabase([{ all: [{ ...row, metadata: 'not-json' }] }]);
    const adapter = new D1CacheAdapter(db);

    const result = await adapter.getGalleryImages();

    expect(result[0].metadata).toEqual({});
  });
});
