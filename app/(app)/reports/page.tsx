import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const supabase = await createClient();

  const [ordersByStatus, topProducts, delayedOrders, activeProjects, completedProjects] = await Promise.all([
    supabase.from("product_orders").select("status"),
    supabase
      .from("product_order_items")
      .select("product_id, quantity, products(name)"),
    supabase
      .from("product_orders")
      .select("id", { count: "exact", head: true })
      .lt("requested_deadline", new Date().toISOString().slice(0, 10))
      .not("status", "in", "(e_perfunduar,e_anuluar)"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "ne_proces"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "perfunduar"),
  ]);

  const statusCounts: Record<string, number> = {};
  (ordersByStatus.data ?? []).forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  });

  const productTotals = new Map<string, number>();
  (topProducts.data ?? []).forEach((item) => {
    // @ts-expect-error joined relation
    const name = item.products?.name ?? "—";
    productTotals.set(name, (productTotals.get(name) ?? 0) + Number(item.quantity));
  });
  const topFive = [...productTotals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Raportet</h1>
        <a
          href="/api/reports/export"
          className="tap-target flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-medium hover:border-gold"
        >
          <Download className="h-3.5 w-3.5" /> Eksporto CSV
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs text-muted">Porosi të vonuara</p>
          <p className="font-display text-2xl font-semibold text-danger">{delayedOrders.count ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Punime aktive</p>
          <p className="font-display text-2xl font-semibold text-gold">{activeProjects.count ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Punime të përfunduara</p>
          <p className="font-display text-2xl font-semibold">{completedProjects.count ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Porosi gjithsej</p>
          <p className="font-display text-2xl font-semibold">{ordersByStatus.data?.length ?? 0}</p>
        </Card>
      </div>

      <section>
        <h2 className="mb-2 font-display text-base font-semibold">Porositë sipas statusit</h2>
        <div className="space-y-1.5">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <span className="text-muted">{status}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-base font-semibold">Produktet më të porositura</h2>
        <div className="space-y-1.5">
          {topFive.map(([name, qty]) => (
            <div key={name} className="flex items-center justify-between text-sm">
              <span>{name}</span>
              <span className="font-medium">{qty.toFixed(1)} kg</span>
            </div>
          ))}
          {topFive.length === 0 && <p className="text-sm text-muted">Ende pa të dhëna.</p>}
        </div>
      </section>
    </div>
  );
}
