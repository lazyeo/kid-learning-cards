import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { AntigravityProvider } from './antigravity';

export const PROVIDERS = {
  openai: OpenAIProvider,
  gemini: GeminiProvider,
  antigravity: AntigravityProvider,
} as const;

export type ProviderName = keyof typeof PROVIDERS;

export { OpenAIProvider, GeminiProvider, AntigravityProvider };
