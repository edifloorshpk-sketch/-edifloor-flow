-- EDIFLOOR FLOW — Core schema
-- Roles, customers, products, floor systems, product orders, work requests,
-- projects, tasks, notifications, activity log, company settings.

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================
create type user_role as enum ('super_admin', 'menaxher', 'shitje', 'fabrike', 'terreni');

create type order_source as enum ('telefon', 'whatsapp', 'email', 'showroom', 'terren', 'tjeter');

create type product_order_status as enum (
  'e_re', 'ne_pritje_konfirmimi', 'e_konfirmuar', 'ne_pritje_prodhimi',
  'ne_prodhim', 'kontrolli_cilesise', 'gati', 'ne_transport',
  'e_dorezuar', 'e_perfunduar', 'e_anuluar'
);

create type work_request_status as enum (
  'kerkese_e_re', 'duhet_telefonuar', 'vizite_e_planifikuar', 'vizita_u_realizua',
  'duhet_pergatitur_oferta', 'oferta_u_dergua', 'ne_pritje_pergjigje',
  'e_aprovuar', 'e_refuzuar', 'e_planifikuar', 'ne_proces', 'e_nderprere',
  'e_perfunduar', 'e_faturuar', 'e_paguar', 'e_anuluar'
);

create type priority_level as enum ('e_ulet', 'normale', 'e_larte', 'urgjente');

create type finish_type as enum ('gloss', 'matt', 'semi_matt', 'transparente', 'me_ngjyre');

create type production_status as enum (
  'pranuar', 'ne_prodhim', 'ndaluar', 'perfunduar', 'kontrolli_cilesise', 'gati_paketim', 'gati_dorezim'
);

create type notification_type as enum (
  'porosi_e_re', 'pergjegjes_caktuar', 'afati_48h', 'afati_24h', 'afati_sot',
  'afati_ka_kaluar', 'statusi_ndryshoi', 'prodhimi_perfundoi', 'material_shtese', 'projekti_perfundoi', 'permendje'
);

-- ============================================================
-- USERS / ROLES
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  role user_role not null default 'shitje',
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  role user_role not null,
  resource text not null,
  can_view boolean not null default false,
  can_edit boolean not null default false,
  can_delete boolean not null default false,
  unique (role, resource)
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text,
  contact_person text,
  phone text,
  whatsapp text,
  email text,
  address text,
  city text,
  country text default 'Kosovë',
  fiscal_number text,
  notes text,
  source order_source default 'tjeter',
  is_archived boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_customers_name on customers using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(company_name,'') || ' ' || coalesce(phone,'')));
create index idx_customers_phone on customers (phone);

create table customer_contacts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  contact_type text not null, -- telefonate, email, takim
  summary text not null,
  occurred_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category_id uuid references product_categories(id),
  description text,
  unit text not null default 'kg', -- kg, komplet, kove, thes, cope
  ab_ratio text, -- e.g. "3:1" when applicable
  min_consumption numeric(10,3),
  standard_consumption numeric(10,3),
  max_consumption numeric(10,3),
  sale_price numeric(12,2),
  cost_price numeric(12,2),
  vat_rate numeric(5,2) default 18,
  min_stock numeric(12,2) default 0,
  current_stock numeric(12,2) default 0,
  is_active boolean not null default true,
  technical_data_sheet_url text,
  safety_data_sheet_url text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table product_packaging (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  label text not null, -- e.g. "Kovë 5kg"
  size_value numeric(10,3) not null,
  size_unit text not null default 'kg',
  is_default boolean default false
);

create table product_prices (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  price numeric(12,2) not null,
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  created_by uuid references profiles(id)
);

