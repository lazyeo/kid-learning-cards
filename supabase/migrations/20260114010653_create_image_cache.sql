-- Kids Learning Cards - Supabase 数据库结构
-- 用于存储 AI 生成图片的缓存索引

-- 图片缓存表
CREATE TABLE IF NOT EXISTS image_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 缓存键（用于精确匹配）
  prompt_hash VARCHAR(64) NOT NULL,      -- SHA-256 hash of normalized params

  -- 原始数据（用于调试和分析）
  prompt_text TEXT NOT NULL,             -- 完整的 prompt 文本

  -- 结构化参数（用于查询）
  theme VARCHAR(50),                     -- 主题
  subject VARCHAR(100),                  -- 对象
  difficulty VARCHAR(20),                -- 难度: easy/medium/hard
  custom_prompt TEXT,                    -- 用户自定义 prompt

  -- 生成信息
  provider VARCHAR(50) NOT NULL,         -- AI 提供商: openai/gemini/antigravity

  -- 图片存储
  image_url TEXT NOT NULL,               -- 图片访问 URL
  storage_path TEXT,                     -- Supabase Storage 路径（如果存储在本地）

  -- 元数据
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,

  -- 扩展字段
  metadata JSONB DEFAULT '{}'::jsonb
);

-- 索引：加速查询
CREATE INDEX IF NOT EXISTS idx_image_cache_prompt_hash
  ON image_cache(prompt_hash);

CREATE INDEX IF NOT EXISTS idx_image_cache_theme_subject
  ON image_cache(theme, subject, difficulty);

CREATE INDEX IF NOT EXISTS idx_image_cache_provider
  ON image_cache(provider);

CREATE INDEX IF NOT EXISTS idx_image_cache_created_at
  ON image_cache(created_at DESC);

-- 复合索引：精确匹配查询
CREATE INDEX IF NOT EXISTS idx_image_cache_exact_match
  ON image_cache(prompt_hash, provider);

-- 注释
COMMENT ON TABLE image_cache IS 'AI 生成图片的缓存索引表';
COMMENT ON COLUMN image_cache.prompt_hash IS '参数的 SHA-256 哈希，用于精确匹配';
COMMENT ON COLUMN image_cache.prompt_text IS '发送给 AI 的完整 prompt';
COMMENT ON COLUMN image_cache.access_count IS '缓存命中次数，用于热度分析';

-- Storage Bucket 配置说明
-- 需要在 Supabase Dashboard 中手动创建：
-- 1. 进入 Storage 页面
-- 2. 创建新 Bucket: coloring-images
-- 3. 设置为 Public bucket（允许公开访问）
-- 4. 配置 CORS（如需要）
