-- Farmesh Supabase setup: matches table for agent output
-- Run in Supabase SQL Editor as role "postgres".

begin;

do $$
begin
  create type public.match_status as enum (
    'PROPOSED',
    'AWAITING_CONFIRMATION',
    'CONFIRMED',
    'REJECTED'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  request_id uuid not null references public.requests(id) on delete cascade,
  score numeric not null check (score >= 0 and score <= 100),
  product text not null,
  reason text not null,
  status public.match_status not null default 'PROPOSED',
  created_at timestamptz not null default now()
);

create index if not exists matches_listing_id_idx on public.matches (listing_id);
create index if not exists matches_request_id_idx on public.matches (request_id);
create index if not exists matches_status_idx on public.matches (status);
create index if not exists matches_created_at_idx on public.matches (created_at desc);

alter table public.matches enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'matches_select_related_or_service'
  ) then
    create policy matches_select_related_or_service
      on public.matches
      for select
      using (
        auth.role() = 'service_role'
        or exists (
          select 1
          from public.listings l
          where l.id = listing_id
            and l.vendor_id = auth.uid()
        )
        or exists (
          select 1
          from public.requests r
          where r.id = request_id
            and r.buyer_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'matches_insert_service_only'
  ) then
    create policy matches_insert_service_only
      on public.matches
      for insert
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'matches'
      and policyname = 'matches_update_service_only'
  ) then
    create policy matches_update_service_only
      on public.matches
      for update
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;

commit;

-- Verification query
select
  m.id,
  m.listing_id,
  m.request_id,
  m.product,
  m.score,
  m.status,
  m.created_at
from public.matches m
order by m.created_at desc
limit 20;
