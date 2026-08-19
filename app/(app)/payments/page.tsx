import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const supabase = await createClient();
  const { data: payments } = await supabase
    .from("payments")
    .select("id, amount, paid_at, method, related_type, related_id")
    .order("paid_at", { ascending: false })
    .limit(50);

  // resolve names for display — customer (new format) or order/request (legacy)
  const customerIds = (payments ?? []).filter((p) => p.related_type === "customer").map((p) => p.related_id);
  const orderIds = (payments ?? []).filter((p) => p.related_type === "product_order").map((p) => p.related_id);
  const requestIds = (payments ?? []).filter((p) => p.related_type === "work_request").map((p) => p.related_id);

  const [{ data: customers }, { data: orders }, { data: requests }] = await Promise.all([
    customerIds.length ? supabase.from("customers").select("id, name").in("id", customerIds) : Promise.resolve({ data: [] }),
    orderIds.length ? supabase.from("product_orders").select("id, order_number").in("id", orderIds) : Promise.resolve({ data: [] }),
    requestIds.length ? supabase.from("work_requests").select("id, request_number").in("id", requestIds) : Promise.resolve({ data: [] }),
  ]);

  const labelFor = (type: string, id: string) => {
    if (type === "customer") return customers?.find((c) => c.id === id)?.name;
    if (type === "product_order") return orders?.find((o) => o.id === id)?.order_number;
    return requests?.find((r) => r.id === id)?.request_number;
  };

  const total = (payments ?? []).reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Pagesat</h1>
        <Link href="/payments/new">
          <Button className="!px-3"><Plus className="h-4 w-4" /> Pagesë e re</Button>
        </Link>
      </div>
      <Card className="border-gold/40 bg-gold/5">
        <p className="text-xs uppercase tracking-wide text-muted">Totali i regjistruar</p>
        <p className="font-display text-2xl font-semibold text-gold">€{total.toFixed(2)}</p>
      </Card>
      <div className="space-y-2">
        {(payments ?? []).map((p) => (
          <Card key={p.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{labelFor(p.related_type, p.related_id) ?? "—"}</p>
              <p className="text-xs text-muted">{p.paid_at} {p.method ? `· ${p.method}` : ""}</p>
            </div>
            <span className="text-sm font-medium text-ok">€{Number(p.amount).toFixed(2)}</span>
          </Card>
        ))}
        {(payments ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Asnjë pagesë ende.</p>
        )}
      </div>
    </div>
  );
}
