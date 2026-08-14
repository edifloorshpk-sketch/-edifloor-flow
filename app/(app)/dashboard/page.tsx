import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { UrgencyCard } from "@/components/ui/card";
import {
  PRODUCT_ORDER_STATUS_LABELS,
  WORK_REQUEST_STATUS_LABELS,
  urgencyFromDeadline,
} from "@/lib/types/database";
import { AlertTriangle, Package, HardHat, Factory } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  const [newOrders, pendingProduction, inProduction, todayJobs, weekRequests, noOwner, overdue] =
    await Promise.all([
      supabase.from("product_orders").select("id", { count: "exact", head: true }).eq("status", "e_re"),
      supabase.from("product_orders").select("id", { count: "exact", head: true }).eq("status", "ne_pritje_prodhimi"),
      supabase.from("product_orders").select("id", { count: "exact", head: true }).eq("status", "ne_prodhim"),
      supabase.from("work_requests").select("id", { count: "exact", head: true }).eq("start_date", new Date().toISOString().slice(0, 10)),
      supabase.from("work_requests").select("id", { count: "exact", head: true }).in("status", ["e_planifikuar", "ne_proces"]),
      supabase.from("product_orders").select("id", { count: "exact", head: true }).is("responsible_id", null).not("status", "in", "(e_perfunduar,e_anuluar)"),
      supabase.from("product_orders").select("id, order_number, requested_deadline, customers(name)").lt("requested_deadline", new Date().toISOString().slice(0, 10)).not("status", "in", "(e_perfunduar,e_anuluar)").limit(5),
    ]);

  const stats = [
    { label: "Porosi të reja", value: newOrders.count ?? 0, icon: Package, href: "/orders" },
    { label: "Presin prodhim", value: pendingProduction.count ?? 0, icon: Factory, href: "/orders" },
    { label: "Në prodhim", value: inProduction.count ?? 0, icon: Factory, href: "/orders" },
    { label: "Punime sot", value: todayJobs.count ?? 0, icon: HardHat, href: "/requests" },
    { label: "Punime kjo javë", value: weekRequests.count ?? 0, icon: HardHat, href: "/requests" },
    { label: "Pa përgjegjës", value: noOwner.count ?? 0, icon: AlertTriangle, href: "/orders" },
  ];

  const attention = overdue.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-semibold">Kryefaqja</h1>
        <p className="text-sm text-muted">Përmbledhje e gjendjes aktuale</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-2xl border border-border bg-surface p-4 hover:border-gold"
            >
              <Icon className="mb-2 h-5 w-5 text-gold" />
              <div className="font-display text-2xl font-semibold">{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </Link>
          );
        })}
      </div>

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-display text-base font-semibold text-danger">
          <AlertTriangle className="h-4 w-4" /> Kërkon vëmendje
        </h2>
        {attention.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted">
            Asnjë porosi pa afat, pa përgjegjës ose e vonuar për momentin.
          </p>
        ) : (
          <div className="space-y-2">
            {attention.map((o) => (
              <Link key={o.id} href={`/orders/${o.id}`}>
                <UrgencyCard urgency={urgencyFromDeadline(o.requested_deadline, false)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{o.order_number}</p>
                      {/* @ts-expect-error joined relation shape */}
                      <p className="text-xs text-muted">{o.customers?.name}</p>
                    </div>
                    <span className="text-xs text-danger">
                      Afati: {o.requested_deadline}
                    </span>
                  </div>
                </UrgencyCard>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
