-- ResumeAI initial schema
-- Run in Supabase SQL Editor (or `supabase db push` if using Supabase CLI)

-- ─────────────────────────────────────────────
-- Profiles (extends auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  usage_count integer not null default 0,
  usage_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────
-- Resumes
-- ─────────────────────────────────────────────
create table if not exists public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  email text,
  phone text,
  job_title text not null,
  job_description text,
  skills text,
  experience text,
  education text,
  photo text,
  language text not null default 'en' check (language in ('en', 'fr', 'ar')),
  template text not null default 'executive' check (template in ('executive', 'modern', 'classic', 'creative')),
  resume text not null,
  cover_letter text,
  created_at timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on public.resumes (user_id, created_at desc);

alter table public.resumes enable row level security;

create policy "Users can read their own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can create resumes for themselves"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);
