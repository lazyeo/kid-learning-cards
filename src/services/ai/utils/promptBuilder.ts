import { type ColoringCardParams } from '../types';

/**
 * 构建用于生成涂色卡片的 Prompt
 */
export function buildColoringPrompt(params: ColoringCardParams): string {
  const { theme, subject, difficulty, customPrompt } = params;

  // 基础风格描述：强调黑白线稿，无阴影
  const baseStyle = "black and white coloring page for kids, thick clean outlines, pure white background, high contrast, vector line art style, no shading, no greyscale, no gradients, no colors";

  // 难度控制
  let complexityDesc = "";
  switch (difficulty) {
    case 'easy':
      complexityDesc = "very simple shapes, minimal details, large areas to color, suitable for toddlers";
      break;
    case 'medium':
      complexityDesc = "moderate details, balanced composition, suitable for preschoolers";
      break;
    case 'hard':
      complexityDesc = "intricate details, complex patterns, highly detailed, suitable for older children";
      break;
  }

  // 主题描述
  let subjectDesc = `a cute ${subject}`;
  if (theme) {
    subjectDesc += ` with ${theme} theme`;
  }

  // 组合 Prompt
  // 结构：[主体] + [风格] + [难度] + [额外要求]
  let finalPrompt = `${subjectDesc}, ${baseStyle}, ${complexityDesc}`;

  if (customPrompt && customPrompt.trim()) {
    finalPrompt += `, ${customPrompt.trim()}`;
  }

  // 负面提示词（通常在 API 调用时作为 negative_prompt 参数，但也融合进 prompt 以增强效果）
  // 这里我们只返回正向 Prompt，负面提示在 Provider 中处理或追加
  return finalPrompt;
}
