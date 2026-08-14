import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_ORDER_STATUS_LABELS, type ProductOrderStatus } from "@/lib/types/database";
import { PrintButton } from "@/components/orders/print-button";

export const dynamic = "force-dynamic";

export default async function OrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }, { data: settings }] = await Promise.all([
    supabase.from("product_orders").select("*, customers(name, company_name, address, phone, email)").eq("id", id).single(),
    supabase.from("product_order_items").select("*, products(name, code)").eq("product_order_id", id),
    supabase.from("company_settings").select("*").eq("id", 1).single(),
  ]);

  if (!order) notFound();
  const customer = order.customers;

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-black print:p-0">
      <PrintButton />
      <div className="mb-8 flex items-start justify-between border-b border-black/20 pb-6">
        <div>
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt="Logo" className="mb-2 h-12 object-contain" />
          ) : (
            <h1 className="text-xl font-bold">{settings?.company_name ?? "Edifloor Group"}</h1>
          )}
          <p className="text-xs text-gray-600">{settings?.address}</p>
          <p className="text-xs text-gray-600">{settings?.phone} {settings?.email && `· ${settings.email}`}</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold">KONFIRMIM POROSIE</h2>
          <p className="text-sm">{order.order_number}</p>
          <p className="text-xs text-gray-600">{new Date(order.created_at).toLocaleDateString("sq")}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-gray-500">Klienti</p>
        <p className="font-medium">{customer?.name}</p>
        {customer?.company_name && <p className="text-sm">{customer.company_name}</p>}
        <p className="text-sm text-gray-600">{customer?.address}</p>
        <p className="text-sm text-gray-600">{customer?.phone} {customer?.email && `· ${customer.email}`}</p>
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-black/20 text-left">
            <th className="py-2">Produkti</th>
            <th className="py-2">Ngjyra</th>
            <th className="py-2 text-right">Sasia</th>
          </tr>
        </thead>
        <tbody>
          {(items ?? []).map((it) => (
            <tr key={it.id} className="border-b border-black/10">
              <td className="py-2">{it.products?.name}</td>
              <td className="py-2">{it.color_ral ?? "—"}</td>
              <td className="py-2 text-right">{it.quantity} {it.unit}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Statusi</p>
          <p>{PRODUCT_ORDER_STATUS_LABELS[order.status as ProductOrderStatus]}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Afati i kërkuar</p>
          <p>{order.requested_deadline ?? "—"}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">Adresa e dorëzimit</p>
          <p>{order.delivery_address ?? "—"}</p>
        </div>
      </div>

      {order.notes && (
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wide text-gray-500">Shënime</p>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}

      <div className="mt-12 flex justify-between text-xs text-gray-500">
        <p>Dokument i gjeneruar nga Edifloor Flow</p>
        <p>{order.order_number}</p>
      </div>
    </div>
  );
}
