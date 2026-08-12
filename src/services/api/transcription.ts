export type TranscriptionLanguage = 'zh' | 'en';

interface TranscriptionResponse {
  text?: string;
  error?: string;
}

export async function transcribeAudio(
  audio: Blob,
  language: TranscriptionLanguage
): Promise<string> {
  const apiUrl = import.meta.env.DEV
    ? 'http://localhost:3001/api/transcribe'
    : '/api/transcribe';

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': audio.type || 'audio/webm',
      'X-Transcription-Language': language,
    },
    body: audio,
  });

  const data = await response.json().catch(() => ({})) as TranscriptionResponse;

  if (!response.ok) {
    throw new Error(data.error || `Transcription failed with status ${response.status}`);
  }

  const text = data.text?.trim();
  if (!text) {
    throw new Error('No speech recognized');
  }

  return text;
}
