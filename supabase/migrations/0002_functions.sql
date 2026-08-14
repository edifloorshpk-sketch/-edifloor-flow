-- Auto-generate ED-P-YYYY-#### and ED-W-YYYY-#### numbers

create or replace function generate_product_order_number() returns trigger as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq_val int;
begin
  if new.order_number is null then
    seq_val := nextval('product_order_seq');
    new.order_number := 'ED-P-' || yr || '-' || lpad(seq_val::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_product_order_number
before insert on product_orders
for each row execute function generate_product_order_number();

create or replace function generate_work_request_number() returns trigger as $$
declare
  yr text := to_char(now(), 'YYYY');
  seq_val int;
begin
  if new.request_number is null then
    seq_val := nextval('work_request_seq');
    new.request_number := 'ED-W-' || yr || '-' || lpad(seq_val::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_work_request_number
before insert on work_requests
for each row execute function generate_work_request_number();

-- Auto-create a profile row when a new auth user signs up
create or replace function handle_new_user() returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'shitje');
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- Material calculator: surface x consumption x (1 + waste%) for one layer
create or replace function calc_layer_quantity(
  p_surface_sqm numeric, p_consumption_per_sqm numeric, p_waste_reserve_pct numeric
) returns numeric as $$
begin
  return round(p_surface_sqm * p_consumption_per_sqm * (1 + coalesce(p_waste_reserve_pct,0)/100.0), 3);
end;
$$ language plpgsql immutable;
