-- Seed: product catalog, floor system templates, demo customers/orders

insert into product_categories (name, sort_order) values
  ('Epoxy', 1), ('Poliuretan', 2), ('Dekorativ', 3), ('Materiale ndihmëse', 4);

-- EPOXY
insert into products (code, name, category_id, description, unit, min_consumption, standard_consumption, max_consumption, min_stock, current_stock, ab_ratio) values
  ('EPX-SEAL-100', 'Epoxy Sealer 100', (select id from product_categories where name='Epoxy'), 'Primer epoxy për penetrim dhe lidhje bazë', 'kg', 0.30, 0.40, 0.50, 50, 320, '3:1'),
  ('EPX-FS-150', 'Epoxy FillSeal 150', (select id from product_categories where name='Epoxy'), 'Shtresë bazë mbushëse epoxy', 'kg', 0.80, 1.00, 1.20, 80, 410, '3:1'),
  ('EPX-SL-500', 'Epoxy Selfleveling 500', (select id from product_categories where name='Epoxy'), 'Shtresë finale vetënivelueze epoxy', 'kg', 1.00, 1.25, 1.50, 100, 260, '3:1'),
  ('EPX-ANTISTAT', 'Epoxy Antistatic', (select id from product_categories where name='Epoxy'), 'Sistem epoxy antistatik për dhoma teknike', 'kg', 1.00, 1.30, 1.60, 30, 60, '3:1'),
  ('EPX-REPOX-8132', 'Repox 8132', (select id from product_categories where name='Epoxy'), 'Resinë transparente/dekorative', 'kg', 0.50, 0.70, 1.00, 20, 45, '2:1');

-- PU
insert into products (code, name, category_id, description, unit, min_consumption, standard_consumption, max_consumption, min_stock, current_stock, ab_ratio) values
  ('PU-BASE-WP600', 'PU Base WP600', (select id from product_categories where name='Poliuretan'), 'Bazë poliuretani', 'kg', 0.20, 0.22, 0.25, 40, 90, '2:1'),
  ('PU-COLOR-WP800-C', 'PU Color WP800 me ngjyrë', (select id from product_categories where name='Poliuretan'), 'Poliuretan me ngjyrë RAL/NCS', 'kg', 0.20, 0.22, 0.25, 40, 75, '2:1'),
  ('PU-COLOR-WP800-T', 'PU Color WP800 transparente', (select id from product_categories where name='Poliuretan'), 'Poliuretan transparent', 'kg', 0.20, 0.22, 0.25, 30, 50, '2:1'),
  ('PU-TOP-GLOSS', 'PU Topcoat Gloss', (select id from product_categories where name='Poliuretan'), 'Shtresë sipërfaqësore me shkëlqim', 'kg', 0.10, 0.12, 0.15, 30, 55, '2:1'),
  ('PU-TOP-MATT', 'PU Topcoat Matt', (select id from product_categories where name='Poliuretan'), 'Shtresë sipërfaqësore mat', 'kg', 0.10, 0.12, 0.15, 30, 48, '2:1'),
  ('PU-TOP-SEMIMATT', 'PU Topcoat Semi-Matt', (select id from product_categories where name='Poliuretan'), 'Shtresë sipërfaqësore gjysmë-mat', 'kg', 0.10, 0.12, 0.15, 30, 40, '2:1'),
  ('EPROTEC', 'Eprotec', (select id from product_categories where name='Poliuretan'), 'Shtresë mbrojtëse kundër gërvishtjeve', 'kg', 0.10, 0.13, 0.15, 25, 30, '2:1');

-- DEKORATIV
insert into products (code, name, category_id, description, unit, min_stock, current_stock) values
  ('WEPOX-TRANS', 'Wepox Transparent Resin', (select id from product_categories where name='Dekorativ'), 'Resinë transparente dekorative', 'kg', 15, 22),
  ('PIGMENT', 'Pigmente', (select id from product_categories where name='Dekorativ'), 'Pigmente me ngjyra për sisteme epoxy/PU', 'kg', 10, 35),
  ('RAL-COLOR', 'Ngjyra RAL', (select id from product_categories where name='Dekorativ'), 'Paletë ngjyrash standarde RAL', 'kg', 10, 25),
  ('NCS-COLOR', 'Ngjyra NCS', (select id from product_categories where name='Dekorativ'), 'Paletë ngjyrash standarde NCS', 'kg', 10, 20),
  ('FLAKES', 'Flakes/Chips dekorativë', (select id from product_categories where name='Dekorativ'), 'Copëza dekorative për sisteme me flakes', 'kg', 15, 40);

