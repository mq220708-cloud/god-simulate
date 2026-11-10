-- Thần Giới: Supabase schema for Google accounts and cloud world saves.
-- Run in Supabase SQL Editor. The browser must use only the anon/publishable key.
create table if not exists public.world_saves (
  user_id uuid not null references auth.users(id) on delete cascade,
  world_id text not null,
  world_name text not null default 'Thế giới',
  game_version text not null,
  storage_path text not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, world_id)
);
alter table public.world_saves enable row level security;
drop policy if exists "Players read own world saves" on public.world_saves;
create policy "Players read own world saves" on public.world_saves for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Players insert own world saves" on public.world_saves;
create policy "Players insert own world saves" on public.world_saves for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update own world saves" on public.world_saves;
create policy "Players update own world saves" on public.world_saves for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Players delete own world saves" on public.world_saves;
create policy "Players delete own world saves" on public.world_saves for delete to authenticated using (auth.uid() = user_id);
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('world-saves', 'world-saves', false, 52428800, array['application/json'])
on conflict (id) do update set public = false, file_size_limit = 52428800, allowed_mime_types = array['application/json'];
drop policy if exists "Players read own world files" on storage.objects;
create policy "Players read own world files" on storage.objects for select to authenticated using (bucket_id = 'world-saves' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players upload own world files" on storage.objects;
create policy "Players upload own world files" on storage.objects for insert to authenticated with check (bucket_id = 'world-saves' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players update own world files" on storage.objects;
create policy "Players update own world files" on storage.objects for update to authenticated using (bucket_id = 'world-saves' and (storage.foldername(name))[1] = auth.uid()::text) with check (bucket_id = 'world-saves' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Players delete own world files" on storage.objects;
create policy "Players delete own world files" on storage.objects for delete to authenticated using (bucket_id = 'world-saves' and (storage.foldername(name))[1] = auth.uid()::text);

-- Public leaderboard: only public display fields are exposed; player email is never stored here.
create table if not exists public.leaderboard (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Người chơi',
  world_name text not null default 'Thế giới',
  score bigint not null default 0 check (score >= 0),
  world_year integer not null default 0 check (world_year >= 0),
  population bigint not null default 0 check (population >= 0),
  technology numeric(8,2) not null default 0 check (technology >= 0),
  updated_at timestamptz not null default now()
);
alter table public.leaderboard enable row level security;
drop policy if exists "Anyone can read leaderboard" on public.leaderboard;
create policy "Anyone can read leaderboard" on public.leaderboard for select using (true);
drop policy if exists "Players insert own leaderboard entry" on public.leaderboard;
create policy "Players insert own leaderboard entry" on public.leaderboard for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Players update own leaderboard entry" on public.leaderboard;
create policy "Players update own leaderboard entry" on public.leaderboard for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Players delete own leaderboard entry" on public.leaderboard;
create policy "Players delete own leaderboard entry" on public.leaderboard for delete to authenticated using (auth.uid() = user_id);

create index if not exists leaderboard_score_updated_idx on public.leaderboard (score desc, updated_at desc);
