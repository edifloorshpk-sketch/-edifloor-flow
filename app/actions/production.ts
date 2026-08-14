"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function advanceProductionJob(jobId: string, status: string) {
  const supabase = await createClient();
  const patch: Record<string, unknown> = { status };
  if (status === "ne_prodhim") patch.started_at = new Date().toISOString();
  if (status === "gati_dorezim") patch.finished_at = new Date().toISOString();

  const { error } = await supabase.from("production_jobs").update(patch).eq("id", jobId);
  if (error) throw new Error(error.message);

  // mirror onto the linked product order so sales/office see the same status
  const { data: job } = await supabase.from("production_jobs").select("product_order_id").eq("id", jobId).single();
  if (job?.product_order_id) {
    const orderStatus = status === "gati_dorezim" ? "gati" : status === "kontrolli_cilesise" ? "kontrolli_cilesise" : "ne_prodhim";
    await supabase.from("product_orders").update({ status: orderStatus }).eq("id", job.product_order_id);
  }

  revalidatePath("/production");
}
