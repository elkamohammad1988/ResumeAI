-- Stripe subscription columns on profiles
alter table public.profiles
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text unique,
  add column if not exists subscription_status text
    check (subscription_status in (
      'trialing', 'active', 'incomplete', 'incomplete_expired',
      'past_due', 'canceled', 'unpaid', 'paused'
    )),
  add column if not exists current_period_end timestamptz,
  add column if not exists price_id text;

create index if not exists profiles_stripe_customer_idx
  on public.profiles (stripe_customer_id);

-- Helper view: easy "is currently premium?" check
create or replace view public.is_premium as
  select
    id,
    plan = 'pro' or plan = 'team' or
      (subscription_status in ('trialing', 'active') and current_period_end > now())
      as is_premium
  from public.profiles;
