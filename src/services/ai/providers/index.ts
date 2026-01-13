import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';

export const PROVIDERS = {
  openai: OpenAIProvider,
  gemini: GeminiProvider,
} as const;

export type ProviderName = keyof typeof PROVIDERS;

export { OpenAIProvider, GeminiProvider };
