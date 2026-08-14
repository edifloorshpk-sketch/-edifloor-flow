import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("product_orders")
    .select("order_number, status, priority, order_date, requested_deadline, customers(name)")
    .order("created_at", { ascending: false });

  const header = "Numri,Klienti,Statusi,Prioriteti,Data,Afati\n";
  const rows = (orders ?? [])
    .map((o) => {
      // @ts-expect-error joined relation
      const customerName = o.customers?.name ?? "";
      return [o.order_number, customerName, o.status, o.priority, o.order_date, o.requested_deadline ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    })
    .join("\n");

  return new NextResponse(header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="edifloor-porosite-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
