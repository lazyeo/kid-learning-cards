import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ImageGenerator } from '../../../src/services/ai/imageGenerator';
import { ImageGeneratorProvider, ImageGenOptions, ColoringCardParams } from '../../../src/services/ai/types';

// Mock Provider Implementation
class MockProvider implements ImageGeneratorProvider {
  private id: string;
  private name: string;
  public generateImage = vi.fn();

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  getId() { return this.id; }
  getName() { return this.name; }
  supportsFeatures() { return ['mock']; }
}

describe('ImageGenerator', () => {
  let generator: ImageGenerator;
  let mockProvider1: MockProvider;
  let mockProvider2: MockProvider;

  beforeEach(() => {
    generator = new ImageGenerator();
    mockProvider1 = new MockProvider('mock1', 'Mock Provider 1');
    mockProvider2 = new MockProvider('mock2', 'Mock Provider 2');

    // Setup mock return
    mockProvider1.generateImage.mockResolvedValue('http://mock1.com/image.png');
    mockProvider2.generateImage.mockResolvedValue('http://mock2.com/image.png');
  });

  it('should register a provider', () => {
    generator.registerProvider(mockProvider1);
    expect(generator.getRegisteredProviderIds()).toContain('mock1');
  });

  it('should automatically select the first registered provider', () => {
    generator.registerProvider(mockProvider1);
    expect(generator.getCurrentProviderId()).toBe('mock1');
  });

  it('should allow switching providers', () => {
    generator.registerProvider(mockProvider1);
    generator.registerProvider(mockProvider2);

    // Default should be first one
    expect(generator.getCurrentProviderId()).toBe('mock1');

    // Switch
    generator.switchProvider('mock2');
    expect(generator.getCurrentProviderId()).toBe('mock2');
  });

  it('should throw error when switching to invalid provider', () => {
    expect(() => generator.switchProvider('invalid')).toThrow();
  });

  it('should throw error when generating without provider', async () => {
    const params: ColoringCardParams = {
      theme: 'test',
      subject: 'test',
      difficulty: 'easy'
    };

    await expect(generator.generate(params)).rejects.toThrow('No AI provider selected');
  });

  it('should call the current provider to generate image', async () => {
    generator.registerProvider(mockProvider1);

    const params: ColoringCardParams = {
      theme: 'animals',
      subject: 'cat',
      difficulty: 'easy'
    };

    const result = await generator.generate(params);

    expect(result).toBe('http://mock1.com/image.png');
    expect(mockProvider1.generateImage).toHaveBeenCalledTimes(1);

    // Verify prompt construction happened (roughly)
    const callArgs = mockProvider1.generateImage.mock.calls[0];
    expect(callArgs[0]).toContain('cat');
    expect(callArgs[0]).toContain('animals');
  });
});
