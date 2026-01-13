import { describe, it, expect } from 'vitest';
import { pinyin } from 'pinyin-pro';

describe('Pinyin Generation', () => {
  it('should generate correct pinyin for single Chinese characters', () => {
    expect(pinyin('天')).toBe('tiān');
    expect(pinyin('地')).toBe('dì');
    expect(pinyin('玄')).toBe('xuán');
    expect(pinyin('黄')).toBe('huáng');
  });

  it('should handle non-Chinese characters', () => {
    // pinyin-pro behavior for non-Chinese
    expect(pinyin('a')).toBe('a');
    // We filter this in our component logic, but good to know library behavior
  });

  it('should handle multiple characters', () => {
    expect(pinyin('你好')).toBe('nǐ hǎo');
  });
});