-- ============================================================
-- FLOOR SYSTEMS (admin-editable templates)
-- ============================================================
create table floor_systems (
  id uuid primary key default gen_random_uuid(),
  name text not null, -- "Sistem 3 shtresa", "Parking", "Anti-slip" ...
  category text, -- parking, industri, klinike, kuzhine, depo, showroom, sportiv, ...
  layer_count int not null default 2,
  waste_reserve_pct numeric(5,2) not null default 5,
  description text,
  is_editable boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table system_layers (
  id uuid primary key default gen_random_uuid(),
  floor_system_id uuid not null references floor_systems(id) on delete cascade,
  layer_order int not null,
  layer_name text not null, -- Primer, Shtresa bazë, Shtresa finale, Topcoat
  product_id uuid references products(id),
  consumption_per_sqm numeric(10,3), -- overrides product default if set
  finish finish_type,
  is_optional boolean default false
);

-- ============================================================
-- PRODUCT ORDERS (ED-P-YYYY-####)
-- ============================================================
create sequence product_order_seq;
create sequence work_request_seq;

create table product_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid not null references customers(id),
  order_date date not null default current_date,
  created_by uuid references profiles(id),
  source order_source default 'tjeter',
  status product_order_status not null default 'e_re',
  priority priority_level not null default 'normale',
  requested_deadline date,
  transport text,
  delivery_address text,
  responsible_id uuid references profiles(id),
  discount_pct numeric(5,2) default 0,
  vat_rate numeric(5,2) default 18,
  payment_terms text,
  notes text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_product_orders_status on product_orders(status);
create index idx_product_orders_customer on product_orders(customer_id);

create table product_order_items (
  id uuid primary key default gen_random_uuid(),
  product_order_id uuid not null references product_orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity numeric(12,3) not null,
  unit text not null,
  color_ral text,
  finish finish_type,
  packaging_id uuid references product_packaging(id),
  package_count numeric(10,2),
  unit_price numeric(12,2),
  line_total numeric(12,2),
  notes text
);

-- ============================================================
-- WORK REQUESTS (ED-W-YYYY-####) — floor installation requests
-- ============================================================
create table work_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text unique not null,
  customer_id uuid not null references customers(id),
  created_by uuid references profiles(id),
  location_text text,
  location_lat numeric(10,7),
  location_lng numeric(10,7),
  building_type text,
  area_sqm numeric(12,2),
  existing_floor_condition text,
  floor_system_id uuid references floor_systems(id),
  requested_thickness_mm numeric(6,2),
  color_ral text,
  finish finish_type,
  surface_texture text, -- e lëmuar, e vrazhdë, anti-slip
  has_flakes boolean default false,
  multi_color boolean default false,
  status work_request_status not null default 'kerkese_e_re',
  priority priority_level not null default 'normale',
  visit_date date,
  start_date date,
  deadline date,
  responsible_id uuid references profiles(id),
  client_notes text,
  internal_notes text,
  estimated_budget numeric(12,2),
  price_per_sqm numeric(12,2),
  total_amount numeric(12,2),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_work_requests_status on work_requests(status);
create index idx_work_requests_customer on work_requests(customer_id);

-- ============================================================
-- PROJECTS — created when a work request is approved ("Ktheje në projekt aktiv")
-- ============================================================
create table projects (
  id uuid primary key default gen_random_uuid(),
  work_request_id uuid unique not null references work_requests(id),
  customer_id uuid not null references customers(id),
  status text not null default 'planifikuar',
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table project_teams (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id),
  role_on_site text
);

create table project_materials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  product_id uuid not null references products(id),
  theoretical_qty numeric(12,3),
  waste_reserve_pct numeric(5,2),
  total_qty numeric(12,3),
  package_count numeric(10,2),
  qty_in_stock numeric(12,3),
  qty_missing numeric(12,3),
  qty_used numeric(12,3),
  manually_adjusted boolean default false,
  adjustment_reason text
);

create table project_checklists (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  step_name text not null,
  step_order int not null,
  is_done boolean default false,
  done_by uuid references profiles(id),
  done_at timestamptz,
  comment text
);

-- ============================================================
-- PRODUCTION (factory floor)
-- ============================================================
create table production_jobs (
  id uuid primary key default gen_random_uuid(),
  product_order_id uuid references product_orders(id),
  project_id uuid references projects(id),
  status production_status not null default 'pranuar',
  responsible_id uuid references profiles(id),
  started_at timestamptz,
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

create table production_checklists (
  id uuid primary key default gen_random_uuid(),
  production_job_id uuid not null references production_jobs(id) on delete cascade,
  step_name text not null, -- kontrolli formules, lëndës, ngjyrës, peshës, etiketim, paketim, final
  is_done boolean default false,
  done_by uuid references profiles(id),
  done_at timestamptz
);

-- ============================================================
-- TASKS / COMMENTS / ATTACHMENTS / ACTIVITY
-- ============================================================
create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  related_type text, -- customer, product_order, work_request, project
  related_id uuid,
  assigned_to uuid references profiles(id),
  due_date date,
  is_done boolean default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  related_type text not null,
  related_id uuid not null,
  author_id uuid references profiles(id),
  body text not null,
  mentioned_user_ids uuid[] default '{}',
  created_at timestamptz not null default now()
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  related_type text not null,
  related_id uuid not null,
  file_path text not null,
  file_name text not null,
  category text, -- para, gjate, pas, dokument, foto
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_type text not null, -- prodhim, vizite, punim, dorezim, afat, detyre
  related_type text,
  related_id uuid,
  start_at timestamptz not null,
  end_at timestamptz,
  assigned_to uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  related_type text not null, -- product_order, work_request
  related_id uuid not null,
  amount numeric(12,2) not null,
  paid_at date not null default current_date,
  method text,
  recorded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  type notification_type not null,
  title text not null,
  body text,
  related_type text,
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, is_read);

create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  related_type text,
  related_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table company_settings (
  id int primary key default 1,
  company_name text not null default 'Edifloor Group',
  logo_url text,
  vat_rate numeric(5,2) default 18,
  address text,
  phone text,
  email text,
  product_order_prefix text default 'ED-P',
  work_request_prefix text default 'ED-W',
  constraint single_row check (id = 1)
);
insert into company_settings (id) values (1);

-- updated_at trigger helper
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_customers_updated before update on customers for each row execute function set_updated_at();
create trigger trg_products_updated before update on products for each row execute function set_updated_at();
create trigger trg_product_orders_updated before update on product_orders for each row execute function set_updated_at();
create trigger trg_work_requests_updated before update on work_requests for each row execute function set_updated_at();
create trigger trg_projects_updated before update on projects for each row execute function set_updated_at();
create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
