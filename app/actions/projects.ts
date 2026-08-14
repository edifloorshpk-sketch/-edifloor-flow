"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// "Ktheje në projekt aktiv" — approving a work request creates the project,
// seeds the field checklist, and moves the request into the active pipeline.
export async function convertRequestToProject(requestId: string) {
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("work_requests")
    .select("id, customer_id, start_date, deadline")
    .eq("id", requestId)
    .single();

  if (!request) throw new Error("Kërkesa nuk u gjet");

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      work_request_id: request.id,
      customer_id: request.customer_id,
      status: "planifikuar",
      start_date: request.start_date,
      end_date: request.deadline,
    })
    .select("id")
    .single();

  if (error || !project) throw new Error(error?.message ?? "Gabim gjatë krijimit të projektit");

  const steps = [
    "Kontrolli i lagështisë", "Kontrolli i temperaturës", "Pastrimi", "Riparimet",
    "Primeri", "Shtresa bazë", "Shtresa finale", "Topcoat", "Këndoret", "Vijat",
    "Pastrimi i objektit", "Fotografitë finale", "Pranimi nga klienti",
  ];
  await supabase.from("project_checklists").insert(
    steps.map((step_name, i) => ({ project_id: project.id, step_name, step_order: i + 1 }))
  );

  await supabase.from("work_requests").update({ status: "e_planifikuar" }).eq("id", requestId);

  revalidatePath(`/requests/${requestId}`);
  return project.id;
}
