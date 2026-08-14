# GPT Image Provider Implementation Plan

> **For Codex:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an independently configured `gpt-image-2` compatible provider as the first fallback after ListenHub/LabNana.

**Architecture:** Implement a provider behind the existing `ImageGeneratorProvider` contract and register it through `ImageServiceConfig`. Keep credentials server-side and use the existing `ProviderOrchestrator` for automatic fallback.

**Tech Stack:** TypeScript, React/Vite service layer, Cloudflare Pages Functions, Vitest.

---

### Task 1: Define provider behavior with failing tests

**Files:**
- Create: `tests/unit/ai/gptImageProvider.test.ts`
- Create: `src/services/ai/providers/gptImage.ts`

1. Add tests asserting base URL normalization, `gpt-image-2` request fields, bearer authentication, `standard → medium`, `hd → high`, base64 output, URL output, API errors, and malformed response errors.
2. Run `npm test -- --run tests/unit/ai/gptImageProvider.test.ts` and verify it fails because the provider does not exist.
3. Implement the minimal provider using `fetch`, `AbortController`, and the existing provider interface.
4. Re-run the focused test and verify it passes.

### Task 2: Wire dedicated server configuration

**Files:**
- Modify: `src/services/image/types.ts`
- Modify: `src/services/image/config/factory.ts`
- Modify: `src/services/image/providers/index.ts`
- Modify: `functions/lib/imageServiceConfig.ts`
- Modify: `functions/env.d.ts`
- Modify: `dev-server.js`
- Test: `tests/unit/image/pagesImageConfig.test.ts`
- Test: `tests/unit/image/imageServiceFactory.test.ts`

1. Add failing tests for `GPT_IMAGE_BASE_URL`, `GPT_IMAGE_API_KEY`, the default model, and provider registration only with complete credentials.
2. Run the two focused config test files and verify the new assertions fail.
3. Add `gptImage` credentials and construct `GptImageProvider` in the factory.
4. Map Cloudflare and local development environment variables without exposing them through `VITE_*` configuration.
5. Re-run the focused config tests and verify they pass.

### Task 3: Make GPT Image the first fallback

**Files:**
- Modify: `src/services/image/providers/ProviderOrchestrator.ts`
- Create: `tests/unit/image/providerOrchestrator.test.ts`
- Modify: `README.md`

1. Add a failing orchestration test proving LabNana is attempted first and GPT Image second.
2. Run the focused test and verify it fails against the old priority list.
3. Insert `gpt-image` after `labnana`, add its timeout, and document the variables and priority override.
4. Re-run the focused test and verify it passes.

### Task 4: Verify and commit

1. Run `npm test -- --run` and require all tests to pass.
2. Run `npm run lint` and require zero errors and warnings.
3. Run `npm run build` and require success.
4. Run `npx --yes wrangler@4.121.0 pages functions build` and require successful compilation.
5. Review `git diff --check`, ensure no secrets are present, and commit the implementation.

