interface R2ObjectBodyLike {
  body: ReadableStream;
  httpEtag?: string;
  writeHttpMetadata(headers: Headers): void;
}

interface ImageBucketLike {
  get(key: string): Promise<R2ObjectBodyLike | null>;
}

interface ImageEnv {
  IMAGES?: ImageBucketLike;
}

export const onRequest: PagesFunction<ImageEnv, 'path'> = async (context) => {
  if (context.request.method !== 'GET' && context.request.method !== 'HEAD') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD' },
    });
  }

  if (!context.env.IMAGES) {
    return Response.json({ error: 'Image storage is unavailable' }, { status: 503 });
  }

  const rawPath = context.params.path;
  const key = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
  if (!key || key.split('/').some((segment) => segment === '..')) {
    return Response.json({ error: 'Invalid image path' }, { status: 400 });
  }

  const object = await context.env.IMAGES.get(key);
  if (!object) {
    return new Response('Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  headers.set('Access-Control-Allow-Origin', '*');
  if (object.httpEtag) headers.set('ETag', object.httpEtag);

  return new Response(
    context.request.method === 'HEAD' ? null : object.body,
    { status: 200, headers }
  );
};
