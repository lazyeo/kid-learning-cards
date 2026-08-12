import type { R2BucketLike, StorageAdapter, StorageResult } from '../types';

const IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';

function sanitizeFilename(filename: string): string {
  const ascii = Array.from(filename.normalize('NFD'))
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code <= 127 && !(code >= 0x300 && code <= 0x36f);
    })
    .join('');

  return ascii
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) || 'image';
}

function extensionFor(contentType: string): string {
  const normalized = contentType.split(';')[0].trim().toLowerCase();
  const extensions: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
    'image/gif': 'gif',
  };
  return extensions[normalized] || 'png';
}

export class R2StorageAdapter implements StorageAdapter {
  private readonly bucket: R2BucketLike;
  private readonly publicBaseUrl: string;

  constructor(
    bucket: R2BucketLike,
    publicBaseUrl: string
  ) {
    this.bucket = bucket;
    this.publicBaseUrl = publicBaseUrl.replace(/\/$/, '');
  }

  async storeFromUrl(imageUrl: string, filename: string): Promise<StorageResult> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type') || 'image/png';
    const body = await response.arrayBuffer();
    return this.storeBytes(body, contentType, filename);
  }

  async storeFromBase64(base64Data: string, filename: string): Promise<StorageResult> {
    const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    const contentType = match?.[1] || 'image/png';
    const encoded = match?.[2] || base64Data;
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return this.storeBytes(bytes, contentType, filename);
  }

  async delete(path: string): Promise<void> {
    await this.bucket.delete(path);
  }

  getPublicUrl(path: string): string {
    const encodedPath = path
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    return `${this.publicBaseUrl}/${encodedPath}`;
  }

  private async storeBytes(
    body: ArrayBuffer | Uint8Array,
    contentType: string,
    filename: string
  ): Promise<StorageResult> {
    const normalizedContentType = contentType.split(';')[0].trim().toLowerCase();
    const storagePath = `${Date.now()}-${sanitizeFilename(filename)}.${extensionFor(normalizedContentType)}`;

    await this.bucket.put(storagePath, body, {
      httpMetadata: {
        contentType: normalizedContentType,
        cacheControl: IMMUTABLE_CACHE_CONTROL,
      },
    });

    return {
      publicUrl: this.getPublicUrl(storagePath),
      storagePath,
    };
  }
}
