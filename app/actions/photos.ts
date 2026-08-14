"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadProjectPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const file = formData.get("file") as File;
  const projectId = String(formData.get("project_id") ?? "");
  const category = String(formData.get("category") ?? "gjate"); // para | gjate | pas

  if (!file || !projectId) throw new Error("Mungon fotografia ose projekti");

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `projects/${projectId}/${category}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("attachments").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { error: dbError } = await supabase.from("attachments").insert({
    related_type: "project",
    related_id: projectId,
    file_path: path,
    file_name: file.name,
    category,
    uploaded_by: user?.id,
  });
  if (dbError) throw new Error(dbError.message);

  revalidatePath(`/projects/${projectId}`);
}

export async function getProjectPhotos(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attachments")
    .select("id, file_path, file_name, category, created_at")
    .eq("related_type", "project")
    .eq("related_id", projectId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((a) => ({
    ...a,
    url: supabase.storage.from("attachments").getPublicUrl(a.file_path).data.publicUrl,
  }));
}

export async function deleteProjectPhoto(attachmentId: string, filePath: string, projectId: string) {
  const supabase = await createClient();
  await supabase.storage.from("attachments").remove([filePath]);
  await supabase.from("attachments").delete().eq("id", attachmentId);
  revalidatePath(`/projects/${projectId}`);
}
