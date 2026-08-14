import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, code, name, unit, sale_price, current_stock, min_stock, is_active")
    .order("code");

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Produktet</h1>
      <div className="space-y-2">
        {(products ?? []).map((p) => (
          <Link key={p.id} href={`/admin/products/${p.id}`}>
            <Card className={`flex items-center justify-between ${!p.is_active ? "opacity-50" : ""} ${p.current_stock < p.min_stock ? "border-l-4 border-l-danger" : ""}`}>
              <div>
                <p className="text-sm font-medium">{p.code} — {p.name}</p>
                <p className="text-xs text-muted">Stoku: {p.current_stock} {p.unit} (min. {p.min_stock})</p>
              </div>
              <span className="text-sm font-medium">{p.sale_price ? `€${p.sale_price}` : "—"}</span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
