"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getStaffIdentity } from "@/lib/identity";

export async function getFloorSystems() {
  const supabase = await createClient();
  const { data: systems } = await supabase
    .from("floor_systems")
    .select("id, name, category, layer_count, waste_reserve_pct")
    .eq("is_active", true)
    .order("name");

  const { data: layers } = await supabase
    .from("system_layers")
    .select("id, floor_system_id, layer_order, layer_name, finish, consumption_per_sqm, product_id, products(id, name, standard_consumption, current_stock, product_packaging(size_value, is_default))")
    .order("layer_order");

  return { systems: systems ?? [], layers: layers ?? [] };
}

export async function createWorkRequest(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const identity = await getStaffIdentity();

  let customerId = String(formData.get("customer_id") ?? "");
  if (!customerId) {
    const newName = String(formData.get("customer_name") ?? "").trim();
    if (!newName) throw new Error("Shkruaj emrin e klientit");
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: newName,
        phone: (formData.get("customer_phone") as string) || null,
        created_by: user?.id,
      })
      .select("id")
      .single();
    if (customerError || !newCustomer) throw new Error(customerError?.message ?? "Gabim gjatë krijimit të klientit");
    customerId = newCustomer.id;
  }

  const payload = {
    customer_id: customerId,
    location_text: (formData.get("location_text") as string) || null,
    building_type: (formData.get("building_type") as string) || null,
    area_sqm: Number(formData.get("area_sqm") ?? 0) || null,
    existing_floor_condition: (formData.get("existing_floor_condition") as string) || null,
    floor_system_id: (formData.get("floor_system_id") as string) || null,
    color_ral: (formData.get("color_ral") as string) || null,
    finish: (formData.get("finish") as string) || null,
    surface_texture: (formData.get("surface_texture") as string) || null,
    visit_date: (formData.get("visit_date") as string) || null,
    deadline: (formData.get("deadline") as string) || null,
    estimated_budget: Number(formData.get("estimated_budget") ?? 0) || null,
    price_per_sqm: Number(formData.get("price_per_sqm") ?? 0) || null,
    client_notes: (formData.get("client_notes") as string) || null,
    created_by: user?.id,
    staff_member_id: identity?.id ?? null,
  };

  const { data, error } = await supabase.from("work_requests").insert(payload).select("id").single();
  if (error || !data) {
    throw new Error(error?.message ?? "Gabim gjatë ruajtjes së kërkesës");
  }

  revalidatePath("/requests");
  redirect(`/requests/${data.id}`);
}

export async function searchCustomers(term: string) {
  if (!term || term.length < 2) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("id, name, phone")
    .or(`name.ilike.%${term}%,phone.ilike.%${term}%`)
    .limit(8);
  return data ?? [];
}

export async function archiveWorkRequest(requestId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("work_requests").update({ is_archived: true }).eq("id", requestId);
  if (error) throw new Error(error.message);
  revalidatePath("/requests");
  redirect("/requests");
}
