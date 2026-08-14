import { createClient } from "@/lib/supabase/server";
import { IdentityPicker } from "@/components/identity/identity-picker";

export const dynamic = "force-dynamic";

export default async function IdentityPage() {
  const supabase = await createClient();
  const { data: staff } = await supabase.from("staff_members").select("id, name").eq("is_active", true).order("name");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold">Kush je ti?</h1>
        <p className="text-sm text-muted">
          Zgjidh emrin tënd — do të përdoret për të shënuar kush e ka regjistruar çdo porosi ose kërkesë.
        </p>
      </div>
      <IdentityPicker staff={staff ?? []} />
    </div>
  );
}