-- MATERIALE NDIHMËSE
insert into products (code, name, category_id, description, unit, min_stock, current_stock) values
  ('QUARTZ-SAND', 'Rërë kuarci', (select id from product_categories where name='Materiale ndihmëse'), 'Rërë kuarci sipas granulacionit', 'kg', 100, 480),
  ('PRIMER-SPEC', 'Primer special', (select id from product_categories where name='Materiale ndihmëse'), 'Primer special për sipërfaqe problematike', 'kg', 20, 34),
  ('THINNER', 'Hollues', (select id from product_categories where name='Materiale ndihmëse'), 'Hollues për pastrim dhe rregullim viskoziteti', 'l', 20, 40),
  ('REPAIR-MAT', 'Material riparues', (select id from product_categories where name='Materiale ndihmëse'), 'Material për riparimin e sipërfaqes ekzistuese', 'kg', 15, 26),
  ('FIBER-REINF', 'Fibra përforcuese', (select id from product_categories where name='Materiale ndihmëse'), 'Fibra ose materiale përforcuese', 'kg', 10, 18),
  ('COPPER-STRIP', 'Shirita bakri', (select id from product_categories where name='Materiale ndihmëse'), 'Shirita bakri për sistem antistatik', 'm', 50, 120),
  ('LINE-MARK', 'Material për vijëzim', (select id from product_categories where name='Materiale ndihmëse'), 'Material për vijëzimin e dyshemeve industriale/parkingjeve', 'kg', 10, 22),
  ('SPORT-MAT', 'Materiale për terrene sportive', (select id from product_categories where name='Materiale ndihmëse'), 'Materiale specifike për terrene sportive', 'kg', 20, 30);

-- default packaging
insert into product_packaging (product_id, label, size_value, size_unit, is_default)
select id, 'Kovë 5kg', 5, 'kg', true from products where unit = 'kg';

-- FLOOR SYSTEMS
insert into floor_systems (name, category, layer_count, waste_reserve_pct, description) values
  ('Sistem Epoxy 2 shtresa', 'industri', 2, 5, 'Primer + shtresë finale'),
  ('Sistem Epoxy 3 shtresa', 'industri', 3, 5, 'Primer + shtresë bazë + shtresë finale'),
  ('Sistem 4 shtresa (3 epoxy + 1 mbrojtëse)', 'industri', 4, 5, 'Sistem i plotë me shtresë mbrojtëse PU/Eprotec'),
  ('Parking', 'parking', 3, 8, 'Sistem për parkingje me qarkullim automjetesh'),
  ('Klinikë/Spital', 'klinike', 3, 5, 'Sistem higjienik pa tegel'),
  ('Kuzhinë', 'kuzhine', 3, 5, 'Sistem rezistent ndaj yndyrës dhe temperaturës'),
  ('Depo', 'depo', 2, 5, 'Sistem ekonomik për depo'),
  ('Showroom', 'showroom', 4, 5, 'Sistem dekorativ me finish premium'),
  ('Terren sportiv', 'sportiv', 2, 5, 'Sistem elastik për terrene sportive'),
  ('Sistem Anti-slip', 'antislip', 3, 8, 'Shtresë finale me textura anti-rrëshqitje'),
  ('Sistem me Flakes', 'flakes', 3, 8, 'Shtresë finale me flakes dekorativë'),
  ('Sistem Dekorativ 3D', 'dekorativ', 4, 10, 'Sistem me imazh/resinë transparente'),
  ('Sistem Antistatik', 'antistatik', 3, 5, 'Sistem me shirita bakri për dhoma teknike'),
  ('Mure Epoxy', 'mure', 2, 5, 'Sistem për mure'),
  ('Shkallë Epoxy', 'shkalle', 2, 5, 'Sistem për shkallë');

-- layers for the 3 core layer-count templates
insert into system_layers (floor_system_id, layer_order, layer_name, product_id, finish)
select (select id from floor_systems where name = 'Sistem Epoxy 2 shtresa'), 1, 'Epoxy Sealer 100 (primer)', id, null from products where code = 'EPX-SEAL-100';
insert into system_layers (floor_system_id, layer_order, layer_name, product_id, finish)
select (select id from floor_systems where name = 'Sistem Epoxy 2 shtresa'), 2, 'Epoxy Selfleveling 500 (finale)', id, 'gloss' from products where code = 'EPX-SL-500';

insert into system_layers (floor_system_id, layer_order, layer_name, product_id, finish)
select (select id from floor_systems where name = 'Sistem Epoxy 3 shtresa'), 1, 'Epoxy Sealer 100 (primer)', id, null from products where code = 'EPX-SEAL-100';
insert into system_layers (floor_system_id, layer_order, layer_name, product_id, finish)
select (select id from floor_systems where name = 'Sistem Epoxy 3 shtresa'), 2, 'Epoxy FillSeal 150 (bazë)', id, null from products where code = 'EPX-FS-150';
insert into system_layers (floor_system_id, layer_order, layer_name, product_id, finish)
select (select id from floor_systems where name = 'Sistem Epoxy 3 shtresa'), 3, 'Epoxy Selfleveling 500 (finale)', id, 'gloss' from products where code = 'EPX-SL-500';

