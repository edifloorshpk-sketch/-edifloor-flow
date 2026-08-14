"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function findPossibleDuplicates(term: string) {
  if (!term || term.length < 3) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("id, name, company_name, phone")
    .or(`name.ilike.%${term}%,company_name.ilike.%${term}%,phone.ilike.%${term}%`)
    .limit(5);
  return data ?? [];
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const payload = {
    name: String(formData.get("name") ?? ""),
    company_name: (formData.get("company_name") as string) || null,
    contact_person: (formData.get("contact_person") as string) || null,
    phone: (formData.get("phone") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    email: (formData.get("email") as string) || null,
    address: (formData.get("address") as string) || null,
    city: (formData.get("city") as string) || null,
    fiscal_number: (formData.get("fiscal_number") as string) || null,
    notes: (formData.get("notes") as string) || null,
    source: (formData.get("source") as string) || "tjeter",
    created_by: user?.id,
  };

  const { data, error } = await supabase.from("customers").insert(payload).select("id").single();

  if (error || !data) {
    throw new Error(error?.message ?? "Gabim gjatë ruajtjes së klientit");
  }

  revalidatePath("/customers");
  redirect(`/customers/${data.id}`);
}
