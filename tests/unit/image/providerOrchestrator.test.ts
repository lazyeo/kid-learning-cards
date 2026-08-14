import { describe, expect, it, vi } from 'vitest';

import type { ImageGeneratorProvider } from '../../../src/services/ai/types';
import { ProviderOrchestrator } from '../../../src/services/image/providers/ProviderOrchestrator';

function createProvider(
  id: string,
  generateImage: ImageGeneratorProvider['generateImage']
): ImageGeneratorProvider {
  return {
    getId: () => id,
    getName: () => id,
    generateImage,
    supportsFeatures: () => [],
  };
}

describe('ProviderOrchestrator default fallback order', () => {
  it('tries ListenHub/LabNana first and GPT Image second', async () => {
    const calls: string[] = [];
    const labnana = createProvider('labnana', vi.fn(async () => {
      calls.push('labnana');
      throw new Error('listenhub unavailable');
    }));
    const gptImage = createProvider('gpt-image', vi.fn(async () => {
      calls.push('gpt-image');
      return 'data:image/png;base64,cG5n';
    }));
    const orchestrator = new ProviderOrchestrator();
    orchestrator.registerProviders([gptImage, labnana]);

    const result = await orchestrator.generate('draw a fox', {});

    expect(calls).toEqual(['labnana', 'gpt-image']);
    expect(result.provider).toBe('gpt-image');
    expect(result.failedProviders?.map(provider => provider.providerId)).toEqual(['labnana']);
  });
});

