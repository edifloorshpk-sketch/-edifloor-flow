import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PRODUCT_ORDER_STATUS_LABELS, urgencyFromDeadline, type ProductOrderStatus } from "@/lib/types/database";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("product_orders")
    .select("id, order_number, status, requested_deadline, customers(name), staff_members(name)")
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Porositë</h1>
        <Link href="/orders/new">
          <Button className="!px-3"><Plus className="h-4 w-4" /> Porosi e re</Button>
        </Link>
      </div>
      <div className="space-y-2">
        {(orders ?? []).map((o) => {
          const done = ["e_perfunduar", "e_anuluar"].includes(o.status);
          const urgency = urgencyFromDeadline(o.requested_deadline, done);
          const border = { green: "border-l-ok", yellow: "border-l-warn", red: "border-l-danger", gray: "border-l-archived" }[urgency];
          return (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className={`border-l-4 ${border}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{o.order_number}</p>
                    {/* @ts-expect-error joined relation */}
                    <p className="text-xs text-muted">{o.customers?.name}{o.staff_members?.name && ` · ${o.staff_members.name}`}</p>
                  </div>
                  <span className="text-xs text-muted">{PRODUCT_ORDER_STATUS_LABELS[o.status as ProductOrderStatus]}</span>
                </div>
              </Card>
            </Link>
          );
        })}
        {(orders ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Asnjë porosi ende.</p>
        )}
      </div>
    </div>
  );
}
