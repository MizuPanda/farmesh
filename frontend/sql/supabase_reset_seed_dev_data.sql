-- Farmesh reset + dev seed for latest integration tests
-- Run in Supabase SQL Editor as role "postgres".
--
-- What this script does:
-- 1) Deletes all rows from matches, listings, and requests.
-- 2) Inserts fresh OPEN listings for devfarmer@test.com.
-- 3) Inserts fresh OPEN requests for devbuyer@test.com.
-- 4) Leaves matches empty so /api/match can generate fresh proposals.

begin;

do $$
declare
  farmer_exists boolean;
  buyer_exists boolean;
begin
  select exists (
    select 1
    from public.users
    where email = 'devfarmer@test.com'
      and type = 'farmer'
  ) into farmer_exists;

  select exists (
    select 1
    from public.users
    where email = 'devbuyer@test.com'
      and type = 'buyer'
  ) into buyer_exists;

  if not farmer_exists then
    raise exception 'Missing user: devfarmer@test.com (type=farmer)';
  end if;

  if not buyer_exists then
    raise exception 'Missing user: devbuyer@test.com (type=buyer)';
  end if;
end $$;

-- Reset current data.
delete from public.matches;
delete from public.listings;
delete from public.requests;

with ids as (
  select
    (select u.id
     from public.users u
     where u.email = 'devfarmer@test.com'
       and u.type = 'farmer'
     order by u.id asc
     limit 1) as farmer_id,
    (select u.id
     from public.users u
     where u.email = 'devbuyer@test.com'
       and u.type = 'buyer'
     order by u.id asc
     limit 1) as buyer_id
),
listing_seed as (
  select
    gen_random_uuid() as id,
    ids.farmer_id as vendor_id,
    'SEED_DEV_farmer_1: I have 90 lb mixed baby greens available this week at 4.60/lb'::text as raw_input,
    'OPEN'::public.listing_status as status,
    now() - interval '18 minutes' as created_at,
    now() + interval '7 days' as expiration_date,
    'Mixed Baby Greens'::text as original_product,
    90::numeric as original_quantity,
    'lb'::text as original_unit,
    4.60::numeric as original_price_per_unit
  from ids

  union all

  select
    gen_random_uuid(),
    ids.farmer_id,
    'SEED_DEV_farmer_2: 120 lb carrots at 1.95/lb, freshly harvested'::text,
    'OPEN'::public.listing_status,
    now() - interval '12 minutes',
    now() + interval '8 days',
    'Carrots'::text,
    120::numeric,
    'lb'::text,
    1.95::numeric
  from ids

  union all

  select
    gen_random_uuid(),
    ids.farmer_id,
    'SEED_DEV_farmer_3: 75 lb yellow onions at 2.10/lb'::text,
    'OPEN'::public.listing_status,
    now() - interval '7 minutes',
    now() + interval '10 days',
    'Yellow Onions'::text,
    75::numeric,
    'lb'::text,
    2.10::numeric
  from ids

  union all

  select
    gen_random_uuid(),
    ids.farmer_id,
    'SEED_DEV_farmer_4: 35 lb spinach at 4.20/lb, pesticide free'::text,
    'OPEN'::public.listing_status,
    now() - interval '4 minutes',
    now() + interval '6 days',
    'Spinach'::text,
    35::numeric,
    'lb'::text,
    4.20::numeric
  from ids
)
insert into public.listings (
  id,
  vendor_id,
  raw_input,
  status,
  created_at,
  expiration_date,
  original_product,
  original_quantity,
  original_unit,
  original_price_per_unit,
  normalized_product,
  product_category,
  canonical_quantity,
  canonical_unit,
  canonical_price_per_canonical_unit,
  assumptions
)
select
  s.id,
  s.vendor_id,
  s.raw_input,
  s.status,
  s.created_at,
  s.expiration_date,
  s.original_product,
  s.original_quantity,
  s.original_unit,
  s.original_price_per_unit,
  null,
  null,
  null,
  null,
  null,
  null
from listing_seed s
where s.vendor_id is not null;

with ids as (
  select
    (select u.id
     from public.users u
     where u.email = 'devfarmer@test.com'
       and u.type = 'farmer'
     order by u.id asc
     limit 1) as farmer_id,
    (select u.id
     from public.users u
     where u.email = 'devbuyer@test.com'
       and u.type = 'buyer'
     order by u.id asc
     limit 1) as buyer_id
),
request_seed as (
  select
    gen_random_uuid() as id,
    ids.buyer_id as buyer_id,
    'SEED_DEV_buyer_req_1: Need 100 lb salad greens by Friday, max 5.20/lb'::text as raw_input,
    'OPEN'::public.request_status as status,
    now() - interval '16 minutes' as created_at,
    'Salad Greens'::text as original_product,
    100::numeric as original_quantity,
    'lb'::text as original_unit,
    5.20::numeric as original_price_per_unit,
    now() + interval '3 days' as needed_date
  from ids

  union all

  select
    gen_random_uuid(),
    ids.buyer_id,
    'SEED_DEV_buyer_req_2: Looking for 70 lb carrots this week, max 2.30/lb'::text,
    'OPEN'::public.request_status,
    now() - interval '10 minutes',
    'Carrots'::text,
    70::numeric,
    'lb'::text,
    2.30::numeric,
    now() + interval '2 days'
  from ids

  union all

  select
    gen_random_uuid(),
    ids.buyer_id,
    'SEED_DEV_buyer_req_3: Need 30 lb spinach, flexible delivery, max 4.80/lb'::text,
    'OPEN'::public.request_status,
    now() - interval '5 minutes',
    'Spinach'::text,
    30::numeric,
    'lb'::text,
    4.80::numeric,
    now() + interval '4 days'
  from ids
)
insert into public.requests (
  id,
  buyer_id,
  raw_input,
  status,
  created_at,
  original_product,
  original_quantity,
  original_unit,
  original_price_per_unit,
  normalized_product,
  product_category,
  canonical_quantity,
  canonical_unit,
  canonical_price_per_canonical_unit,
  needed_date,
  assumptions
)
select
  s.id,
  s.buyer_id,
  s.raw_input,
  s.status,
  s.created_at,
  s.original_product,
  s.original_quantity,
  s.original_unit,
  s.original_price_per_unit,
  null,
  null,
  null,
  null,
  null,
  s.needed_date,
  null
from request_seed s
where s.buyer_id is not null;

commit;

-- Verification
select 'listings' as table_name, count(*) as row_count from public.listings
union all
select 'requests', count(*) from public.requests
union all
select 'matches', count(*) from public.matches;

select
  l.id,
  l.vendor_id,
  l.original_product,
  l.original_quantity,
  l.original_unit,
  l.original_price_per_unit,
  l.status,
  l.created_at
from public.listings l
order by l.created_at asc;

select
  r.id,
  r.buyer_id,
  r.original_product,
  r.original_quantity,
  r.original_unit,
  r.original_price_per_unit,
  r.needed_date,
  r.status,
  r.created_at
from public.requests r
order by r.created_at asc;
