# GPT Image Compatible Provider Design

## Goal

Add an independent OpenAI Images-compatible provider for `gpt-image-2` without changing the existing ListenHub/LabNana path. ListenHub remains the primary image provider; the new provider is the first fallback.

## Architecture

Create a `GptImageProvider` implementing the existing `ImageGeneratorProvider` interface. It receives `baseUrl`, `apiKey`, `model`, and timeout configuration, calls `POST /v1/images/generations`, and accepts either the official `data[0].b64_json` response or a compatible `data[0].url` response. Base URLs may be supplied as a host root, a `/v1` root, or the complete generations endpoint.

The provider uses dedicated server-side configuration: `GPT_IMAGE_BASE_URL`, `GPT_IMAGE_API_KEY`, and optional `GPT_IMAGE_MODEL` (default `gpt-image-2`). Secrets remain in Cloudflare Pages secrets and are never exposed to the browser. The provider is registered only when both base URL and API key are present.

## Fallback and errors

The default order becomes `labnana → gpt-image → antigravity → modelscope → gemini → openai`. Existing `PROVIDER_PRIORITY`/`VITE_PROVIDER_PRIORITY` overrides continue to take precedence, so reversing the first two providers later is a configuration-only change.

Requests use a two-minute provider timeout and map the existing `standard`/`hd` quality values to GPT Image `medium`/`high`. API errors preserve the upstream message without logging credentials or base64 image data. Empty or malformed successful responses are treated as provider failures so the orchestrator can continue falling back.

## Testing

Unit tests cover endpoint normalization, authorization and request shape, base64 and URL responses, malformed responses, upstream errors, config wiring, registration, and fallback order. Full Vitest, ESLint, TypeScript/Vite build, and Pages Functions compilation are required before integration.

