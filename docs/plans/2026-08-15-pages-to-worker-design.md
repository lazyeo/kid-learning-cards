# Pages to Worker Migration Design

## Goal

Move the Vite SPA and existing Pages Functions into a staging Cloudflare Worker so the application can use the full Workers binding set, including the Images binding, while leaving the current Pages production site available for rollback.

## Architecture

Wrangler continues to compile the existing `functions/` directory into a single generated Worker entry point under `.worker/index.js`. Worker Static Assets serves the Vite `dist/` output with SPA fallback, while `/api/*` requests run through the compiled Worker first. The existing D1, R2, Workers AI, and Images resources are attached directly to the staging Worker.

The staging Worker is named `kids-learning-cards-worker` and initially uses only its `workers.dev` URL. The current Pages project and `kids.a-dobe.club` remain unchanged until all secrets are entered and production smoke tests pass.

## Configuration and Secrets

Non-secret configuration such as the GPT Image base URL, model, storage backend, D1 database ID, and R2 bucket name stays in `wrangler.toml`. API keys and provider-specific secret values are added later by the user through the Cloudflare dashboard or `wrangler secret put`; they are never committed.

## Rollout

Build and dry-run the Worker locally, deploy it to `workers.dev`, verify static assets and non-provider API routes, then pause for secrets. After secrets are supplied, verify ListenHub, GPT Image fallback, WebP conversion, D1, and R2. Only then route `kids.a-dobe.club/*` to the Worker. Keep Pages during the observation period and delete it only after explicit approval.

