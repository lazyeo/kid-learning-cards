import { describe, it, expect } from 'vitest';
import { buildColoringPrompt } from '../../../src/services/ai/utils/promptBuilder';
import { ColoringCardParams } from '../../../src/services/ai/types';

describe('promptBuilder', () => {
  it('should build a basic prompt with theme and subject', () => {
    const params: ColoringCardParams = {
      theme: 'animals',
      subject: 'cat',
      difficulty: 'easy'
    };

    const prompt = buildColoringPrompt(params);

    expect(prompt).toContain('a cute cat with animals theme');
    expect(prompt).toContain('black and white coloring page for kids');
    expect(prompt).toContain('very simple shapes'); // Easy difficulty keyword
  });

  it('should handle different difficulty levels', () => {
    const mediumParams: ColoringCardParams = {
      theme: 'cars',
      subject: 'race car',
      difficulty: 'medium'
    };
    expect(buildColoringPrompt(mediumParams)).toContain('moderate details');

    const hardParams: ColoringCardParams = {
      theme: 'fantasy',
      subject: 'dragon',
      difficulty: 'hard'
    };
    expect(buildColoringPrompt(hardParams)).toContain('intricate details');
  });

  it('should include custom prompt if provided', () => {
    const params: ColoringCardParams = {
      theme: 'animals',
      subject: 'dog',
      difficulty: 'easy',
      customPrompt: 'wearing a superhero cape'
    };

    const prompt = buildColoringPrompt(params);
    expect(prompt).toContain('wearing a superhero cape');
  });

  it('should handle empty custom prompt gracefully', () => {
    const params: ColoringCardParams = {
      theme: 'animals',
      subject: 'dog',
      difficulty: 'easy',
      customPrompt: '   ' // Empty string with spaces
    };

    const prompt = buildColoringPrompt(params);
    expect(prompt.endsWith(',')).toBe(false);
    expect(prompt).not.toContain(', ,');
  });
});