insert into system_layers (floor_system_id, layer_order, layer_name, product_id, finish)
select (select id from floor_systems where name = 'Sistem 4 shtresa (3 epoxy + 1 mbrojtëse)'), 1, 'Epoxy Sealer 100 (primer)', id, null from products where code = 'EPX-SEAL-100';
insert into system_layers (floor_system_id, layer_order, layer_name, product_id, finish)
select (select id from floor_systems where name = 'Sistem 4 shtresa (3 epoxy + 1 mbrojtëse)'), 2, 'Epoxy FillSeal 150 (bazë)', id, null from products where code = 'EPX-FS-150';
insert into system_layers (floor_system_id, layer_order, layer_name, product_id, finish)
select (select id from floor_systems where name = 'Sistem 4 shtresa (3 epoxy + 1 mbrojtëse)'), 3, 'Epoxy Selfleveling 500 (finale)', id, null from products where code = 'EPX-SL-500';
insert into system_layers (floor_system_id, layer_order, layer_name, product_id, finish)
select (select id from floor_systems where name = 'Sistem 4 shtresa (3 epoxy + 1 mbrojtëse)'), 4, 'PU Topcoat / Eprotec (mbrojtëse)', id, 'gloss' from products where code = 'PU-TOP-GLOSS';

-- DEMO CUSTOMERS
insert into customers (name, company_name, contact_person, phone, whatsapp, email, address, city, source, created_at) values
  ('Ardi Construction Sh.p.k.', 'Ardi Construction', 'Ardi Krasniqi', '+38344123456', '+38344123456', 'ardi@ardiconstruction.com', 'Rr. Bill Clinton nr. 45', 'Prishtinë', 'telefon', now() - interval '40 days'),
  ('Kastrati Group', 'Kastrati Group Sh.p.k.', 'Blerim Kastrati', '+38349887766', '+38349887766', 'blerim@kastratigroup.com', 'Zona Industriale', 'Fushë Kosovë', 'showroom', now() - interval '25 days'),
  ('Spitali Rajonal Prizren', null, 'Fatmir Gashi', '+38328123123', null, 'furnizim@spitaliprizren.org', 'Rr. Shën Mëria', 'Prizren', 'email', now() - interval '12 days'),
  ('AutoMax Servis', 'AutoMax Sh.p.k.', 'Driton Berisha', '+38345998877', '+38345998877', 'driton@automax-ks.com', 'Magjistralja Prishtinë-Ferizaj km 6', 'Ferizaj', 'whatsapp', now() - interval '5 days');

-- DEMO PRODUCT ORDER (delayed one)
insert into product_orders (customer_id, order_date, status, priority, requested_deadline, delivery_address, notes, created_at)
values (
  (select id from customers where name = 'Ardi Construction Sh.p.k.'),
  current_date - 20, 'ne_prodhim', 'e_larte', current_date - 3,
  'Rr. Bill Clinton nr. 45, Prishtinë', 'Klienti ka kërkuar përfundim urgjent, afati ka kaluar.', now() - interval '20 days'
);

insert into product_order_items (product_order_id, product_id, quantity, unit, color_ral)
select po.id, p.id, 240, 'kg', 'RAL 7040'
from product_orders po, products p
where po.customer_id = (select id from customers where name = 'Ardi Construction Sh.p.k.') and p.code = 'EPX-SL-500';

-- DEMO WORK REQUEST -> PROJECT (active, in field)
insert into work_requests (customer_id, location_text, building_type, area_sqm, floor_system_id, status, priority, visit_date, start_date, deadline, price_per_sqm, total_amount, created_at)
values (
  (select id from customers where name = 'Kastrati Group'),
  'Depoja qendrore, Fushë Kosovë', 'depo', 850, (select id from floor_systems where name = 'Sistem Epoxy 3 shtresa'),
  'e_planifikuar', 'e_larte', current_date - 15, current_date - 2, current_date + 5, 9.50, 8075,
  now() - interval '18 days'
);

insert into projects (work_request_id, customer_id, status, start_date, end_date)
select id, customer_id, 'ne_proces', current_date - 2, current_date + 5
from work_requests where location_text = 'Depoja qendrore, Fushë Kosovë';

insert into project_checklists (project_id, step_name, step_order, is_done)
select p.id, s.step, s.ord, s.ord <= 3
from projects p, (values
  ('Kontrolli i lagështisë',1),('Kontrolli i temperaturës',2),('Pastrimi',3),
  ('Riparimet',4),('Primeri',5),('Shtresa bazë',6),('Shtresa finale',7),
  ('Këndoret',8),('Vijat',9),('Pastrimi i objektit',10),('Fotografitë finale',11),('Pranimi nga klienti',12)
) as s(step, ord)
where p.work_request_id = (select id from work_requests where location_text = 'Depoja qendrore, Fushë Kosovë');
