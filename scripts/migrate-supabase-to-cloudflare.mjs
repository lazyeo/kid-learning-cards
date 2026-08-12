import { execFile } from 'node:child_process';
import {
  mkdir,
  readFile,
  unlink,
  writeFile,
} from 'node:fs/promises';
import { promisify } from 'node:util';

import {
  buildMigrationSql,
  createManifestEntry,
  fetchAllRecords,
  sha256Hex,
} from './lib/cloudflareMigration.mjs';

const execFileAsync = promisify(execFile);
const WRANGLER = ['--yes', 'wrangler@4.121.0'];
const DEFAULTS = {
  source: 'https://kids-learning-cards.pages.dev/api/gallery',
  database: 'kids-learning-cards-db',
  bucket: 'kids-learning-cards-images',
  publicBaseUrl: 'https://kids.a-dobe.club/api/images',
  workdir: '/tmp/kids-learning-cards-cloudflare-migration',
};

function readArgument(name, fallback) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : fallback;
}

async function runWrangler(args) {
  const { stdout, stderr } = await execFileAsync('npx', [...WRANGLER, ...args], {
    maxBuffer: 20 * 1024 * 1024,
  });
  if (stderr.trim()) process.stderr.write(stderr);
  return stdout;
}

async function downloadSourceImage(record) {
  const response = await fetch(record.image_url);
  if (!response.ok) {
    throw new Error(`Image ${record.id} download failed: ${response.status}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
  return {
    bytes,
    entry: await createManifestEntry(record, bytes, contentType),
  };
}

async function uploadAndVerify(entry, bytes, options) {
  const sourceFile = `${options.workdir}/${entry.id}.source`;
  const verifyFile = `${options.workdir}/${entry.id}.r2`;
  await writeFile(sourceFile, bytes);

  try {
    await runWrangler([
      'r2', 'object', 'put', `${options.bucket}/${entry.key}`,
      '--remote',
      '--file', sourceFile,
      '--content-type', entry.contentType,
      '--cache-control', 'public, max-age=31536000, immutable',
    ]);
    await runWrangler([
      'r2', 'object', 'get', `${options.bucket}/${entry.key}`,
      '--remote',
      '--file', verifyFile,
    ]);
    const uploadedHash = await sha256Hex(new Uint8Array(await readFile(verifyFile)));
    if (uploadedHash !== entry.sha256) {
      throw new Error(`R2 hash mismatch for ${entry.id}`);
    }
  } finally {
    await Promise.all([
      unlink(sourceFile).catch(() => undefined),
      unlink(verifyFile).catch(() => undefined),
    ]);
  }
}

async function main() {
  const apply = process.argv.includes('--apply');
  const options = {
    source: readArgument('--source', DEFAULTS.source),
    database: readArgument('--database', DEFAULTS.database),
    bucket: readArgument('--bucket', DEFAULTS.bucket),
    publicBaseUrl: readArgument('--public-base-url', DEFAULTS.publicBaseUrl),
    workdir: readArgument('--workdir', DEFAULTS.workdir),
  };

  await mkdir(options.workdir, { recursive: true });
  const records = await fetchAllRecords(fetch, options.source);
  const manifest = [];

  console.log(`[migration] Mode: ${apply ? 'APPLY' : 'DRY RUN'}`);
  console.log(`[migration] Source records: ${records.length}`);

  for (let index = 0; index < records.length; index += 1) {
    const record = records[index];
    const { bytes, entry } = await downloadSourceImage(record);
    manifest.push(entry);

    if (apply) {
      console.log(`[migration] R2 ${index + 1}/${records.length}: ${entry.key}`);
      await uploadAndVerify(entry, bytes, options);
    }
  }

  const manifestPath = `${options.workdir}/manifest.json`;
  const sqlPath = `${options.workdir}/image-cache.sql`;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(sqlPath, buildMigrationSql(records, options.publicBaseUrl));

  if (apply) {
    console.log('[migration] Importing D1 rows...');
    await runWrangler([
      'd1', 'execute', options.database,
      '--remote',
      '--file', sqlPath,
      '--yes',
    ]);
  }

  console.log(`[migration] Manifest: ${manifestPath}`);
  console.log(`[migration] SQL: ${sqlPath}`);
  console.log(`[migration] Verified source hashes: ${manifest.length}/${records.length}`);
  if (apply) console.log(`[migration] Verified R2 hashes: ${manifest.length}/${records.length}`);
}

main().catch((error) => {
  console.error('[migration] Failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
