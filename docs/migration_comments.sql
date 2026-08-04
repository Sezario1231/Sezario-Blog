create table if not exists public.comments (
  id          uuid          primary key default gen_random_uuid(),
  post_slug   varchar(200)  not null,
  author      varchar(50)   not null,
  email       varchar(100),
  content     text          not null,
  parent_id   uuid          references public.comments(id) on delete cascade,
  ip_address  varchar(45)   not null default 'unknown',
  created_at  timestamptz   not null default now()
);

create index if not exists idx_comments_post_slug on public.comments(post_slug);
create index if not exists idx_comments_created_at on public.comments(created_at desc);
create index if not exists idx_comments_parent_id on public.comments(parent_id);

alter table public.comments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'comments' and policyname = 'comments_deny_anon'
  ) then
    create policy comments_deny_anon on public.comments for all to anon using (false);
  end if;
  if not exists (
    select 1 from pg_policies where tablename = 'comments' and policyname = 'comments_deny_authenticated'
  ) then
    create policy comments_deny_authenticated on public.comments for all to authenticated using (false);
  end if;
end;
$$;
