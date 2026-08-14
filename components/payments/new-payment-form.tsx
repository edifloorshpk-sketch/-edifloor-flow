"use client";

import { useState, useTransition } from "react";
import { recordPayment, searchPayableOrders } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function NewPaymentForm() {
  const [label, setLabel] = useState("");
  const [selected, setSelected] = useState<{ id: string; type: string } | null>(null);
  const [results, setResults] = useState<{ id: string; label: string; type: "product_order" | "work_request" }[]>([]);
  const [, startTransition] = useTransition();

  function onSearch(term: string) {
    setLabel(term);
    setSelected(null);
    startTransition(async () => {
      const r = await searchPayableOrders(term);
      setResults(r);
    });
  }

  return (
    <form action={recordPayment} className="space-y-4">
      <input type="hidden" name="related_id" value={selected?.id ?? ""} />
      <input type="hidden" name="related_type" value={selected?.type ?? "product_order"} />

      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Porosia ose kërkesa *</span>
        <input
          value={label}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="ED-P-2026-0001 ose ED-W-2026-0001"
          className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold"
        />
        {results.length > 0 && !selected && (
          <div className="mt-1 space-y-1 rounded-xl border border-border bg-surface p-1">
            {results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setSelected({ id: r.id, type: r.type });
                  setLabel(r.label);
                  setResults([]);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-raised"
              >
                <Search className="h-3.5 w-3.5 text-muted" /> {r.label}
              </button>
            ))}
          </div>
        )}
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Shuma (€) *</span>
        <input name="amount" type="number" step="0.01" required className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Data</span>
          <input name="paid_at" type="date" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Mënyra</span>
          <select name="method" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold">
            <option value="cash">Cash</option>
            <option value="banke">Transfer bankar</option>
            <option value="karte">Kartë</option>
          </select>
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={!selected}>Ruaj pagesën</Button>
    </form>
  );
}
