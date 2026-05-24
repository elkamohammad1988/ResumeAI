-- ─────────────────────────────────────────────────────────────────────
-- Security hardening (OWASP follow-up)
--
-- Fixes three issues found during audit, plus two SECURITY DEFINER RPC
-- functions to keep the new privilege boundary usable:
--
-- 1. `is_premium` view bypassed RLS (default Postgres view runs as
--    owner, so any anon/authenticated role could `select * from is_premium`
--    and read every user's plan/subscription state). Rebuild with
--    `security_invoker = true` so the view runs as the caller and
--    inherits RLS on `profiles`.
--
-- 2. `profiles` UPDATE policy was column-blind — any authenticated user
--    could `update profiles set plan='pro' where id = auth.uid()` via
--    PostgREST and bypass Stripe Checkout. Revoke broad UPDATE from
--    `authenticated` and grant only the user-editable columns
--    (full_name, avatar_url). Privileged columns (plan, subscription_*,
--    stripe_*, usage_*, price_id) can only be written by service_role
--    (Stripe webhook) or via the SECURITY DEFINER RPCs below.
--
-- 3. `resumes` UPDATE policy was missing `WITH CHECK` — a user could
--    reassign `user_id` to another user. Closed.
--
-- 4. Add `increment_my_usage()` RPC — the generator action used to
--    `update profiles set usage_count = …` from user context, which
--    item (2) now forbids. The RPC runs as definer, validates
--    `auth.uid()`, and increments atomically (also fixes a pre-existing
--    read-modify-write race under concurrent requests).
--
-- 5. Add `claim_stripe_customer_id(text)` RPC — the checkout action
--    used to write `stripe_customer_id` from user context. The RPC
--    only sets the value if currently NULL (no overwriting an existing
--    customer linkage) and validates the `cus_…` shape.
-- ─────────────────────────────────────────────────────────────────────

-- ── 1. Rebuild is_premium view with security_invoker ────────────────
drop view if exists public.is_premium;

create view public.is_premium
with (security_invoker = true) as
  select
    id,
    plan = 'pro' or plan = 'team' or
      (subscription_status in ('trialing', 'active') and current_period_end > now())
      as is_premium
  from public.profiles;

-- ── 2. Lock down profiles UPDATE to safe columns only ───────────────
-- Drop the permissive policy and recreate it; the column allow-list is
-- enforced via GRANT, not policy (RLS doesn't support per-column USING).
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can update their own profile (safe cols)" on public.profiles;

create policy "Users can update their own profile (safe cols)"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Revoke blanket UPDATE, then re-grant only the columns a user is
-- allowed to change directly. Privileged columns are written via the
-- SECURITY DEFINER RPCs below or via service_role (Stripe webhook).
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- ── 3. Tighten RLS on resumes — explicit WITH CHECK on update ───────
drop policy if exists "Users can update their own resumes" on public.resumes;

create policy "Users can update their own resumes"
  on public.resumes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── 4. RPC: increment_my_usage ──────────────────────────────────────
-- Atomic monthly-rolling quota increment. Replaces the read-modify-write
-- pattern in web/app/(app)/generator/actions.ts which (a) won't compile
-- against the new column grants and (b) had a race between concurrent
-- requests both reading `count = N` and both writing `N+1`.
--
-- Month boundary uses UTC to match the JS `isSameMonth` helper.
create or replace function public.increment_my_usage()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;

  update public.profiles
  set
    usage_count = case
      when date_trunc('month', usage_reset_at at time zone 'UTC')
         = date_trunc('month', v_now at time zone 'UTC')
        then coalesce(usage_count, 0) + 1
      else 1
    end,
    usage_reset_at = case
      when date_trunc('month', usage_reset_at at time zone 'UTC')
         = date_trunc('month', v_now at time zone 'UTC')
        then usage_reset_at
      else v_now
    end
  where id = v_user_id;
end;
$$;

revoke execute on function public.increment_my_usage() from public;
grant execute on function public.increment_my_usage() to authenticated;

-- ── 5. RPC: claim_stripe_customer_id ────────────────────────────────
-- Sets stripe_customer_id once. Subsequent calls are no-ops, preventing
-- an attacker (or a buggy client) from reassigning a customer linkage.
-- The Stripe webhook can still rewrite this field via service_role.
create or replace function public.claim_stripe_customer_id(customer_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'unauthorized' using errcode = '42501';
  end if;
  if customer_id is null or customer_id !~ '^cus_[A-Za-z0-9]{1,128}$' then
    raise exception 'invalid stripe customer id' using errcode = '22023';
  end if;

  -- Only set when currently NULL — never overwrite. Race-safe because
  -- the predicate is part of the UPDATE itself.
  update public.profiles
  set stripe_customer_id = customer_id
  where id = v_user_id
    and stripe_customer_id is null;
end;
$$;

revoke execute on function public.claim_stripe_customer_id(text) from public;
grant execute on function public.claim_stripe_customer_id(text) to authenticated;
