import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColoringOptions } from '../../src/components/generators/coloring/ColoringOptions';

describe('ColoringOptions', () => {
  it('should render all option sections', () => {
    const onGenerate = vi.fn();
    render(<ColoringOptions onGenerate={onGenerate} isGenerating={false} />);

    expect(screen.getByText('AI 模型')).toBeInTheDocument();
    expect(screen.getByText('主题')).toBeInTheDocument();
    expect(screen.getByText('具体内容')).toBeInTheDocument();
    expect(screen.getByText('复杂度')).toBeInTheDocument();
    expect(screen.getByText('生成涂色卡片')).toBeInTheDocument();
  });

  it('should call onGenerate with correct params when button is clicked', () => {
    const onGenerate = vi.fn();
    render(<ColoringOptions onGenerate={onGenerate} isGenerating={false} />);

    // Click generate button
    const generateBtn = screen.getByText('生成涂色卡片');
    fireEvent.click(generateBtn);

    expect(onGenerate).toHaveBeenCalledTimes(1);
    // Verify default params
    expect(onGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: 'animals',
        subject: 'cat',
        difficulty: 'easy',
        customPrompt: ''
      }),
      'openai' // Default provider
    );
  });

  it('should allow changing provider', () => {
    const onGenerate = vi.fn();
    render(<ColoringOptions onGenerate={onGenerate} isGenerating={false} />);

    // Click Gemini button
    const geminiBtn = screen.getByText('Google Gemini');
    fireEvent.click(geminiBtn);

    // Click generate
    const generateBtn = screen.getByText('生成涂色卡片');
    fireEvent.click(generateBtn);

    expect(onGenerate).toHaveBeenCalledWith(
      expect.anything(),
      'gemini'
    );
  });

  it('should show loading state', () => {
    const onGenerate = vi.fn();
    render(<ColoringOptions onGenerate={onGenerate} isGenerating={true} />);

    expect(screen.getByText('AI 正在绘画中...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI 正在绘画中/i })).toBeDisabled();
  });
});
