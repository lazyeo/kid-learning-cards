import { describe, expect, it, vi } from 'vitest';

import { handleTranscriptionRequest } from '../../functions/api/transcribe';

describe('handleTranscriptionRequest', () => {
  it('transcribes short-lived audio bytes with Workers AI', async () => {
    const run = vi.fn().mockResolvedValue({ text: ' 月亮上的恐龙 ' });
    const request = new Request('https://example.test/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'audio/webm',
        'X-Transcription-Language': 'zh',
      },
      body: new Uint8Array([1, 2, 3]),
    });

    const response = await handleTranscriptionRequest(request, { AI: { run } });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ text: '月亮上的恐龙' });
    expect(run).toHaveBeenCalledWith('@cf/openai/whisper', {
      audio: [1, 2, 3],
    });
  });

  it('rejects requests that are not audio', async () => {
    const run = vi.fn();
    const request = new Request('https://example.test/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'not audio',
    });

    const response = await handleTranscriptionRequest(request, { AI: { run } });

    expect(response.status).toBe(415);
    expect(run).not.toHaveBeenCalled();
  });
});
