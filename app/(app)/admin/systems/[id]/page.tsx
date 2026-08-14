import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateFloorSystem } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { LayerEditor } from "@/components/admin/layer-editor";

export const dynamic = "force-dynamic";

export default async function AdminSystemEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: system }, { data: layers }, { data: products }] = await Promise.all([
    supabase.from("floor_systems").select("*").eq("id", id).single(),
    supabase.from("system_layers").select("*").eq("floor_system_id", id).order("layer_order"),
    supabase.from("products").select("id, name").eq("is_active", true).order("name"),
  ]);

  if (!system) notFound();
  const updateWithId = updateFloorSystem.bind(null, id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold">{system.name}</h1>
      </div>

      <form action={updateWithId} className="space-y-4">
        <Field label="Emri i sistemit">
          <input name="name" defaultValue={system.name} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategoria">
            <input name="category" defaultValue={system.category ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
          <Field label="Rezerva e humbjes (%)">
            <input name="waste_reserve_pct" type="number" step="0.1" defaultValue={system.waste_reserve_pct} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
        </div>
        <Field label="Përshkrimi">
          <textarea name="description" defaultValue={system.description ?? ""} rows={2} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={system.is_active} className="h-4 w-4" />
          Sistem aktiv
        </label>
        <Button type="submit" className="w-full">Ruaj sistemin</Button>
      </form>

      <section>
        <h2 className="mb-2 font-display text-base font-semibold">Shtresat</h2>
        <LayerEditor systemId={id} layers={(layers ?? []) as never} products={(products ?? []) as never} />
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
