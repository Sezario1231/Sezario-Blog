create table if not exists post_likes (
  post_slug text not null,
  session_id text not null,
  created_at timestamptz default now(),
  primary key (post_slug, session_id)
);

create index if not exists idx_post_likes_slug
  on post_likes (post_slug);
