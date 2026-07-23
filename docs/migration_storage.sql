-- Supabase Storage: 博客图片存储桶
-- 在 Supabase Dashboard → Storage → Create bucket 中创建：
--   Name: blog-images
--   Public: true

-- 或通过 SQL 创建（需要启用 pg_net 扩展）:
-- insert into storage.buckets (id, name, public, avif_autodetection)
-- values ('blog-images', 'blog-images', true, false)
-- on conflict (id) do nothing;

-- RLS: 允许公开读取（用于文章展示）
-- drop policy if exists "public read" on storage.objects;
-- create policy "public read"
--   on storage.objects for select
--   using (bucket_id = 'blog-images');

-- RLS: 仅允许 service_role 写入（通过服务端 API）
-- drop policy if exists "service write" on storage.objects;
-- create policy "service write"
--   on storage.objects for insert
--   with check (bucket_id = 'blog-images');

-- drop policy if exists "service delete" on storage.objects;
-- create policy "service delete"
--   on storage.objects for delete
--   using (bucket_id = 'blog-images');
