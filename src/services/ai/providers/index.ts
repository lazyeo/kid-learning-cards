import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { AntigravityProvider } from './antigravity';
import { ModelScopeProvider } from './modelscope';
import { GptImageProvider } from './gptImage';

export const PROVIDERS = {
  openai: OpenAIProvider,
  gemini: GeminiProvider,
  antigravity: AntigravityProvider,
  modelscope: ModelScopeProvider,
  'gpt-image': GptImageProvider,
} as const;

export type ProviderName = keyof typeof PROVIDERS;

export {
  OpenAIProvider,
  GeminiProvider,
  AntigravityProvider,
  ModelScopeProvider,
  GptImageProvider,
};
