"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleChecklistStep(stepId: string, projectId: string, isDone: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("project_checklists")
    .update({
      is_done: isDone,
      done_by: isDone ? user?.id : null,
      done_at: isDone ? new Date().toISOString() : null,
    })
    .eq("id", stepId);

  if (error) throw new Error(error.message);
  revalidatePath(`/projects/${projectId}`);
}
