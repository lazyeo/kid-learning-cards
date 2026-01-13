import { useState } from 'react';
import { generateImage } from '../services/api/client';
import { type ColoringCardParams } from '../services/ai/types';
import { toast } from 'react-hot-toast';

export interface GenerationState {
  isLoading: boolean;
  imageUrl: string | null;
  error: Error | null;
}

export function useImageGeneration() {
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    imageUrl: null,
    error: null
  });

  const generate = async (params: ColoringCardParams) => {
    setState({ isLoading: true, imageUrl: null, error: null });

    try {
      // 后台默认使用 antigravity provider
      const imageUrl = await generateImage(params, 'antigravity');
      setState({ isLoading: false, imageUrl, error: null });
      toast.success('涂色卡片生成成功！');
    } catch (error: unknown) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : '请稍后重试';
      setState({
        isLoading: false,
        imageUrl: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      });
      toast.error(`生成失败: ${errorMessage}`);
    }
  };

  const reset = () => {
    setState({ isLoading: false, imageUrl: null, error: null });
  };

  return {
    ...state,
    generate,
    reset
  };
}
