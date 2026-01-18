import { useState } from 'react';
import { type ColoringCardParams } from '../services/ai/types';
import { generateImageWithDetails } from '../services/api/client';
import { toast } from 'react-hot-toast';

export interface GenerationState {
  isLoading: boolean;
  imageUrl: string | null;
  error: Error | null;
  /** 使用的 Provider ID */
  usedProvider?: string;
  /** 是否来自缓存 */
  cached?: boolean;
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
      // 通过后端 API 调用（不指定 provider，使用自动调度 + 降级）
      const result = await generateImageWithDetails(params, {
        useCache: true
      });

      setState({
        isLoading: false,
        imageUrl: result.imageUrl,
        error: null,
        usedProvider: result.provider,
        cached: result.cached
      });

      // 成功提示
      if (result.cached) {
        toast.success('使用缓存的涂色卡片');
      } else {
        toast.success(`涂色卡片生成成功！(${result.provider})`);
      }
    } catch (error: unknown) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : '请稍后重试';

      setState({
        isLoading: false,
        imageUrl: null,
        error: error instanceof Error ? error : new Error('Unknown error')
      });

      toast.error(`生成失败: ${errorMessage}`, { duration: 5000 });
    }
  };

  const reset = () => {
    setState({
      isLoading: false,
      imageUrl: null,
      error: null,
      usedProvider: undefined,
      cached: undefined
    });
  };

  return {
    ...state,
    generate,
    reset
  };
}

