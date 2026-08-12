# Cloudflare Storage Migration Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Move the coloring image cache and image objects from Supabase to Cloudflare D1 and R2, verify all migrated data, then switch Pages Functions while retaining Supabase as a rollback path.

**Architecture:** Keep the existing `CacheAdapter` and `StorageAdapter` boundaries. Add D1 and R2 implementations selected by a `STORAGE_BACKEND` setting in Pages Functions; leave the default on Supabase until migration verification is complete. Migrate the 31 current rows idempotently through Wrangler, verify row counts and image hashes, run a final incremental pass, then switch the binding-backed implementation without deleting Supabase data.

**Tech Stack:** TypeScript, React/Vite, Cloudflare Pages Functions, D1, R2, Wrangler 4.121.0, Vitest.

---

### Task 1: Bind Cloudflare resources and initialize D1

**Files:**
- Modify: `wrangler.toml`
- Create: `migrations/0001_create_image_cache.sql`

**Steps:**
1. Add `DB` binding for D1 database `kids-learning-cards-db` (`54845b2a-adf6-4478-8536-0ba961b657d1`).
2. Add `IMAGES` binding for R2 bucket `kids-learning-cards-images`.
3. Write a SQLite-compatible `image_cache` schema preserving Supabase IDs, timestamps, metadata, and lookup indexes.
4. Run `wrangler d1 execute kids-learning-cards-db --remote --file migrations/0001_create_image_cache.sql`.
5. Verify with `wrangler d1 execute kids-learning-cards-db --remote --command "SELECT name FROM sqlite_master WHERE type='table'"`.

### Task 2: Add a D1 cache adapter with TDD

**Files:**
- Create: `tests/unit/image/D1CacheAdapter.test.ts`
- Create: `src/services/image/cache/D1CacheAdapter.ts`
- Modify: `src/services/image/cache/index.ts`
- Modify: `src/services/image/types.ts`

**Steps:**
1. Write failing tests for exact lookup, storing rows, gallery ordering/pagination, atomic access increments, and metadata parsing.
2. Run the focused test and confirm failure because the adapter is missing.
3. Implement the smallest D1 adapter satisfying `CacheAdapter`.
4. Re-run the focused test and confirm it passes.

### Task 3: Add an R2 storage adapter and image route with TDD

**Files:**
- Create: `tests/unit/image/R2StorageAdapter.test.ts`
- Create: `src/services/image/storage/R2StorageAdapter.ts`
- Modify: `src/services/image/storage/index.ts`
- Create: `functions/api/images/[[path]].ts`
- Modify: `functions/env.d.ts`

**Steps:**
1. Write failing tests for URL upload, Base64 upload, deterministic public URLs, deletion, MIME metadata, and path sanitization.
2. Run the focused test and confirm failure because the adapter is missing.
3. Implement the R2 adapter using only Web APIs and the R2 binding.
4. Add a read-only Pages Function that streams R2 objects with content type, cache headers, and ETag.
5. Re-run the focused tests and type-check the Pages Functions.

### Task 4: Select the backend without removing rollback

**Files:**
- Create: `tests/unit/image/imageServiceFactory.test.ts`
- Modify: `src/services/image/config/factory.ts`
- Modify: `src/services/image/types.ts`
- Modify: `functions/api/generate-image.ts`
- Modify: `functions/api/gallery.ts`
- Modify: `functions/api/gallery-increment.ts`
- Modify: `functions/env.d.ts`

**Steps:**
1. Write a failing factory test proving Cloudflare bindings select D1/R2 while Supabase remains selectable.
2. Add a `cloudflare` config containing `DB`, `IMAGES`, and `publicBaseUrl`.
3. Update each Pages Function to select Cloudflare only when `STORAGE_BACKEND=cloudflare`; otherwise retain Supabase.
4. Run focused tests and build.

### Task 5: Build an idempotent Wrangler migration script

**Files:**
- Create: `tests/unit/migration/cloudflareMigration.test.ts`
- Create: `scripts/migrate-supabase-to-cloudflare.mjs`
- Create: `scripts/lib/cloudflareMigration.mjs`

**Steps:**
1. Write failing tests for SQL escaping, R2 key generation, duplicate-safe upserts, pagination, and manifest hashing.
2. Implement a dry-run-first script that reads the production gallery API, downloads each public image, computes SHA-256, uploads via `wrangler r2 object put --remote`, and imports rows through a generated D1 SQL file.
3. Store the non-secret migration manifest in `/tmp`, not the repository.
4. Run the script in dry-run mode and confirm it discovers 31 records without remote writes.

### Task 6: Migrate and verify production data

**Files:**
- No repository files required; manifest stays under `/tmp`.

**Steps:**
1. Run the migration script with `--apply`.
2. Re-run it once to prove idempotency and catch records created during the first pass.
3. Compare Supabase source count and IDs against D1.
4. Compare each downloaded source SHA-256 against the R2 object downloaded with Wrangler.
5. Require 31/31 database rows and 31/31 matching objects before cutover.

### Task 7: Cut over only after verification

**Files:**
- Modify: `wrangler.toml`
- Modify: `README.md`

**Steps:**
1. Add `STORAGE_BACKEND = "cloudflare"` for production only after Task 6 passes.
2. Build and run all relevant tests.
3. Deploy with `npm run deploy:cf` only after reviewing the deployment diff.
4. Smoke-test gallery reads, access increments, image delivery, new image generation, and voice transcription.
5. Leave Supabase secrets, table, and bucket intact for rollback; document rollback as changing `STORAGE_BACKEND` back to `supabase` and redeploying.
