-- BasePet — Supabase şeması (plan1.md §2.8)
-- Çalıştırma: Supabase SQL Editor veya `supabase db push`.
-- On-chain = source of truth; bu tablolar off-chain oyun verisi (streak, quest, leaderboard cache).

-- ─────────────────────────── users ───────────────────────────
create table if not exists public.users (
  wallet_address text primary key,
  basename       text,
  created_at     timestamptz not null default now(),
  last_seen      timestamptz not null default now()
);

-- ─────────────────────────── streaks ─────────────────────────
create table if not exists public.streaks (
  wallet_address  text primary key references public.users(wallet_address) on delete cascade,
  current_streak  int not null default 0,
  longest_streak  int not null default 0,
  last_action_day date,
  updated_at      timestamptz not null default now()
);

-- ─────────────────────────── quests ──────────────────────────
create table if not exists public.quests (
  id             bigint generated always as identity primary key,
  wallet_address text not null references public.users(wallet_address) on delete cascade,
  quest_key      text not null,           -- ör. 'feed_twice'
  progress       int  not null default 0,
  target         int  not null,
  completed      boolean not null default false,
  quest_date     date not null default current_date,
  unique (wallet_address, quest_key, quest_date)
);

-- ─────────────────────────── leaderboard ─────────────────────
create table if not exists public.leaderboard (
  wallet_address text primary key references public.users(wallet_address) on delete cascade,
  total_xp       bigint not null default 0,
  level          int    not null default 1,
  updated_at     timestamptz not null default now()
);
create index if not exists leaderboard_xp_idx on public.leaderboard (total_xp desc);

-- ─────────────────────────── RLS ─────────────────────────────
alter table public.users       enable row level security;
alter table public.streaks     enable row level security;
alter table public.quests      enable row level security;
alter table public.leaderboard enable row level security;

-- Leaderboard herkese okunur (sosyal sıralama).
drop policy if exists "leaderboard read" on public.leaderboard;
create policy "leaderboard read" on public.leaderboard for select using (true);

-- Kullanıcılar yalnızca kendi satırlarını okur/yazar.
-- auth.jwt()->>'sub' = SIWE doğrulamasından gelen wallet (lowercase) varsayılır.
drop policy if exists "own user" on public.users;
create policy "own user" on public.users
  using (lower(wallet_address) = lower(auth.jwt() ->> 'sub'))
  with check (lower(wallet_address) = lower(auth.jwt() ->> 'sub'));

drop policy if exists "own streak" on public.streaks;
create policy "own streak" on public.streaks
  using (lower(wallet_address) = lower(auth.jwt() ->> 'sub'))
  with check (lower(wallet_address) = lower(auth.jwt() ->> 'sub'));

drop policy if exists "own quests" on public.quests;
create policy "own quests" on public.quests
  using (lower(wallet_address) = lower(auth.jwt() ->> 'sub'))
  with check (lower(wallet_address) = lower(auth.jwt() ->> 'sub'));

-- NOT: Indexer (service role) RLS'i bypass eder; leaderboard/streak yazımını backend yapar.
