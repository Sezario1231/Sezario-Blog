create table if not exists visitor_sessions (
  session_id text primary key,
  last_seen timestamptz default now()
);

create index if not exists idx_visitor_sessions_last_seen
  on visitor_sessions (last_seen);
