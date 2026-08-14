import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminSystemsPage() {
  const supabase = await createClient();
  const { data: systems } = await supabase
    .from("floor_systems")
    .select("id, name, category, layer_count, waste_reserve_pct, is_active")
    .order("name");

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Sistemet e dyshemeve</h1>
      <div className="space-y-2">
        {(systems ?? []).map((s) => (
          <Link key={s.id} href={`/admin/systems/${s.id}`}>
            <Card className={`flex items-center justify-between ${!s.is_active ? "opacity-50" : ""}`}>
              <div>
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs text-muted">{s.layer_count} shtresa · rezervë {s.waste_reserve_pct}%</p>
              </div>
              <span className="text-xs text-muted">{s.category}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
