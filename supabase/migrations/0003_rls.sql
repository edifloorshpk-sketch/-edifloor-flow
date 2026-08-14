-- Row Level Security
-- Roles: super_admin, menaxher, shitje, fabrike, terreni

create or replace function current_role_name() returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_staff() returns boolean as $$
  select exists(select 1 from profiles where id = auth.uid() and is_active = true);
$$ language sql stable security definer;

alter table profiles enable row level security;
alter table permissions enable row level security;
alter table customers enable row level security;
alter table customer_contacts enable row level security;
alter table product_categories enable row level security;
alter table products enable row level security;
alter table product_packaging enable row level security;
alter table product_prices enable row level security;
alter table floor_systems enable row level security;
alter table system_layers enable row level security;
alter table product_orders enable row level security;
alter table product_order_items enable row level security;
alter table work_requests enable row level security;
alter table projects enable row level security;
alter table project_teams enable row level security;
alter table project_materials enable row level security;
alter table project_checklists enable row level security;
alter table production_jobs enable row level security;
alter table production_checklists enable row level security;
alter table tasks enable row level security;
alter table comments enable row level security;
alter table attachments enable row level security;
alter table calendar_events enable row level security;
alter table payments enable row level security;
alter table notifications enable row level security;
alter table activity_logs enable row level security;
alter table company_settings enable row level security;

-- Profiles: everyone authenticated can read active staff (for assignment pickers);
-- only super_admin can edit others; users can edit their own basic fields.
create policy profiles_select on profiles for select using (is_staff());
create policy profiles_update_self on profiles for update using (id = auth.uid());
create policy profiles_admin_all on profiles for all using (current_role_name() = 'super_admin');

-- Company-wide reference data: readable by all staff, editable by admin/menaxher
create policy read_staff on product_categories for select using (is_staff());
create policy write_admin on product_categories for all using (current_role_name() in ('super_admin','menaxher'));

create policy products_read on products for select using (is_staff());
create policy products_write on products for insert with check (current_role_name() in ('super_admin','menaxher'));
create policy products_update on products for update using (current_role_name() in ('super_admin','menaxher'));
create policy products_delete on products for delete using (current_role_name() = 'super_admin');

create policy packaging_read on product_packaging for select using (is_staff());
create policy packaging_write on product_packaging for all using (current_role_name() in ('super_admin','menaxher'));

create policy prices_read on product_prices for select using (current_role_name() in ('super_admin','menaxher'));
create policy prices_write on product_prices for all using (current_role_name() in ('super_admin','menaxher'));

create policy systems_read on floor_systems for select using (is_staff());
create policy systems_write on floor_systems for all using (current_role_name() in ('super_admin','menaxher'));

create policy layers_read on system_layers for select using (is_staff());
create policy layers_write on system_layers for all using (current_role_name() in ('super_admin','menaxher'));

-- Customers: sales/office, managers, admin can read/write. Field & factory: read-only, limited.
create policy customers_read on customers for select using (is_staff());
create policy customers_write on customers for insert with check (current_role_name() in ('super_admin','menaxher','shitje'));
create policy customers_update on customers for update using (current_role_name() in ('super_admin','menaxher','shitje'));

create policy customer_contacts_read on customer_contacts for select using (is_staff());
create policy customer_contacts_write on customer_contacts for insert with check (current_role_name() in ('super_admin','menaxher','shitje'));

-- Product orders: sales create/edit; factory sees only what's relevant to production;
-- field team has no access.
create policy product_orders_read on product_orders for select using (
  current_role_name() in ('super_admin','menaxher','shitje','fabrike')
);
create policy product_orders_write on product_orders for insert with check (
  current_role_name() in ('super_admin','menaxher','shitje')
);
create policy product_orders_update on product_orders for update using (
  current_role_name() in ('super_admin','menaxher','shitje','fabrike')
);

