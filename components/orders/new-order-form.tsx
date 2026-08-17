"use client";

import { useState, useTransition } from "react";
import { createProductOrder, searchCustomersForOrder } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";
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
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [priority, setPriority] = useState("normale");
  const [source, setSource] = useState("telefon");
  const [, startTransition] = useTransition();

  function onCustomerSearch(term: string) {
    setCustomerLabel(term);
    startTransition(async () => {
      const results = await searchCustomersForOrder(term);
      setCustomerResults(results as never);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await createProductOrder(new FormData(e.currentTarget));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("NEXT_REDIRECT")) return;
      setError(message);
      setSaving(false);
    }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="customer_name" value={customerId ? "" : customerLabel} />
      <input type="hidden" name="items_json" value={itemsJson} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="priority" value={priority} />

      <Field label="Klienti *">
        <input
          value={customerLabel}
          onChange={(e) => {
            setCustomerId("");
            onCustomerSearch(e.target.value);
          }}
          placeholder="Shkruaj emrin e klientit…"
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
        {!customerId && customerLabel && (
          <p className="mt-1 text-xs text-muted">Klient i ri: &quot;{customerLabel}&quot;</p>
        )}
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
              <input
                type="number"
                step="0.01"
                placeholder="Sasia"
                value={line.quantity || ""}
                onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) })}
                className="tap-target w-24 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold"
              />
              {lines.length > 1 && (
                <button type="button" onClick={() => removeLine(line.key)} className="tap-target rounded-xl border border-border px-2 text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </Card>
        ))}
        <button type="button" onClick={addLine} className="tap-target flex items-center gap-1.5 text-sm font-medium text-gold">
          <Plus className="h-4 w-4" /> Shto produkt tjetër
        </button>
      </section>

      <Field label="Afati i kërkuar (opsionale)">
        <input name="requested_deadline" type="date" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
      </Field>

      <Collapsible label="Më shumë detaje (opsionale)">
        {!customerId && customerLabel && (
          <Field label="Telefoni i klientit">
            <input name="customer_phone" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Prioriteti">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold">
              <option value="normale">Normale</option>
              <option value="e_ulet">E ulët</option>
              <option value="e_larte">E lartë</option>
              <option value="urgjente">Urgjente</option>
            </select>
          </Field>
          <Field label="Burimi">
            <select value={source} onChange={(e) => setSource(e.target.value)} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold">
              <option value="telefon">Telefon</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="showroom">Showroom</option>
              <option value="terren">Terren</option>
              <option value="tjeter">Tjetër</option>
            </select>
          </Field>
        </div>
        <Field label="Adresa e dorëzimit">
          <input name="delivery_address" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Transporti">
          <input name="transport" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Shënime">
          <textarea name="notes" rows={2} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </Field>
      </Collapsible>

      {error && (
        <p className="rounded-xl border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={saving || (!customerId && !customerLabel.trim())}>
        {saving ? "Duke ruajtur…" : "Ruaj porosinë"}
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
