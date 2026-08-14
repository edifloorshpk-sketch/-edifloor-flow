"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Nuk jeni të kyçur");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "super_admin" && profile?.role !== "menaxher") {
    throw new Error("Nuk keni autorizim");
  }
  return supabase;
}

// ---------- PRODUCTS ----------
export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await assertAdmin();
  const patch = {
    name: String(formData.get("name") ?? ""),
    unit: String(formData.get("unit") ?? "kg"),
    min_consumption: numOrNull(formData.get("min_consumption")),
    standard_consumption: numOrNull(formData.get("standard_consumption")),
    max_consumption: numOrNull(formData.get("max_consumption")),
    sale_price: numOrNull(formData.get("sale_price")),
    min_stock: numOrNull(formData.get("min_stock")),
    current_stock: numOrNull(formData.get("current_stock")),
    is_active: formData.get("is_active") === "on",
  };
  const { error } = await supabase.from("products").update(patch).eq("id", productId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
}

export async function createProduct(formData: FormData) {
  const supabase = await assertAdmin();
  const payload = {
    code: String(formData.get("code") ?? ""),
    name: String(formData.get("name") ?? ""),
    unit: String(formData.get("unit") ?? "kg"),
    category_id: (formData.get("category_id") as string) || null,
    standard_consumption: numOrNull(formData.get("standard_consumption")),
    sale_price: numOrNull(formData.get("sale_price")),
  };
  const { error } = await supabase.from("products").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/products");
}

// ---------- FLOOR SYSTEMS ----------
export async function updateFloorSystem(systemId: string, formData: FormData) {
  const supabase = await assertAdmin();
  const patch = {
    name: String(formData.get("name") ?? ""),
    category: (formData.get("category") as string) || null,
    waste_reserve_pct: numOrNull(formData.get("waste_reserve_pct")) ?? 5,
    description: (formData.get("description") as string) || null,
    is_active: formData.get("is_active") === "on",
  };
  const { error } = await supabase.from("floor_systems").update(patch).eq("id", systemId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/systems");
  revalidatePath(`/admin/systems/${systemId}`);
}

export async function updateSystemLayer(layerId: string, formData: FormData) {
  const supabase = await assertAdmin();
  const patch = {
    layer_name: String(formData.get("layer_name") ?? ""),
    product_id: (formData.get("product_id") as string) || null,
    consumption_per_sqm: numOrNull(formData.get("consumption_per_sqm")),
  };
  const { error } = await supabase.from("system_layers").update(patch).eq("id", layerId);
  if (error) throw new Error(error.message);
  const systemId = String(formData.get("floor_system_id") ?? "");
  revalidatePath(`/admin/systems/${systemId}`);
}

export async function addSystemLayer(systemId: string, formData: FormData) {
  const supabase = await assertAdmin();
  const { data: existing } = await supabase
    .from("system_layers")
    .select("layer_order")
    .eq("floor_system_id", systemId)
    .order("layer_order", { ascending: false })
    .limit(1);
  const nextOrder = (existing?.[0]?.layer_order ?? 0) + 1;

  const { error } = await supabase.from("system_layers").insert({
    floor_system_id: systemId,
    layer_order: nextOrder,
    layer_name: String(formData.get("layer_name") ?? "Shtresë e re"),
    product_id: (formData.get("product_id") as string) || null,
    consumption_per_sqm: numOrNull(formData.get("consumption_per_sqm")),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/systems/${systemId}`);
}

export async function deleteSystemLayer(layerId: string, systemId: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("system_layers").delete().eq("id", layerId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/systems/${systemId}`);
}

export async function createFloorSystem(formData: FormData) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("floor_systems").insert({
    name: String(formData.get("name") ?? "Sistem i ri"),
    category: (formData.get("category") as string) || null,
    layer_count: 1,
    waste_reserve_pct: 5,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/systems");
}

// ---------- USERS / ROLES ----------
export async function updateUserRole(userId: string, role: string) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("profiles").update({ is_active: isActive }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
}

// ---------- COMPANY SETTINGS ----------
export async function updateCompanySettings(formData: FormData) {
  const supabase = await assertAdmin();
  const patch = {
    company_name: String(formData.get("company_name") ?? "Edifloor Group"),
    address: (formData.get("address") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    vat_rate: numOrNull(formData.get("vat_rate")) ?? 18,
  };
  const { error } = await supabase.from("company_settings").update(patch).eq("id", 1);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/company");
}

function numOrNull(v: FormDataEntryValue | null): number | null {
  if (v === null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
