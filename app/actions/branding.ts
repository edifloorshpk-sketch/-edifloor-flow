"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function uploadCompanyLogo(formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("logo") as File;
  if (!file || file.size === 0) return;

  const ext = file.name.split(".").pop() ?? "png";
  const path = `logo-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from("branding").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrl } = supabase.storage.from("branding").getPublicUrl(path);

  const { error } = await supabase.from("company_settings").update({ logo_url: publicUrl.publicUrl }).eq("id", 1);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/company");
}
