// Cloudflare Pages Functions 类型定义
// 手动声明以避免 @cloudflare/workers-types 与 @types/node 冲突

interface Env {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  ANTIGRAVITY_BASE_URL?: string;
  ANTIGRAVITY_API_KEY?: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  MODELSCOPE_API_KEY?: string;
  MODELSCOPE_BASE_URL?: string;
  MODELSCOPE_MODEL?: string;
  ENABLE_CACHE?: string;
}

// Cloudflare Pages Functions handler 类型
interface EventContext<E, P extends string, D> {
  request: Request;
  functionPath: string;
  waitUntil: (promise: Promise<unknown>) => void;
  passThroughOnException: () => void;
  env: E;
  params: Record<P, string | string[]>;
  data: D;
  next: (input?: Request | string, init?: RequestInit) => Promise<Response>;
}

type PagesFunction<E = unknown, P extends string = string, D = unknown> =
  (context: EventContext<E, P, D>) => Response | Promise<Response>;
