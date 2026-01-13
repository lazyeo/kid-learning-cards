-- 创建存储桶: coloring-images
-- 注意: Supabase 迁移不直接支持创建存储桶
-- 需要通过 Dashboard 或 API 创建

-- 如果使用 Supabase 本地开发，可以在 seed.sql 中使用以下语句：
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('coloring-images', 'coloring-images', true)
-- ON CONFLICT (id) DO NOTHING;

-- 存储策略：允许公开读取
-- 这个需要在 Dashboard -> Storage -> Policies 中配置
-- 或使用以下 SQL（需要在 Dashboard SQL Editor 中执行）：

/*
-- 允许匿名用户读取
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'coloring-images');

-- 允许已认证用户上传（通过服务端 API Key）
CREATE POLICY "Service upload access" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'coloring-images');
*/
