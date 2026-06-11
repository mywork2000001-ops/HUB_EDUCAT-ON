-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- Results table (stores all test results from all platforms)
create table if not exists results (
  id           uuid primary key default gen_random_uuid(),
  student_name text not null,
  student_class text not null default '',
  platform     text not null,          -- P001, P002, P003, P004
  lesson_id    text not null default '',
  lesson_title text not null default '',
  score        integer not null,
  total        integer not null,
  percent      integer not null,
  answers      jsonb not null default '{}',
  started_at   timestamptz,
  finished_at  timestamptz,
  created_at   timestamptz not null default now()
);

-- Index for teacher dashboard queries
create index if not exists results_platform_idx on results(platform);
create index if not exists results_created_at_idx on results(created_at desc);
create index if not exists results_student_idx on results(student_name, student_class);

-- Row Level Security: public insert (students submit results), auth read (teachers)
alter table results enable row level security;

create policy "Anyone can insert results"
  on results for insert
  to anon
  with check (true);

create policy "Authenticated users can read results"
  on results for select
  to authenticated
  using (true);

-- Teachers table (optional — Supabase Auth handles login)
create table if not exists teacher_profiles (
  id      uuid primary key references auth.users(id) on delete cascade,
  name    text,
  school  text,
  created_at timestamptz default now()
);

alter table teacher_profiles enable row level security;

create policy "Teachers can read own profile"
  on teacher_profiles for select
  to authenticated
  using (auth.uid() = id);
