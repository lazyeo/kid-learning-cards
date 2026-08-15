# Pages to Worker Migration Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deploy the existing SPA and Pages Functions as a staging Cloudflare Worker without switching production traffic.

**Architecture:** Compile file-based Pages Functions to `.worker/index.js`, serve `dist/` through Worker Static Assets, and run `/api/*` through the Worker first. Bind the existing D1, R2, Workers AI, and Images resources; defer secrets and custom-domain cutover until staging verification succeeds.

**Tech Stack:** Vite, React, TypeScript, Vitest, Wrangler, Cloudflare Workers Static Assets, D1, R2, Workers AI, Cloudflare Images.

---

### Task 1: Define the Worker deployment contract

**Files:**
- Create: `tests/unit/migration/workerDeploymentConfig.test.ts`
- Modify: `wrangler.toml`
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `.gitignore`

**Step 1: Write the failing test**

Read the deployment files and assert that the configuration has a Worker entry point, static assets with SPA fallback, `/api/*` Worker-first routing, Images/D1/R2/AI bindings, a staging Worker name, and Worker build/deploy scripts.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/unit/migration/workerDeploymentConfig.test.ts`

Expected: FAIL because the repository still uses `pages_build_output_dir` and `wrangler pages deploy`.

**Step 3: Write the minimal configuration**

Replace the Pages output setting with `main = ".worker/index.js"`, configure `dist` static assets and SPA fallback, keep existing resource bindings, and add scripts that compile Pages Functions then use `wrangler deploy`. Add Wrangler as an explicit dev dependency and ignore `.worker/`.

**Step 4: Run test to verify it passes**

Run the same focused test and expect PASS.

**Step 5: Commit**

```bash
git add .gitignore package.json package-lock.json wrangler.toml tests/unit/migration/workerDeploymentConfig.test.ts
git commit -m "feat(cloudflare): configure Worker deployment"
```

### Task 2: Document staging and secret migration

**Files:**
- Modify: `README.md`
- Add: `docs/plans/2026-08-15-pages-to-worker-design.md`
- Add: `docs/plans/2026-08-15-pages-to-worker-implementation.md`

**Step 1: Document commands and secret names**

Document Worker development/build/deploy commands, the staging-first rollout, and every provider secret that must be entered after the Worker exists.

**Step 2: Verify documentation and config formatting**

Run: `git diff --check`

Expected: exit 0.

**Step 3: Commit**

```bash
git add README.md docs/plans/2026-08-15-pages-to-worker-design.md docs/plans/2026-08-15-pages-to-worker-implementation.md
git commit -m "docs: add Worker migration runbook"
```

### Task 3: Build and verify the Worker artifact

**Files:** No tracked files expected.

**Step 1: Run full verification**

Run: `npm test -- --run && npm run lint && npm run build`

Expected: all tests pass, lint exits 0, Vite and Worker builds succeed.

**Step 2: Run Wrangler deployment validation**

Run: `npm run deploy:cf -- --dry-run`

Expected: Worker bundle and static assets validate without uploading.

**Step 3: Run local smoke tests**

Start `wrangler dev`, then verify `/` returns the SPA and an API route is handled by the compiled Worker.

### Task 4: Deploy the staging Worker

**Files:** No tracked files expected.

**Step 1: Deploy without a custom domain**

Run: `npm run deploy:cf`

Expected: a `kids-learning-cards-worker.<subdomain>.workers.dev` deployment. The Pages project and `kids.a-dobe.club` stay untouched.

**Step 2: Verify staging**

Check the root document, gallery route, deployed bindings, and Worker version. Provider generation is expected to remain unavailable until secrets are entered.

**Step 3: Hand off secret names**

List the required secrets without values and wait for the user to add them. Domain cutover and destructive Pages cleanup remain explicitly out of scope until the user confirms staging tests.
