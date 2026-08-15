# R2 WebP Transcoding Design

## Goal

Restore the previous image-size control by converting newly generated PNG and JPEG images to WebP before writing them to Cloudflare R2.

## Architecture

Use Cloudflare's native Images binding rather than `sharp` or a bundled WebAssembly codec. The existing `IMAGES` binding remains the R2 bucket, while a new `IMAGE_TRANSFORMER` binding accepts raw image bytes and returns WebP at quality 80.

`R2StorageAdapter` receives the transformer as an optional dependency. Before storing non-WebP image bytes, it asks the transformer for WebP output and writes the transformed bytes with an `.webp` key and `image/webp` metadata. Existing WebP inputs are stored without another transformation.

## Failure Handling

Image generation and storage must remain available when transformation is unavailable. If the binding is absent, rejects the input, returns a failed response, or exceeds the account's transformation allowance, the adapter logs a concise warning and stores the original bytes and MIME type.

## Configuration

Add an Images binding named `IMAGE_TRANSFORMER` to `wrangler.toml`. Thread that optional binding through the Pages environment configuration and the image service factory without exposing it to browser code.

## Testing

Unit tests cover successful PNG-to-WebP conversion, skipping an existing WebP image, falling back to the original image after a conversion failure, and passing the binding from Pages configuration into the R2 adapter. Full tests, lint, production build, and a Wrangler Functions build run before deployment.
