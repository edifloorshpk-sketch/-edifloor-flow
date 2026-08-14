import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function AdminProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gold">{product.code}</p>
        <h1 className="font-display text-xl font-semibold">{product.name}</h1>
      </div>
      <form action={updateWithId} className="space-y-4">
        <Field label="Emri">
          <input name="name" defaultValue={product.name} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Njësia">
            <input name="unit" defaultValue={product.unit} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
          <Field label="Çmimi i shitjes (€)">
            <input name="sale_price" type="number" step="0.01" defaultValue={product.sale_price ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Konsumi min">
            <input name="min_consumption" type="number" step="0.001" defaultValue={product.min_consumption ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold" />
          </Field>
          <Field label="Konsumi standard">
            <input name="standard_consumption" type="number" step="0.001" defaultValue={product.standard_consumption ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold" />
          </Field>
          <Field label="Konsumi maks">
            <input name="max_consumption" type="number" step="0.001" defaultValue={product.max_consumption ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Stoku aktual">
            <input name="current_stock" type="number" step="0.01" defaultValue={product.current_stock ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
          <Field label="Stoku minimal">
            <input name="min_stock" type="number" step="0.01" defaultValue={product.min_stock ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={product.is_active} className="h-4 w-4" />
          Produkt aktiv
        </label>
        <Button type="submit" className="w-full">Ruaj ndryshimet</Button>
      </form>
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