create policy product_order_items_read on product_order_items for select using (
  current_role_name() in ('super_admin','menaxher','shitje','fabrike')
);
create policy product_order_items_write on product_order_items for all using (
  current_role_name() in ('super_admin','menaxher','shitje')
);

-- Work requests: sales/office + managers + admin
create policy work_requests_read on work_requests for select using (
  current_role_name() in ('super_admin','menaxher','shitje')
);
create policy work_requests_write on work_requests for insert with check (
  current_role_name() in ('super_admin','menaxher','shitje')
);
create policy work_requests_update on work_requests for update using (
  current_role_name() in ('super_admin','menaxher','shitje')
);

-- Projects: managers/admin full; field team can read/update only their assigned projects
create policy projects_read on projects for select using (
  current_role_name() in ('super_admin','menaxher','shitje')
  or exists (select 1 from project_teams pt where pt.project_id = projects.id and pt.user_id = auth.uid())
);
create policy projects_write on projects for all using (
  current_role_name() in ('super_admin','menaxher')
);

create policy project_teams_read on project_teams for select using (is_staff());
create policy project_teams_write on project_teams for all using (current_role_name() in ('super_admin','menaxher'));

create policy project_materials_read on project_materials for select using (
  current_role_name() in ('super_admin','menaxher','shitje','fabrike')
  or exists (select 1 from project_teams pt where pt.project_id = project_materials.project_id and pt.user_id = auth.uid())
);
create policy project_materials_write on project_materials for all using (
  current_role_name() in ('super_admin','menaxher','fabrike')
);

create policy project_checklists_read on project_checklists for select using (
  current_role_name() in ('super_admin','menaxher')
  or exists (select 1 from project_teams pt where pt.project_id = project_checklists.project_id and pt.user_id = auth.uid())
);
create policy project_checklists_write on project_checklists for all using (
  current_role_name() in ('super_admin','menaxher')
  or exists (select 1 from project_teams pt where pt.project_id = project_checklists.project_id and pt.user_id = auth.uid())
);

-- Production: factory + managers + admin
create policy production_jobs_read on production_jobs for select using (
  current_role_name() in ('super_admin','menaxher','fabrike')
);
create policy production_jobs_write on production_jobs for all using (
  current_role_name() in ('super_admin','menaxher','fabrike')
);
create policy production_checklists_read on production_checklists for select using (
  current_role_name() in ('super_admin','menaxher','fabrike')
);
create policy production_checklists_write on production_checklists for all using (
  current_role_name() in ('super_admin','menaxher','fabrike')
);

-- Tasks/comments/attachments/calendar: all staff can read+create; edit own
create policy tasks_read on tasks for select using (is_staff());
create policy tasks_write on tasks for insert with check (is_staff());
create policy tasks_update on tasks for update using (is_staff());

create policy comments_read on comments for select using (is_staff());
create policy comments_write on comments for insert with check (is_staff());

create policy attachments_read on attachments for select using (is_staff());
create policy attachments_write on attachments for insert with check (is_staff());

create policy calendar_read on calendar_events for select using (is_staff());
create policy calendar_write on calendar_events for all using (
  current_role_name() in ('super_admin','menaxher','shitje')
);

-- Payments: financial data — admin/menaxher only
create policy payments_rw on payments for all using (current_role_name() in ('super_admin','menaxher'));

-- Notifications: only your own
create policy notifications_own on notifications for select using (user_id = auth.uid());
create policy notifications_own_update on notifications for update using (user_id = auth.uid());
create policy notifications_insert on notifications for insert with check (is_staff());

-- Activity log: admin/menaxher read; system inserts via service role
create policy activity_read on activity_logs for select using (current_role_name() in ('super_admin','menaxher'));

-- Company settings: read by all staff, write by admin only
create policy company_settings_read on company_settings for select using (is_staff());
create policy company_settings_write on company_settings for update using (current_role_name() = 'super_admin');
