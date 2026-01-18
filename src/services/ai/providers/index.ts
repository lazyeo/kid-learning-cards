import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { AntigravityProvider } from './antigravity';
import { ModelScopeProvider } from './modelscope';

export const PROVIDERS = {
  openai: OpenAIProvider,
  gemini: GeminiProvider,
  antigravity: AntigravityProvider,
  modelscope: ModelScopeProvider,
} as const;

export type ProviderName = keyof typeof PROVIDERS;

export {
  OpenAIProvider,
  GeminiProvider,
  AntigravityProvider,
  ModelScopeProvider
};
