"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPayment, searchCustomersForPayment } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function NewPaymentForm() {
  const [customerId, setCustomerId] = useState("");
  const [customerLabel, setCustomerLabel] = useState("");
  const [results, setResults] = useState<{ id: string; name: string; phone: string | null }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function onSearch(term: string) {
    setCustomerLabel(term);
    setCustomerId("");
    startTransition(async () => {
      const r = await searchCustomersForPayment(term);
      setResults(r);
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await recordPayment(new FormData(e.currentTarget));
      router.push("/payments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="customer_name" value={customerId ? "" : customerLabel} />

      <label className="block">
        <span className="mb-1.5 block text-sm text-muted">Emri i klientit *</span>
        <input
          value={customerLabel}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Shkruaj emrin e klientit…"
          className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold"
        />
        {results.length > 0 && !customerId && (
          <div className="mt-1 space-y-1 rounded-xl border border-border bg-surface p-1">
            {results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCustomerId(c.id);
                  setCustomerLabel(c.name);
                  setResults([]);
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

      {error && (
        <p className="rounded-xl border border-danger bg-danger/5 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={saving || (!customerId && !customerLabel.trim())}>
        {saving ? "Duke ruajtur…" : "Ruaj pagesën"}
      </Button>
    </form>
  );
}
