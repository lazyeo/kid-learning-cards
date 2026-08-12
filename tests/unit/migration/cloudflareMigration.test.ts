import { describe, expect, it, vi } from 'vitest';

import {
  buildUpsertSql,
  buildMigrationSql,
  createManifestEntry,
  fetchAllRecords,
  getR2Key,
  sqlValue,
} from '../../../scripts/lib/cloudflareMigration.mjs';

const record = {
  id: '33c384f6-9b26-49b6-a342-83fe933dfd4c',
  prompt_hash: 'hash',
  prompt_text: "a child's cat",
  theme: 'animals',
  subject: 'cat',
  difficulty: 'easy',
  custom_prompt: null,
  provider: 'labnana',
  image_url: 'https://source.test/storage/cat picture.png',
  storage_path: 'folder/cat picture.png',
  created_at: '2026-01-01T00:00:00.000Z',
  last_accessed_at: '2026-01-02T00:00:00.000Z',
  access_count: 4,
  metadata: { source: 'supabase' },
};

describe('Cloudflare migration helpers', () => {
  it('escapes SQL values and preserves null', () => {
    expect(sqlValue("child's drawing")).toBe("'child''s drawing'");
    expect(sqlValue(null)).toBe('NULL');
    expect(sqlValue(4)).toBe('4');
  });

  it('generates a stable namespaced R2 key', () => {
    expect(getR2Key(record)).toBe(
      'supabase/33c384f6-9b26-49b6-a342-83fe933dfd4c/cat-picture.png'
    );
  });

  it('builds an idempotent upsert with the new R2 URL', () => {
    const sql = buildUpsertSql(
      record,
      getR2Key(record),
      'https://kids.a-dobe.club/api/images'
    );

    expect(sql).toContain('ON CONFLICT(id) DO UPDATE SET');
    expect(sql).toContain("'a child''s cat'");
    expect(sql).toContain(
      "'https://kids.a-dobe.club/api/images/supabase/33c384f6-9b26-49b6-a342-83fe933dfd4c/cat-picture.png'"
    );
    expect(sql).toContain("'{\"source\":\"supabase\"}'");
  });

  it('builds retry-safe D1 SQL without unsupported transaction statements', () => {
    const sql = buildMigrationSql(
      [record],
      'https://kids.a-dobe.club/api/images'
    );

    expect(sql).not.toContain('BEGIN TRANSACTION');
    expect(sql).not.toContain('COMMIT');
    expect(sql).toContain('ON CONFLICT(id) DO UPDATE SET');
  });

  it('fetches every source page until a short page is returned', async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ images: [record, { ...record, id: '2' }] })))
      .mockResolvedValueOnce(new Response(JSON.stringify({ images: [{ ...record, id: '3' }] })));

    const rows = await fetchAllRecords(
      fetchFn,
      'https://kids-learning-cards.pages.dev/api/gallery',
      2
    );

    expect(rows.map((row) => row.id)).toEqual([record.id, '2', '3']);
    expect(fetchFn.mock.calls[1][0]).toContain('offset=2');
  });

  it('creates a SHA-256 manifest entry for an image', async () => {
    const entry = await createManifestEntry(
      record,
      new Uint8Array([1, 2, 3]),
      'image/png'
    );

    expect(entry).toMatchObject({
      id: record.id,
      key: getR2Key(record),
      sourceUrl: record.image_url,
      contentType: 'image/png',
      byteLength: 3,
      sha256: '039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81',
    });
  });

  it('infers an image MIME type when Supabase returns a generic type', async () => {
    const entry = await createManifestEntry(
      record,
      new Uint8Array([137, 80, 78, 71]),
      'application/octet-stream'
    );

    expect(entry.contentType).toBe('image/png');
  });
});
