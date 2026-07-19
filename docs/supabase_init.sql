-- ============================================================
--  Supabase 初始化脚本：联系表单数据表
--  适用：Supabase PostgreSQL (v15+)
--  用途：存储站点联系表单提交的留言
-- ============================================================

-- 1. 创建表 -----------------------------------------------------
create table if not exists public.contact_messages (
  id          uuid          primary key default gen_random_uuid(),
  name        varchar(50)   not null,
  email       varchar(100)  not null,
  message     text          not null,
  ip_address  varchar(45)   not null default 'unknown',
  created_at  timestamptz   not null default now(),
  is_read     boolean       not null default false
);

-- 2. 索引 -------------------------------------------------------
-- 限流查询：按 IP + 时间倒序统计最近 10 分钟提交次数
create index if not exists idx_contact_messages_ip_created
  on public.contact_messages (ip_address, created_at desc);

-- 后台列表查询：按创建时间倒序
create index if not exists idx_contact_messages_created
  on public.contact_messages (created_at desc);

-- 3. 行级安全 (RLS) --------------------------------------------
-- 启用 RLS：默认拒绝所有客户端直接访问
alter table public.contact_messages enable row level security;

-- 删除所有公开策略，确保匿名 / 认证用户均无法直接读写
drop policy if exists "allow anon insert" on public.contact_messages;
drop policy if exists "allow anon select" on public.contact_messages;

-- 写入只允许 service_role（服务端 SDK 使用）执行
-- 注意：service_role 角色会绕过 RLS，因此无需为该角色显式建策略
-- 下面仅显式拒绝 anon / authenticated 角色的任何访问，作为防御性兜底
create policy "deny anon all"
  on public.contact_messages
  for all
  to anon
  using (false)
  with check (false);

create policy "deny authenticated all"
  on public.contact_messages
  for all
  to authenticated
  using (false)
  with check (false);

-- 4. 操作说明 ---------------------------------------------------
-- A. 在 Supabase 控制台 (SQL Editor) 中执行本文件全部内容
-- B. 在 Project Settings → API 中复制：
--      - Project URL        → 用作环境变量 SUPABASE_URL
--      - service_role key   → 用作环境变量 SUPABASE_SERVICE_ROLE_KEY
--    ⚠️ service_role key 拥有完全权限，切勿暴露到前端或提交到仓库
-- C. 将上面两个值写入项目根目录 .env 文件（参考 .env.example）
-- D. 部署到 Vercel 时，在 Environment Variables 中配置同名变量
--
-- 本地验证（可选）：
--   select * from public.contact_messages order by created_at desc limit 10;
