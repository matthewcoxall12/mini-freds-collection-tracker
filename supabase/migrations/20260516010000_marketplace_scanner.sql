-- Marketplace scanner: eBay + Vinted listing discovery & image candidates

-- Extend items table with marketplace metadata
alter table public.items add column if not exists image_source_url text;
alter table public.items add column if not exists image_source_name text;
alter table public.items add column if not exists image_verified boolean not null default false;
alter table public.items add column if not exists image_verified_at timestamptz;
alter table public.items add column if not exists verified boolean not null default false;
alter table public.items add column if not exists estimated_value numeric;
alter table public.items add column if not exists typical_price numeric;
alter table public.items add column if not exists last_seen_price numeric;
alter table public.items add column if not exists last_seen_marketplace text;
alter table public.items add column if not exists last_seen_url text;
alter table public.items add column if not exists last_seen_at timestamptz;

-- Search queries per provider
create table if not exists public.marketplace_search_queries (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('ebay', 'vinted', 'manual')),
  item_id uuid null references public.items(id) on delete cascade,
  query text not null,
  search_url text,
  enabled boolean not null default true,
  query_type text check (query_type in ('exact_item', 'manufacturer_ref', 'general_discovery', 'image_search')),
  priority int not null default 0,
  last_run_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Listings collected from marketplaces
create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('ebay', 'vinted', 'manual')),
  provider_item_id text,
  item_id uuid null references public.items(id) on delete set null,
  matched_status text check (matched_status in ('matched', 'possible_match', 'new_candidate', 'rejected')),
  match_confidence numeric,
  match_notes text,
  title text,
  seller_username text,
  price numeric,
  currency text,
  condition text,
  item_web_url text,
  image_url text,
  additional_image_urls jsonb,
  listing_status text check (listing_status in ('active', 'sold', 'ended', 'reserved', 'unknown')),
  listed_at timestamptz,
  last_seen_at timestamptz not null default now(),
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_item_id)
);

-- Image candidates awaiting review
create table if not exists public.item_image_candidates (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items(id) on delete cascade,
  provider text not null check (provider in ('ebay', 'vinted', 'manual')),
  source_url text,
  image_url text not null,
  confidence numeric,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid null
);

-- Scan run history
create table if not exists public.marketplace_scan_runs (
  id uuid primary key default gen_random_uuid(),
  provider text check (provider in ('ebay', 'vinted', 'manual', 'all')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text check (status in ('running', 'success', 'partial', 'failed')),
  queries_run int not null default 0,
  listings_found int not null default 0,
  new_listings int not null default 0,
  image_candidates_created int not null default 0,
  new_catalogue_candidates int not null default 0,
  error_message text,
  raw_summary jsonb
);

-- Indexes
create index if not exists idx_marketplace_queries_provider_enabled on public.marketplace_search_queries(provider, enabled);
create index if not exists idx_marketplace_listings_provider_status on public.marketplace_listings(provider, matched_status);
create index if not exists idx_marketplace_listings_item_id on public.marketplace_listings(item_id);
create index if not exists idx_marketplace_listings_last_seen on public.marketplace_listings(last_seen_at desc);
create index if not exists idx_marketplace_listings_listing_status on public.marketplace_listings(listing_status);
create index if not exists idx_item_image_candidates_item_id on public.item_image_candidates(item_id);
create index if not exists idx_item_image_candidates_status on public.item_image_candidates(status);
create index if not exists idx_marketplace_scan_runs_started_at on public.marketplace_scan_runs(started_at desc);

-- RLS: enable with permissive policies (single-user private app; admin UI is client-side gated)
alter table public.marketplace_search_queries enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.item_image_candidates enable row level security;
alter table public.marketplace_scan_runs enable row level security;

drop policy if exists mp_queries_all on public.marketplace_search_queries;
create policy mp_queries_all on public.marketplace_search_queries for all using (true) with check (true);

drop policy if exists mp_listings_all on public.marketplace_listings;
create policy mp_listings_all on public.marketplace_listings for all using (true) with check (true);

drop policy if exists mp_candidates_all on public.item_image_candidates;
create policy mp_candidates_all on public.item_image_candidates for all using (true) with check (true);

drop policy if exists mp_runs_all on public.marketplace_scan_runs;
create policy mp_runs_all on public.marketplace_scan_runs for all using (true) with check (true);
