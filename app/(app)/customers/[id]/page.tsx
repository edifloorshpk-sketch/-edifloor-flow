import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import {
  PRODUCT_ORDER_STATUS_LABELS,
  WORK_REQUEST_STATUS_LABELS,
  type ProductOrderStatus,
  type WorkRequestStatus,
} from "@/lib/types/database";
import { Phone, Mail, MapPin, Package, HardHat } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: customer }, { data: orders }, { data: requests }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase.from("product_orders").select("id, order_number, status, order_date").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("work_requests").select("id, request_number, status, area_sqm").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);

  if (!customer) notFound();

  const actions = [
    customer.phone && { icon: Phone, label: "Telefono", href: `tel:${customer.phone}` },
    customer.email && { icon: Mail, label: "Email", href: `mailto:${customer.email}` },
    customer.address && { icon: MapPin, label: "Lokacioni", href: `https://maps.google.com/?q=${encodeURIComponent(customer.address)}` },
  ].filter(Boolean) as { icon: typeof Phone; label: string; href: string }[];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-semibold">{customer.name}</h1>
        <p className="text-sm text-muted">
          {customer.company_name} {customer.city ? `· ${customer.city}` : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <a
            key={a.label}
            href={a.href}
            target="_blank"
            className="tap-target flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 text-xs font-medium hover:border-gold"
          >
            <a.icon className="h-3.5 w-3.5" /> {a.label}
          </a>
        ))}
        <Link href={`/orders/new?customer=${customer.id}`} className="tap-target flex items-center gap-1.5 rounded-xl bg-gold px-3 text-xs font-medium text-gold-foreground">
          <Package className="h-3.5 w-3.5" /> Krijo porosi
        </Link>
        <Link href={`/requests/new?customer=${customer.id}`} className="tap-target flex items-center gap-1.5 rounded-xl bg-gold px-3 text-xs font-medium text-gold-foreground">
          <HardHat className="h-3.5 w-3.5" /> Krijo kërkesë
        </Link>
      </div>

      {customer.notes && (
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Shënime</p>
          <p className="mt-1 text-sm">{customer.notes}</p>
        </Card>
      )}

      <section>
        <h2 className="mb-2 font-display text-base font-semibold">Porositë e produkteve</h2>
        <div className="space-y-2">
          {(orders ?? []).map((o) => (
            <Link key={o.id} href={`/orders/${o.id}`}>
              <Card className="flex items-center justify-between">
                <span className="text-sm font-medium">{o.order_number}</span>
                <span className="text-xs text-muted">{PRODUCT_ORDER_STATUS_LABELS[o.status as ProductOrderStatus]}</span>
              </Card>
            </Link>
          ))}
          {(orders ?? []).length === 0 && <p className="text-sm text-muted">Asnjë porosi ende.</p>}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-base font-semibold">Kërkesat për punime</h2>
        <div className="space-y-2">
          {(requests ?? []).map((r) => (
            <Link key={r.id} href={`/requests/${r.id}`}>
              <Card className="flex items-center justify-between">
                <span className="text-sm font-medium">{r.request_number} · {r.area_sqm} m²</span>
                <span className="text-xs text-muted">{WORK_REQUEST_STATUS_LABELS[r.status as WorkRequestStatus]}</span>
              </Card>
            </Link>
          ))}
          {(requests ?? []).length === 0 && <p className="text-sm text-muted">Asnjë kërkesë ende.</p>}
        </div>
      </section>
    </div>
  );
}
