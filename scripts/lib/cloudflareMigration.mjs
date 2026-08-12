const MIGRATION_PREFIX = 'supabase';

export function sqlValue(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Cannot serialize non-finite SQL number');
    return String(value);
  }
  if (typeof value === 'boolean') return value ? '1' : '0';

  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return `'${serialized.replaceAll("'", "''")}'`;
}

function slugify(value) {
  const ascii = Array.from(value.normalize('NFD'))
    .filter((character) => character.charCodeAt(0) <= 127)
    .join('');
  return ascii
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getR2Key(record) {
  const sourcePath = record.storage_path || new URL(record.image_url).pathname;
  const sourceName = sourcePath.split('/').filter(Boolean).at(-1) || `${record.id}.png`;
  const dotIndex = sourceName.lastIndexOf('.');
  const extension = dotIndex >= 0 ? sourceName.slice(dotIndex).toLowerCase() : '.png';
  const stem = dotIndex >= 0 ? sourceName.slice(0, dotIndex) : sourceName;
  const safeStem = slugify(stem) || 'image';
  const safeExtension = /^\.[a-z0-9]{1,8}$/.test(extension) ? extension : '.png';
  return `${MIGRATION_PREFIX}/${record.id}/${safeStem}${safeExtension}`;
}

function publicImageUrl(publicBaseUrl, key) {
  const encodedKey = key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${publicBaseUrl.replace(/\/$/, '')}/${encodedKey}`;
}

export function buildUpsertSql(record, key, publicBaseUrl) {
  const columns = [
    'id',
    'prompt_hash',
    'prompt_text',
    'theme',
    'subject',
    'difficulty',
    'custom_prompt',
    'provider',
    'image_url',
    'storage_path',
    'created_at',
    'last_accessed_at',
    'access_count',
    'metadata',
  ];
  const values = [
    record.id,
    record.prompt_hash,
    record.prompt_text,
    record.theme,
    record.subject,
    record.difficulty,
    record.custom_prompt,
    record.provider,
    publicImageUrl(publicBaseUrl, key),
    key,
    record.created_at,
    record.last_accessed_at,
    record.access_count,
    record.metadata || {},
  ];
  const updates = columns
    .filter((column) => column !== 'id')
    .map((column) => `${column} = excluded.${column}`)
    .join(', ');

  return `INSERT INTO image_cache (${columns.join(', ')}) VALUES (${values.map(sqlValue).join(', ')}) ON CONFLICT(id) DO UPDATE SET ${updates};`;
}

export function buildMigrationSql(records, publicBaseUrl) {
  return `${records
    .map((record) => buildUpsertSql(record, getR2Key(record), publicBaseUrl))
    .join('\n')}\n`;
}

export async function fetchAllRecords(fetchFn, sourceUrl, pageSize = 100) {
  const records = [];
  let offset = 0;

  while (true) {
    const url = new URL(sourceUrl);
    url.searchParams.set('limit', String(pageSize));
    url.searchParams.set('offset', String(offset));
    url.searchParams.set('orderBy', 'recent');
    const response = await fetchFn(url.toString());
    if (!response.ok) {
      throw new Error(`Source gallery request failed: ${response.status}`);
    }

    const payload = await response.json();
    const page = Array.isArray(payload.images) ? payload.images : [];
    records.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return records;
}

export async function sha256Hex(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const input = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function createManifestEntry(record, bytes, contentType) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const key = getR2Key(record);
  const normalizedContentType = contentType.split(';')[0].trim().toLowerCase();
  const inferredTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  const extension = Object.keys(inferredTypes).find((suffix) => key.endsWith(suffix));
  const resolvedContentType = normalizedContentType === 'application/octet-stream'
    ? inferredTypes[extension] || normalizedContentType
    : normalizedContentType;

  return {
    id: record.id,
    key,
    sourceUrl: record.image_url,
    contentType: resolvedContentType || 'application/octet-stream',
    byteLength: view.byteLength,
    sha256: await sha256Hex(view),
  };
}
