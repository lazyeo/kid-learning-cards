import type {
  CacheAdapter,
  CacheEntry,
  CacheStats,
  ColoringCardParams,
  D1DatabaseLike,
} from '../types';

type D1CacheRow = Omit<CacheEntry, 'metadata'> & {
  metadata: string | Record<string, unknown> | null;
};

function parseMetadata(value: D1CacheRow['metadata']): Record<string, unknown> {
  if (value && typeof value === 'object') return value;
  if (typeof value !== 'string') return {};

  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
}

function mapRow(row: D1CacheRow): CacheEntry {
  return { ...row, metadata: parseMetadata(row.metadata) };
}

export class D1CacheAdapter implements CacheAdapter {
  private readonly db: D1DatabaseLike;

  constructor(db: D1DatabaseLike) {
    this.db = db;
  }

  private normalizeParams(params: ColoringCardParams): string {
    return JSON.stringify({
      theme: (params.theme || '').toLowerCase().trim(),
      subject: (params.subject || '').toLowerCase().trim(),
      difficulty: params.difficulty,
      customPrompt: (params.customPrompt || '').toLowerCase().trim(),
    });
  }

  private async hashParams(params: ColoringCardParams): Promise<string> {
    const data = new TextEncoder().encode(this.normalizeParams(params));
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  async findExactMatch(
    params: ColoringCardParams,
    provider: string
  ): Promise<CacheEntry | null> {
    const promptHash = await this.hashParams(params);
    const row = await this.db.prepare(`
      SELECT * FROM image_cache
      WHERE prompt_hash = ? AND provider = ?
      LIMIT 1
    `).bind(promptHash, provider).first<D1CacheRow>();

    if (!row) return null;
    await this.incrementAccessCount(row.id);
    return mapRow(row);
  }

  async store(
    params: ColoringCardParams,
    promptText: string,
    provider: string,
    imageUrl: string,
    storagePath?: string
  ): Promise<string> {
    const id = crypto.randomUUID();
    const promptHash = await this.hashParams(params);
    const now = new Date().toISOString();

    await this.db.prepare(`
      INSERT INTO image_cache (
        id, prompt_hash, prompt_text, theme, subject, difficulty,
        custom_prompt, provider, image_url, storage_path,
        created_at, last_accessed_at, access_count, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      promptHash,
      promptText,
      (params.theme || '').toLowerCase(),
      (params.subject || '').toLowerCase(),
      params.difficulty,
      params.customPrompt || null,
      provider,
      imageUrl,
      storagePath || null,
      now,
      now,
      1,
      '{}'
    ).run();

    return id;
  }

  async findSimilar(
    params: ColoringCardParams,
    limit: number = 5
  ): Promise<CacheEntry[]> {
    const result = await this.db.prepare(`
      SELECT * FROM image_cache
      WHERE theme = ? AND difficulty = ? AND subject LIKE ?
      ORDER BY access_count DESC
      LIMIT ?
    `).bind(
      (params.theme || '').toLowerCase(),
      params.difficulty,
      `%${(params.subject || '').toLowerCase()}%`,
      limit
    ).all<D1CacheRow>();

    return (result.results || []).map(mapRow);
  }

  async getGalleryImages(
    options: {
      theme?: string;
      limit?: number;
      offset?: number;
      orderBy?: 'popular' | 'recent';
    } = {}
  ): Promise<CacheEntry[]> {
    const { theme, limit = 20, offset = 0, orderBy = 'popular' } = options;
    const bindings: unknown[] = [];
    let whereClause = 'WHERE image_url IS NOT NULL';

    if (theme && theme !== 'all') {
      whereClause += ' AND theme = ?';
      bindings.push(theme.toLowerCase());
    }

    const orderClause = orderBy === 'recent'
      ? 'ORDER BY created_at DESC'
      : 'ORDER BY access_count DESC';
    bindings.push(limit, offset);

    const result = await this.db.prepare(`
      SELECT * FROM image_cache
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `).bind(...bindings).all<D1CacheRow>();

    return (result.results || []).map(mapRow);
  }

  async incrementAccessCount(imageId: string): Promise<void> {
    await this.db.prepare(`
      UPDATE image_cache
      SET access_count = access_count + 1,
          last_accessed_at = ?
      WHERE id = ?
    `).bind(new Date().toISOString(), imageId).run();
  }

  async cleanup(maxAgeDays: number = 30, minAccessCount: number = 1): Promise<number> {
    const cutoff = new Date();
    cutoff.setUTCDate(cutoff.getUTCDate() - maxAgeDays);
    const result = await this.db.prepare(`
      DELETE FROM image_cache
      WHERE last_accessed_at < ? AND access_count <= ?
    `).bind(cutoff.toISOString(), minAccessCount).run();
    return result.meta?.changes || 0;
  }

  async getStats(): Promise<CacheStats> {
    const totals = await this.db.prepare(`
      SELECT COUNT(*) AS total_entries,
             COALESCE(SUM(access_count), 0) AS total_hits
      FROM image_cache
    `).first<{ total_entries: number; total_hits: number }>();
    const themes = await this.db.prepare(`
      SELECT COALESCE(theme, 'unknown') AS theme, COUNT(*) AS count
      FROM image_cache
      GROUP BY theme
      ORDER BY count DESC
      LIMIT 5
    `).all<{ theme: string; count: number }>();

    return {
      totalEntries: totals?.total_entries || 0,
      totalHits: totals?.total_hits || 0,
      topThemes: themes.results || [],
    };
  }
}
