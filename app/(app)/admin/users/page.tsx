import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase.from("profiles").select("id, full_name, role, is_active").order("full_name");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold">Përdoruesit dhe rolet</h1>
        <p className="text-sm text-muted">
          Përdoruesit e rinj krijohen te Supabase → Authentication, pastaj shfaqen automatikisht këtu me rolin fillestar &quot;Shitje/Zyrë&quot; — ndrysho rolin sipas nevojës.
        </p>
      </div>
      <UsersTable users={(users ?? []) as never} />
    </div>
  );
}
