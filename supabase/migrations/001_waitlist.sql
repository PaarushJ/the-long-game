-- Waitlist: anonymous visitors may join (insert), nobody may read with the
-- publishable key. Emails are only accessible via the dashboard/service role.

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  created_at timestamptz not null default now()
);

alter table public.waitlist enable row level security;

create policy "anyone can join the waitlist"
  on public.waitlist for insert
  to anon
  with check (true);
