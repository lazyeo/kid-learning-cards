# R2 WebP Transcoding Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convert newly generated PNG and JPEG images to quality-80 WebP before storing them in R2, with a safe original-format fallback.

**Architecture:** Add a small structural type for Cloudflare's Images binding and inject it into `R2StorageAdapter`. The adapter performs conversion only for non-WebP inputs and falls back to the original bytes on any transformation failure. A distinct `IMAGE_TRANSFORMER` binding is wired through the Pages environment and Wrangler configuration.

**Tech Stack:** TypeScript, Vitest, Cloudflare Pages Functions, Cloudflare Images binding, R2.

---

### Task 1: Add WebP conversion to the R2 adapter

**Files:**
- Modify: `tests/unit/image/R2StorageAdapter.test.ts`
- Modify: `src/services/image/types.ts`
- Modify: `src/services/image/storage/R2StorageAdapter.ts`

**Step 1: Write the failing tests**

Add tests proving that a PNG is transformed to quality-80 WebP before `bucket.put`, an existing WebP skips the transformer, and a transformer failure stores the original PNG.

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/unit/image/R2StorageAdapter.test.ts`

Expected: FAIL because `R2StorageAdapter` does not accept or call an Images binding.

**Step 3: Write the minimal implementation**

Define structural `ImagesBindingLike` types. Add an optional transformer constructor argument, convert non-WebP bytes with `.input(stream).output({ format: 'image/webp', quality: 80 })`, and catch failures before storing the original input.

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run tests/unit/image/R2StorageAdapter.test.ts`

Expected: all R2 adapter tests PASS.

**Step 5: Commit**

```bash
git add src/services/image/types.ts src/services/image/storage/R2StorageAdapter.ts tests/unit/image/R2StorageAdapter.test.ts
git commit -m "feat(storage): transcode R2 images to WebP"
```

### Task 2: Wire the Images binding into Pages configuration

**Files:**
- Modify: `tests/unit/image/pagesImageConfig.test.ts`
- Modify: `tests/unit/image/imageServiceFactory.test.ts`
- Modify: `functions/env.d.ts`
- Modify: `functions/lib/imageServiceConfig.ts`
- Modify: `src/services/image/config/factory.ts`

**Step 1: Write the failing tests**

Add assertions that the Pages environment exposes `IMAGE_TRANSFORMER`, the Cloudflare config retains it, and the factory passes it to R2 storage behavior.

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/unit/image/pagesImageConfig.test.ts tests/unit/image/imageServiceFactory.test.ts`

Expected: FAIL because the binding is not part of the config.

**Step 3: Write the minimal implementation**

Extend the Pages environment and Cloudflare config types, map `IMAGE_TRANSFORMER` in `buildImageServiceConfig`, and pass it into `R2StorageAdapter`.

**Step 4: Run tests to verify they pass**

Run the same focused test command and expect all tests to PASS.

**Step 5: Commit**

```bash
git add functions/env.d.ts functions/lib/imageServiceConfig.ts src/services/image/config/factory.ts tests/unit/image/pagesImageConfig.test.ts tests/unit/image/imageServiceFactory.test.ts
git commit -m "feat(storage): configure Cloudflare image transforms"
```

### Task 3: Configure Cloudflare and verify production

**Files:**
- Modify: `wrangler.toml`
- Modify: `README.md`

**Step 1: Add the binding and documentation**

Add `[images] binding = "IMAGE_TRANSFORMER"` without changing the existing R2 `IMAGES` binding. Document the quality-80 WebP conversion and original-format fallback.

**Step 2: Run full verification**

Run: `npm test -- --run && npm run lint && npm run build`

Run: `/Users/lab/Flash-Claude/projects/kids-learning-cards/node_modules/.bin/wrangler pages functions build functions --outfile _worker.bundle`

Expected: 0 test failures, lint exit 0, build exit 0, Worker compilation success.

**Step 3: Commit**

```bash
git add wrangler.toml README.md docs/plans/2026-08-15-r2-webp-transcoding-implementation.md
git commit -m "chore(cloudflare): enable WebP image binding"
```

**Step 4: Integrate and deploy**

Fast-forward the verified branch into `main`, push `origin/main`, deploy Pages, generate a forced `gpt-image` test image, and confirm the response has an `.webp` R2 storage path and `image/webp` response metadata.
