"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function createTask(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("tasks").insert({
    title: String(formData.get("title") ?? ""),
    description: (formData.get("description") as string) || null,
    due_date: (formData.get("due_date") as string) || null,
    created_by: user?.id,
  });
  if (error) throw new Error(error.message);
  redirect("/more");
}

export async function createCallNote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let customerId = String(formData.get("customer_id") ?? "");

  // if no existing customer was picked, stash the note as a task so it's never lost
  if (!customerId) {
    await supabase.from("tasks").insert({
      title: `Telefonatë: ${formData.get("caller_name") ?? "Pa emër"}`,
      description: String(formData.get("summary") ?? ""),
      created_by: user?.id,
    });
    redirect("/more");
  }

  await supabase.from("customer_contacts").insert({
    customer_id: customerId,
    contact_type: "telefonate",
    summary: String(formData.get("summary") ?? ""),
    created_by: user?.id,
  });
  redirect(`/customers/${customerId}`);
}
