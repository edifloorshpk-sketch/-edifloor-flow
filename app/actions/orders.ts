"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getStaffIdentity } from "@/lib/identity";

export async function getProductCatalog() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, code, name, unit, sale_price, category_id, product_categories(name)")
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}

export async function searchCustomersForOrder(term: string) {
  if (!term || term.length < 2) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("id, name, phone")
    .or(`name.ilike.%${term}%,phone.ilike.%${term}%`)
    .limit(8);
  return data ?? [];
}

export async function createProductOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const identity = await getStaffIdentity();

  const itemsRaw = String(formData.get("items_json") ?? "[]");
  const items: { product_id: string; quantity: number; unit: string; color_ral?: string; finish?: string }[] =
    JSON.parse(itemsRaw);

  if (!items.length) throw new Error("Shto të paktën një produkt");

  // Resolve customer: use the picked one, or create a new one on the fly from the typed name/phone.
  let customerId = String(formData.get("customer_id") ?? "");
  if (!customerId) {
    const newName = String(formData.get("customer_name") ?? "").trim();
    if (!newName) throw new Error("Shkruaj emrin e klientit");
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name: newName,
        phone: (formData.get("customer_phone") as string) || null,
        source: (formData.get("source") as string) || "tjeter",
        created_by: user?.id,
      })
      .select("id")
      .single();
    if (customerError || !newCustomer) throw new Error(customerError?.message ?? "Gabim gjatë krijimit të klientit");
    customerId = newCustomer.id;
  }

  const payload = {
    customer_id: customerId,
    source: (formData.get("source") as string) || "tjeter",
    priority: (formData.get("priority") as string) || "normale",
    requested_deadline: (formData.get("requested_deadline") as string) || null,
    delivery_address: (formData.get("delivery_address") as string) || null,
    transport: (formData.get("transport") as string) || null,
    notes: (formData.get("notes") as string) || null,
    created_by: user?.id,
    staff_member_id: identity?.id ?? null,
  };

  const { data: order, error } = await supabase.from("product_orders").insert(payload).select("id").single();
  if (error || !order) throw new Error(error?.message ?? "Gabim gjatë ruajtjes së porosisë");

  await supabase.from("product_order_items").insert(
    items.map((i) => ({
      product_order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit: i.unit,
      color_ral: i.color_ral || null,
      finish: i.finish || null,
    }))
  );

  revalidatePath("/orders");
  redirect(`/orders/${order.id}?notify=fabrika`);
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_orders").update({ status }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath(`/orders/${orderId}`);
}

export async function archiveProductOrder(orderId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("product_orders").update({ is_archived: true }).eq("id", orderId);
  if (error) throw new Error(error.message);
  revalidatePath("/orders");
  redirect("/orders");
}
