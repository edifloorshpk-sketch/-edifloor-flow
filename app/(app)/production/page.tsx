import { createClient } from "@/lib/supabase/server";
import { ProductionJobCard } from "@/components/production/job-card";

export const dynamic = "force-dynamic";

export default async function ProductionPage() {
  const supabase = await createClient();
  const { data: jobs } = await supabase
    .from("production_jobs")
    .select("id, status, product_orders(order_number, customers(name))")
    .neq("status", "gati_dorezim")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold">Prodhimi</h1>
        <p className="text-sm text-muted">Ekran për fabrikën — porositë për prodhim</p>
      </div>
      <div className="space-y-2">
        {(jobs ?? []).map((j: any) => {
          const order = j.product_orders;
          return (
            <ProductionJobCard
              key={j.id}
              jobId={j.id}
              orderNumber={order?.order_number ?? "—"}
              customerName={order?.customers?.name ?? "—"}
              status={j.status}
            />
          );
        })}
        {(jobs ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Asnjë porosi në pritje të prodhimit.
          </p>
        )}
      </div>
    </div>
  );
}
