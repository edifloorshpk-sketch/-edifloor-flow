"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recordPayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerId = String(formData.get("customer_id") ?? "");
  if (!customerId) {
    const newName = String(formData.get("customer_name") ?? "").trim();
    if (!newName) throw new Error("Shkruaj emrin e klientit");
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({ name: newName, created_by: user?.id })
      .select("id")
      .single();
    if (customerError || !newCustomer) throw new Error(customerError?.message ?? "Gabim gjatë krijimit të klientit");
    customerId = newCustomer.id;
  }

  const amount = Number(formData.get("amount") ?? 0);
  if (!amount) throw new Error("Shkruaj shumën");

  const payload = {
    related_type: "customer",
    related_id: customerId,
    amount,
    paid_at: (formData.get("paid_at") as string) || new Date().toISOString().slice(0, 10),
    method: (formData.get("method") as string) || null,
    recorded_by: user?.id,
  };

  const { error } = await supabase.from("payments").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/payments");
}

export async function searchCustomersForPayment(term: string) {
  if (!term || term.length < 2) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("id, name, phone")
    .or(`name.ilike.%${term}%,phone.ilike.%${term}%`)
    .limit(8);
  return data ?? [];
}
