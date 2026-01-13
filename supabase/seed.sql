-- Supabase Seed File
-- 用于本地开发时初始化数据

-- 创建存储桶 (仅本地开发有效)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'coloring-images',
  'coloring-images',
  true,
  5242880,  -- 5MB 限制
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- 设置存储策略：公开读取
CREATE POLICY IF NOT EXISTS "Public read coloring-images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'coloring-images');

-- 设置存储策略：服务端可上传
CREATE POLICY IF NOT EXISTS "Service upload coloring-images" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'coloring-images');

CREATE POLICY IF NOT EXISTS "Service delete coloring-images" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'coloring-images');
