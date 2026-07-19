-- ============================================================
--  博客 CMS 管理系统数据库迁移
--  新增表：posts, projects, site_settings, quotes
--  适用：Supabase PostgreSQL (v15+)
-- ============================================================

-- 1. 文章表 -------------------------------------------------------
create table if not exists public.posts (
  id          uuid          primary key default gen_random_uuid(),
  title       varchar(200)  not null,
  slug        varchar(200)  not null unique,
  description text          not null,
  category    varchar(100)  not null default '未分类',
  tags        jsonb         not null default '[]'::jsonb,
  body        text          not null default '',
  cover_image text,
  password    varchar(100),
  draft       boolean       not null default false,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

create index if not exists idx_posts_slug on public.posts (slug);
create index if not exists idx_posts_draft on public.posts (draft);
create index if not exists idx_posts_created on public.posts (created_at desc);
create index if not exists idx_posts_category on public.posts (category);

-- 2. 项目表 -------------------------------------------------------
create table if not exists public.projects (
  id          uuid          primary key default gen_random_uuid(),
  name        varchar(200)  not null,
  description text,
  tech_stack  jsonb         not null default '[]'::jsonb,
  github      text,
  demo        text,
  sort_order  int           not null default 0,
  created_at  timestamptz   not null default now()
);

create index if not exists idx_projects_sort on public.projects (sort_order asc);

-- 3. 站点设置表 (key-value) ----------------------------------------
create table if not exists public.site_settings (
  key         varchar(100)  primary key,
  value       jsonb         not null,
  updated_at  timestamptz   not null default now()
);

-- 4. 随机名言表 ---------------------------------------------------
create table if not exists public.quotes (
  id          uuid          primary key default gen_random_uuid(),
  text        text          not null,
  author      varchar(100)  not null default 'Unknown',
  created_at  timestamptz   not null default now()
);

-- 5. RLS 策略 -----------------------------------------------------
-- 启用 RLS
alter table public.posts enable row level security;
alter table public.projects enable row level security;
alter table public.site_settings enable row level security;
alter table public.quotes enable row level security;

-- 拒绝 anon 访问
create policy "deny anon posts" on public.posts for all to anon using (false) with check (false);
create policy "deny anon projects" on public.projects for all to anon using (false) with check (false);
create policy "deny anon settings" on public.site_settings for all to anon using (false) with check (false);
create policy "deny anon quotes" on public.quotes for all to anon using (false) with check (false);

-- 拒绝 authenticated 访问
create policy "deny auth posts" on public.posts for all to authenticated using (false) with check (false);
create policy "deny auth projects" on public.projects for all to authenticated using (false) with check (false);
create policy "deny auth settings" on public.site_settings for all to authenticated using (false) with check (false);
create policy "deny auth quotes" on public.quotes for all to authenticated using (false) with check (false);

-- 6. 插入默认站点设置 --------------------------------------------
insert into public.site_settings (key, value) values
  ('site_title', '"Sezario的个人小屋"'::jsonb),
  ('site_description', '"尝试了解AI｜喜欢折腾｜记录学习日常"'::jsonb),
  ('site_tagline', '"尝试了解AI｜喜欢折腾｜记录学习日常"'::jsonb),
  ('avatar_url', '"/avatar.jpg"'::jsonb),
  ('hero_title', '"Sezario"'::jsonb),
  ('hero_subtitle', '"的个人小屋"'::jsonb),
  ('hero_tagline', '"尝试了解AI｜喜欢折腾｜记录学习日常"'::jsonb),
  ('hero_tech_stack', '"AI · 全栈开发 · 技术探索 · 学习记录"'::jsonb),
  ('about_bio', '["我是Sezario，一名正在路上的技术爱好者。","热衷于探索人工智能相关技术，平时喜欢折腾各类有趣的项目与技术工具。","在这里记录自己的学习过程、踩坑笔记与实践感悟，沉淀技术，慢慢成长。","欢迎来访，一起交流学习。"]'::jsonb),
  ('about_tech_stack', '["AI","Python","TypeScript","React","Astro","Node.js","Tailwind CSS","Git","Linux"]'::jsonb),
  ('footer_email', '"3030925311@qq.com"'::jsonb),
  ('github_url', '"https://github.com/Sezario1231"'::jsonb),
  ('twitter_url', '"https://x.com/Sezario1231"'::jsonb)
on conflict (key) do nothing;

-- 7. 插入默认名言 ------------------------------------------------
insert into public.quotes (text, author) values
  ('代码是写给人看的，附带能在机器上运行。', 'Harold Abelson'),
  ('先让它工作，再让它正确，再让它快。', 'Kent Beck'),
  ('任何足够先进的技术都与魔法无异。', 'Arthur C. Clarke'),
  ('简单是可靠的先决条件。', 'Edsger Dijkstra'),
  ('过早优化是万恶之源。', 'Donald Knuth'),
  ('没有银弹。', 'Fred Brooks'),
  ('完成比完美更重要。', 'Sheryl Sandberg'),
  ('最好的代码是没有代码。', 'Kevlin Henney'),
  ('编程不是关于你知道什么，而是关于你能想出什么。', 'Unknown'),
  ('Talk is cheap. Show me the code.', 'Linus Torvalds')
on conflict do nothing;

-- 验证 -----------------------------------------------------------
-- select * from public.posts;
-- select * from public.projects;
-- select * from public.site_settings;
-- select * from public.quotes;
