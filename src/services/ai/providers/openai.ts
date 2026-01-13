import { type ImageGeneratorProvider, type ImageGenOptions } from '../types';

export class OpenAIProvider implements ImageGeneratorProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  getName(): string {
    return 'OpenAI DALL-E 3';
  }

  getId(): string {
    return 'openai';
  }

  async generateImage(prompt: string, options: ImageGenOptions): Promise<string> {
    // DALL-E 3 only supports specific sizes: 1024x1024, 1024x1792, 1792x1024
    // We default to 1024x1024 for standard square images
    // const size = options.width && options.height ? `${options.width}x${options.height}` : '1024x1024';

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: prompt,
          n: 1,
          size: '1024x1024', // Ensure compatibility
          quality: options.quality || 'standard',
          response_format: 'url',
          style: 'natural' // DALL-E 3 supports 'vivid' or 'natural'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0 || !data.data[0].url) {
        throw new Error('No image URL received from OpenAI');
      }

      return data.data[0].url;
    } catch (error) {
      console.error('OpenAI image generation failed:', error);
      throw error;
    }
  }

  supportsFeatures(): string[] {
    return ['high_quality', 'complex_prompts', 'content_moderation'];
  }
}
