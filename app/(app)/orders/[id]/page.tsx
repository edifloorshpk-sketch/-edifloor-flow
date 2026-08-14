import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { PRODUCT_ORDER_STATUS_LABELS, PRIORITY_LABELS, type ProductOrderStatus } from "@/lib/types/database";
import { OrderStatusControl } from "@/components/orders/status-control";

export const dynamic = "force-dynamic";

const STATUS_FLOW: ProductOrderStatus[] = [
  "e_re", "ne_pritje_konfirmimi", "e_konfirmuar", "ne_pritje_prodhimi", "ne_prodhim",
  "kontrolli_cilesise", "gati", "ne_transport", "e_dorezuar", "e_perfunduar",
];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("product_orders").select("*, customers(id, name, phone)").eq("id", id).single(),
    supabase.from("product_order_items").select("*, products(name, code)").eq("product_order_id", id),
  ]);

  if (!order) notFound();
  const customer = order.customers;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-gold">{order.order_number}</p>
        <h1 className="font-display text-xl font-semibold">
          <Link href={`/customers/${customer.id}`} className="hover:underline">{customer.name}</Link>
        </h1>
        <p className="text-sm text-muted">
          {PRIORITY_LABELS[order.priority as keyof typeof PRIORITY_LABELS]} · Krijuar {new Date(order.created_at).toLocaleDateString("sq")}
        </p>
      </div>

      <Card>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted">Statusi</p>
        <OrderStatusControl orderId={order.id} currentStatus={order.status} flow={STATUS_FLOW} labels={PRODUCT_ORDER_STATUS_LABELS} />
      </Card>

      <section>
        <h2 className="mb-2 font-display text-base font-semibold">Produktet</h2>
        <div className="space-y-2">
          {(items ?? []).map((it) => (
            <Card key={it.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{it.products?.name}</p>
                <p className="text-xs text-muted">{it.color_ral} {it.finish}</p>
              </div>
              <span className="text-sm font-medium">{it.quantity} {it.unit}</span>
            </Card>
          ))}
        </div>
      </section>

      {order.notes && (
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Shënime</p>
          <p className="mt-1 text-sm">{order.notes}</p>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted">Afati i kërkuar</p>
          <p>{order.requested_deadline ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Adresa e dorëzimit</p>
          <p>{order.delivery_address ?? "—"}</p>
        </div>
      </div>
    </div>
  );
}
