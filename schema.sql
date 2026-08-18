-- 1. Create responses table
create table responses (
  id           uuid primary key default gen_random_uuid(),
  session      text not null,           -- session identifier, e.g., '2026-09-11-mokdong'
  display_name text not null,          -- participant display name
  answers      jsonb not null,          -- answers object structure
  group_no     smallint,                -- group number (can be null initially, updated by admin)
  created_at   timestamptz default now()
);

-- 2. Create index for fast lookups by session and creation time
create index on responses (session, created_at);

-- 3. Enable Row Level Security (RLS)
alter table responses enable row level security;

-- 4. Create policy to allow anonymous inserts from participants
create policy "Allow anonymous insert"
on responses for insert
to anon
with check (true);

-- Note: No other policies are required for anon role. 
-- The SELECT, UPDATE, and DELETE operations will be denied by default for anonymous users.
-- The Next.js server code will use the SUPABASE_SERVICE_ROLE_KEY (service_role role),
-- which automatically bypasses RLS to query and manage rows.
