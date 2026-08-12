import { afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ColoringOptions } from '../../src/components/generators/coloring/ColoringOptions';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('ColoringOptions', () => {
  it('should render all option sections', () => {
    const onGenerate = vi.fn();
    render(<ColoringOptions onGenerate={onGenerate} isGenerating={false} />);

    expect(screen.getByText('说出来，让我帮你画')).toBeInTheDocument();
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
      })
    );
  });

  it('should update the default subject when the theme changes', () => {
    const onGenerate = vi.fn();
    render(<ColoringOptions onGenerate={onGenerate} isGenerating={false} />);

    fireEvent.click(screen.getByRole('button', { name: '食物' }));

    fireEvent.click(screen.getByText('生成涂色卡片'));

    expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({
      theme: 'food',
      subject: 'cake',
    }));
  });

  it('should show loading state', () => {
    const onGenerate = vi.fn();
    render(<ColoringOptions onGenerate={onGenerate} isGenerating={true} />);

    expect(screen.getByText('AI 正在绘画中...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /AI 正在绘画中/i })).toBeDisabled();
  });

  it('lets a child confirm a spoken idea without reading the transcript', async () => {
    class FakeSpeechSynthesisUtterance {
      text: string;
      lang = '';
      rate = 1;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;

      constructor(text: string) {
        this.text = text;
      }
    }

    class FakeMediaRecorder {
      static isTypeSupported() {
        return true;
      }

      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onstop: (() => void) | null = null;
      state = 'inactive';

      start() {
        this.state = 'recording';
      }

      stop() {
        this.state = 'inactive';
        this.ondataavailable?.({ data: new Blob(['voice'], { type: 'audio/webm' }) });
        this.onstop?.();
      }
    }

    const stopTrack = vi.fn();
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: stopTrack }],
        }),
      },
    });

    vi.stubGlobal('MediaRecorder', FakeMediaRecorder);
    vi.stubGlobal('SpeechSynthesisUtterance', FakeSpeechSynthesisUtterance);
    vi.stubGlobal('speechSynthesis', {
      cancel: vi.fn(),
      getVoices: vi.fn().mockReturnValue([]),
      speak: vi.fn((utterance: FakeSpeechSynthesisUtterance) => utterance.onend?.()),
    });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: '月亮上的恐龙' }),
    }));

    const onGenerate = vi.fn();
    render(<ColoringOptions onGenerate={onGenerate} isGenerating={false} />);

    fireEvent.click(screen.getByRole('button', { name: '说出想画的东西' }));
    fireEvent.click(await screen.findByRole('button', { name: '我说完了' }));

    await screen.findByRole('button', { name: '再听一次' });
    fireEvent.click(screen.getByRole('button', { name: '开始画' }));

    await waitFor(() => {
      expect(onGenerate).toHaveBeenCalledWith({
        theme: 'custom',
        subject: '月亮上的恐龙',
        difficulty: 'easy',
        customPrompt: '',
      });
    });
    expect(stopTrack).toHaveBeenCalled();
  });
});
