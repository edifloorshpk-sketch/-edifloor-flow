"use client";

import { useState, useTransition } from "react";
import { createProductOrder, searchCustomersForOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Search } from "lucide-react";

interface ProductOption {
  id: string;
  code: string;
  name: string;
  unit: string;
}

interface Line {
  key: string;
  product_id: string;
  quantity: number;
  unit: string;
  color_ral: string;
  finish: string;
}

export function NewOrderForm({
  products,
  initialCustomerId,
}: {
  products: ProductOption[];
  initialCustomerId?: string;
}) {
  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [customerLabel, setCustomerLabel] = useState("");
  const [customerResults, setCustomerResults] = useState<{ id: string; name: string; phone: string | null }[]>([]);
  const [lines, setLines] = useState<Line[]>([
    { key: crypto.randomUUID(), product_id: "", quantity: 0, unit: "kg", color_ral: "", finish: "" },
  ]);
  const [, startTransition] = useTransition();

  function onCustomerSearch(term: string) {
    setCustomerLabel(term);
    startTransition(async () => {
      const results = await searchCustomersForOrder(term);
      setCustomerResults(results as never);
    });
  }

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  }

  function addLine() {
    setLines((prev) => [...prev, { key: crypto.randomUUID(), product_id: "", quantity: 0, unit: "kg", color_ral: "", finish: "" }]);
  }

  function removeLine(key: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.key !== key) : prev));
  }

  const itemsJson = JSON.stringify(
    lines
      .filter((l) => l.product_id && l.quantity > 0)
      .map((l) => ({ product_id: l.product_id, quantity: l.quantity, unit: l.unit, color_ral: l.color_ral, finish: l.finish }))
  );

  return (
    <form action={createProductOrder} className="space-y-4">
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="items_json" value={itemsJson} />

      <Field label="Klienti *">
        <input
          value={customerLabel}
          onChange={(e) => onCustomerSearch(e.target.value)}
          placeholder="Kërko klientin sipas emrit ose telefonit…"
          className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold"
        />
        {customerResults.length > 0 && !customerId && (
          <div className="mt-1 space-y-1 rounded-xl border border-border bg-surface p-1">
            {customerResults.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => {
                  setCustomerId(c.id);
                  setCustomerLabel(c.name);
                  setCustomerResults([]);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-raised"
              >
                <Search className="h-3.5 w-3.5 text-muted" /> {c.name} {c.phone ? `· ${c.phone}` : ""}
              </button>
            ))}
          </div>
        )}
      </Field>

      <Field label="Burimi">
        <select name="source" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold">
          <option value="telefon">Telefon</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="email">Email</option>
          <option value="showroom">Showroom</option>
          <option value="terren">Terren</option>
          <option value="tjeter">Tjetër</option>
        </select>
      </Field>

      <section className="space-y-3">
        <p className="text-sm font-medium">Produktet</p>
        {lines.map((line) => (
          <Card key={line.key} className="space-y-2">
            <div className="flex items-center gap-2">
              <select
                value={line.product_id}
                onChange={(e) => {
                  const p = products.find((pr) => pr.id === e.target.value);
                  updateLine(line.key, { product_id: e.target.value, unit: p?.unit ?? "kg" });
                }}
                className="tap-target flex-1 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold"
              >
                <option value="">Zgjidh produktin…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} — {p.name}</option>
                ))}
              </select>
              <button type="button" onClick={() => removeLine(line.key)} className="tap-target rounded-xl border border-border px-2 text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Sasia"
                value={line.quantity || ""}
                onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) })}
                className="tap-target rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold"
              />
              <input
                placeholder="Ngjyra RAL"
                value={line.color_ral}
                onChange={(e) => updateLine(line.key, { color_ral: e.target.value })}
                className="tap-target rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold"
              />
              <select
                value={line.finish}
                onChange={(e) => updateLine(line.key, { finish: e.target.value })}
                className="tap-target rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold"
              >
                <option value="">Finish —</option>
                <option value="gloss">Gloss</option>
                <option value="matt">Matt</option>
                <option value="semi_matt">Semi-Matt</option>
                <option value="transparente">Transparente</option>
                <option value="me_ngjyre">Me ngjyrë</option>
              </select>
            </div>
          </Card>
        ))}
        <button type="button" onClick={addLine} className="tap-target flex items-center gap-1.5 text-sm font-medium text-gold">
          <Plus className="h-4 w-4" /> Shto produkt tjetër
        </button>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Prioriteti">
          <select name="priority" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold">
            <option value="normale">Normale</option>
            <option value="e_ulet">E ulët</option>
            <option value="e_larte">E lartë</option>
            <option value="urgjente">Urgjente</option>
          </select>
        </Field>
        <Field label="Afati i kërkuar">
          <input name="requested_deadline" type="date" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
      </div>

      <Field label="Adresa e dorëzimit">
        <input name="delivery_address" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
      </Field>
      <Field label="Transporti">
        <input name="transport" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
      </Field>
      <Field label="Shënime">
        <textarea name="notes" rows={3} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold" />
      </Field>

      <Button type="submit" className="w-full" disabled={!customerId}>
        Ruaj porosinë
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
