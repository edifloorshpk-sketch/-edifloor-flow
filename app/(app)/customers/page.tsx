import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Plus, Search } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("customers")
    .select("id, name, company_name, phone, city")
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(50);

  if (q) {
    query = query.or(`name.ilike.%${q}%,company_name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: customers } = await query;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Klientët</h1>
        <Link href="/customers/new">
          <Button className="!px-3">
            <Plus className="h-4 w-4" /> Klient i ri
          </Button>
        </Link>
      </div>

      <form className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Kërko sipas emrit, kompanisë ose telefonit…"
          className="tap-target w-full rounded-xl border border-border bg-surface pl-9 pr-4 text-sm outline-none focus:border-gold"
        />
      </form>

      <div className="space-y-2">
        {(customers ?? []).map((c) => (
          <Link key={c.id} href={`/customers/${c.id}`}>
            <Card className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted">
                  {c.company_name ? `${c.company_name} · ` : ""}
                  {c.city}
                </p>
              </div>
              {c.phone && (
                <span className="flex items-center gap-1 text-xs text-gold">
                  <Phone className="h-3.5 w-3.5" /> {c.phone}
                </span>
              )}
            </Card>
          </Link>
        ))}
        {(customers ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Asnjë klient nuk u gjet.
          </p>
        )}
      </div>
    </div>
  );
}
