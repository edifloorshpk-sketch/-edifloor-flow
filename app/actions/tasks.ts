"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleTaskDone(taskId: string, isDone: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").update({ is_done: isDone }).eq("id", taskId);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
}
