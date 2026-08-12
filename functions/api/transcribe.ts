const MAX_AUDIO_BYTES = 2 * 1024 * 1024;
const WHISPER_MODEL = '@cf/openai/whisper';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, X-Transcription-Language',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface WhisperResult {
  text?: string;
}

interface WorkersAiBinding {
  run(
    model: string,
    input: { audio: number[] }
  ): Promise<WhisperResult>;
}

export interface TranscriptionEnv {
  AI?: WorkersAiBinding;
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders,
      'Cache-Control': 'no-store',
    },
  });
}

export async function handleTranscriptionRequest(
  request: Request,
  env: TranscriptionEnv
): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const contentType = request.headers.get('Content-Type')?.toLowerCase() || '';
  if (!contentType.startsWith('audio/')) {
    return jsonResponse({ error: 'Audio content is required' }, 415);
  }

  const declaredSize = Number(request.headers.get('Content-Length') || '0');
  if (declaredSize > MAX_AUDIO_BYTES) {
    return jsonResponse({ error: 'Audio recording is too large' }, 413);
  }

  if (!env.AI) {
    return jsonResponse({ error: 'Speech recognition is unavailable' }, 503);
  }

  const audioBuffer = await request.arrayBuffer();
  if (audioBuffer.byteLength === 0) {
    return jsonResponse({ error: 'Audio recording is empty' }, 400);
  }
  if (audioBuffer.byteLength > MAX_AUDIO_BYTES) {
    return jsonResponse({ error: 'Audio recording is too large' }, 413);
  }

  try {
    const result = await env.AI.run(WHISPER_MODEL, {
      audio: Array.from(new Uint8Array(audioBuffer)),
    });
    const text = result.text?.trim();

    if (!text) {
      return jsonResponse({ error: 'No speech recognized' }, 422);
    }

    return jsonResponse({ text }, 200);
  } catch (error) {
    console.error('[transcribe] Workers AI request failed:', error);
    return jsonResponse({ error: 'Speech recognition failed' }, 502);
  }
}

export const onRequest: PagesFunction<TranscriptionEnv> = (context) => (
  handleTranscriptionRequest(context.request, context.env)
);
