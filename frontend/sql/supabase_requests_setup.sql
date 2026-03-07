-- Farmesh Supabase setup: buyer requests table + dev seed
-- Run in Supabase SQL Editor as role "postgres".

begin;

-- Keep listings farmer-only for the dev seed data.
delete from public.listings l
using public.users u
where l.vendor_id = u.id
  and u.type = 'buyer'
  and l.raw_input like 'SEED_DEV_buyer_%';

-- Request statuses currently used by the app.
do $$
begin
  create type public.request_status as enum ('OPEN', 'MATCHED');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.users(id) on delete cascade,
  raw_input text not null,
  product text not null,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  price_per_unit numeric not null check (price_per_unit >= 0),
  status public.request_status not null default 'OPEN',
  created_at timestamptz not null default now()
);

create index if not exists requests_buyer_id_idx on public.requests (buyer_id);
create index if not exists requests_status_idx on public.requests (status);
create index if not exists requests_created_at_idx on public.requests (created_at desc);

alter table public.requests enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'requests'
      and policyname = 'requests_select_own_or_service'
  ) then
    create policy requests_select_own_or_service
      on public.requests
      for select
      using (auth.role() = 'service_role' or buyer_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'requests'
      and policyname = 'requests_insert_own_or_service'
  ) then
    create policy requests_insert_own_or_service
      on public.requests
      for insert
      with check (auth.role() = 'service_role' or buyer_id = auth.uid());
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'requests'
      and policyname = 'requests_update_own_or_service'
  ) then
    create policy requests_update_own_or_service
      on public.requests
      for update
      using (auth.role() = 'service_role' or buyer_id = auth.uid())
      with check (auth.role() = 'service_role' or buyer_id = auth.uid());
  end if;
end $$;

-- Idempotent seed for Dev Tester (buyer).
with dev_buyer as (
  select id
  from public.users
  where email = 'devbuyer@test.com'
    and type = 'buyer'
  limit 1
),
seed_rows as (
  select
    gen_random_uuid() as id,
    (select id from dev_buyer) as buyer_id,
    'SEED_DEV_buyer_req_1: Need 100 lbs salad greens, organic preferred'::text as raw_input,
    'Salad Greens'::text as product,
    100::numeric as quantity,
    'lb'::text as unit,
    5.20::numeric as price_per_unit,
    'OPEN'::public.request_status as status,
    now() as created_at
  union all
  select
    gen_random_uuid(),
    (select id from dev_buyer),
    'SEED_DEV_buyer_req_2: Looking for 70 lbs carrots this week',
    'Carrots',
    70::numeric,
    'lb',
    2.30::numeric,
    'OPEN'::public.request_status,
    now()
)
insert into public.requests (
  id,
  buyer_id,
  raw_input,
  product,
  quantity,
  unit,
  price_per_unit,
  status,
  created_at
)
select
  s.id,
  s.buyer_id,
  s.raw_input,
  s.product,
  s.quantity,
  s.unit,
  s.price_per_unit,
  s.status,
  s.created_at
from seed_rows s
where s.buyer_id is not null
  and not exists (
    select 1
    from public.requests r
    where r.buyer_id = s.buyer_id
      and r.raw_input = s.raw_input
  );

commit;

-- Verification query
select
  u.name,
  u.email,
  u.type,
  r.id,
  r.product,
  r.quantity,
  r.unit,
  r.price_per_unit,
  r.status,
  r.created_at
from public.requests r
join public.users u on u.id = r.buyer_id
where u.email = 'devbuyer@test.com'
order by r.created_at desc;
