"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function recordPayment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    related_type: String(formData.get("related_type") ?? "product_order"),
    related_id: String(formData.get("related_id") ?? ""),
    amount: Number(formData.get("amount") ?? 0),
    paid_at: (formData.get("paid_at") as string) || new Date().toISOString().slice(0, 10),
    method: (formData.get("method") as string) || null,
    recorded_by: user?.id,
  };
  if (!payload.related_id || !payload.amount) throw new Error("Plotëso porosinë/kërkesën dhe shumën");

  const { error } = await supabase.from("payments").insert(payload);
  if (error) throw new Error(error.message);
  revalidatePath("/payments");
}

export async function searchPayableOrders(term: string) {
  if (!term || term.length < 2) return [];
  const supabase = await createClient();
  const [{ data: orders }, { data: requests }] = await Promise.all([
    supabase.from("product_orders").select("id, order_number").ilike("order_number", `%${term}%`).limit(5),
    supabase.from("work_requests").select("id, request_number").ilike("request_number", `%${term}%`).limit(5),
  ]);
  return [
    ...(orders ?? []).map((o) => ({ id: o.id, label: o.order_number, type: "product_order" as const })),
    ...(requests ?? []).map((r) => ({ id: r.id, label: r.request_number, type: "work_request" as const })),
  ];
}
