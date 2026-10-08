-- Production Counter: initial schema
create extension if not exists pgcrypto;

create type public.batch_status as enum ('DRAFT','ACTIVE','PAUSED','COMPLETED','RECONCILED','CANCELLED');
create type public.serial_status as enum ('AVAILABLE','SCANNED','LOST','DAMAGED','VOID');
create type public.scan_status as enum ('ACCEPTED','DUPLICATE','INVALID','GAP');
create type public.exception_type as enum ('LOST','DAMAGED','GAP','MANUAL');

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(), name text not null unique, code text, created_at timestamptz not null default now()
);
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(), brand_id uuid not null references public.brands(id) on delete restrict, model text not null, product_code text, description text, created_at timestamptz not null default now(), unique (brand_id, model)
);
create table if not exists public.production_lines (
  id uuid primary key default gen_random_uuid(), name text not null unique, active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.operators (
  id uuid primary key references auth.users(id) on delete cascade, employee_code text unique, display_name text not null, role text not null default 'operator' check (role in ('admin','supervisor','operator')), active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.serial_imports (
  id uuid primary key default gen_random_uuid(), brand_id uuid not null references public.brands(id) on delete restrict, product_id uuid references public.products(id) on delete restrict, source_filename text not null, source_pages integer, imported_count integer not null default 0, failed_count integer not null default 0, created_at timestamptz not null default now(), created_by uuid references auth.users(id)
);
create table if not exists public.serial_master (
  id uuid primary key default gen_random_uuid(), import_id uuid not null references public.serial_imports(id) on delete cascade, brand_id uuid not null references public.brands(id) on delete restrict, product_id uuid not null references public.products(id) on delete restrict, page_no integer, sticker_no text not null, gm_serial text not null, qr_payload text, status public.serial_status not null default 'AVAILABLE', scanned_at timestamptz, scanned_by uuid references auth.users(id), scanned_line_id uuid references public.production_lines(id), created_at timestamptz not null default now(), unique (brand_id, gm_serial), unique (import_id, sticker_no)
);
create table if not exists public.production_batches (
  id uuid primary key default gen_random_uuid(), batch_no text not null unique, brand_id uuid not null references public.brands(id), product_id uuid not null references public.products(id), line_id uuid references public.production_lines(id), serial_import_id uuid references public.serial_imports(id), planned_qty integer not null check (planned_qty > 0), produced_qty integer not null default 0 check (produced_qty >= 0), status public.batch_status not null default 'DRAFT', started_at timestamptz, completed_at timestamptz, created_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.scan_events (
  id uuid primary key default gen_random_uuid(), batch_id uuid references public.production_batches(id) on delete set null, serial_id uuid references public.serial_master(id) on delete set null, raw_scan text not null, normalized_scan text, status public.scan_status not null, operator_id uuid references auth.users(id), line_id uuid references public.production_lines(id), station_id text, previous_serial text, detected_gap_serial text, message text, scanned_at timestamptz not null default now()
);
create table if not exists public.sticker_exceptions (
  id uuid primary key default gen_random_uuid(), batch_id uuid references public.production_batches(id) on delete set null, serial_id uuid not null references public.serial_master(id) on delete restrict, exception_type public.exception_type not null, reason text, created_by uuid references auth.users(id), resolved_at timestamptz, resolved_by uuid references auth.users(id), created_at timestamptz not null default now()
);
create table if not exists public.station_heartbeats (
  station_id text primary key, line_id uuid references public.production_lines(id), operator_id uuid references auth.users(id), last_seen_at timestamptz not null default now(), scanner_connected boolean not null default false
);

create index if not exists serial_master_gm_idx on public.serial_master(gm_serial);
create index if not exists serial_master_status_idx on public.serial_master(status);
create index if not exists scan_events_batch_idx on public.scan_events(batch_id, scanned_at desc);
create index if not exists scan_events_status_idx on public.scan_events(status, scanned_at desc);
create index if not exists scan_events_operator_idx on public.scan_events(operator_id, scanned_at desc);

alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.production_lines enable row level security;
alter table public.operators enable row level security;
alter table public.serial_imports enable row level security;
alter table public.serial_master enable row level security;
alter table public.production_batches enable row level security;
alter table public.scan_events enable row level security;
alter table public.sticker_exceptions enable row level security;
alter table public.station_heartbeats enable row level security;

create policy "authenticated read brands" on public.brands for select to authenticated using (true);
create policy "authenticated read products" on public.products for select to authenticated using (true);
create policy "authenticated read lines" on public.production_lines for select to authenticated using (true);
create policy "authenticated read operators" on public.operators for select to authenticated using (true);
create policy "authenticated read imports" on public.serial_imports for select to authenticated using (true);
create policy "authenticated read serial master" on public.serial_master for select to authenticated using (true);
create policy "authenticated read batches" on public.production_batches for select to authenticated using (true);
create policy "authenticated read scan events" on public.scan_events for select to authenticated using (true);
create policy "authenticated read exceptions" on public.sticker_exceptions for select to authenticated using (true);
create policy "authenticated read heartbeats" on public.station_heartbeats for select to authenticated using (true);

alter publication supabase_realtime add table public.production_batches;
alter publication supabase_realtime add table public.serial_master;
alter publication supabase_realtime add table public.scan_events;
alter publication supabase_realtime add table public.station_heartbeats;
