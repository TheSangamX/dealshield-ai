-- Analysis history and Razorpay subscription tracking.

-- Razorpay -----------------------------------------------------------------
-- Written only by the backend (webhook / subscribe route) via the service role.
alter table public.subscriptions
  add column razorpay_subscription_id text unique,
  add column razorpay_status text;

-- Analyses (history) -------------------------------------------------------
-- Stores the generated strategies plus enough context to recognise the deal.
-- The email body itself is not stored.
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject text,
  counterpart_name text,
  counterpart_email text,
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index analyses_user_created_idx on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;

create policy "Users can read their own analyses"
  on public.analyses for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can delete their own analyses"
  on public.analyses for delete
  to authenticated
  using ((select auth.uid()) = user_id);
