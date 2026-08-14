"use client";

import { useState, useTransition } from "react";
import { createCustomer, findPossibleDuplicates } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

const sources = [
  { value: "telefon", label: "Telefon" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "Email" },
  { value: "showroom", label: "Showroom" },
  { value: "terren", label: "Terren" },
  { value: "tjeter", label: "Tjetër" },
];

export default function NewCustomerPage() {
  const [name, setName] = useState("");
  const [duplicates, setDuplicates] = useState<{ id: string; name: string; phone: string | null }[]>([]);
  const [pending, startTransition] = useTransition();

  function handleNameChange(value: string) {
    setName(value);
    startTransition(async () => {
      const results = await findPossibleDuplicates(value);
      setDuplicates(results as never);
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Klient i ri</h1>

      {duplicates.length > 0 && (
        <Card className="border-warn bg-warn/5">
          <div className="flex items-start gap-2 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warn" />
            <div>
              <p className="font-medium text-warn">Klientë të ngjashëm ekzistojnë tashmë</p>
              <ul className="mt-1 space-y-0.5 text-muted">
                {duplicates.map((d) => (
                  <li key={d.id}>
                    {d.name} {d.phone ? `· ${d.phone}` : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      <form action={createCustomer} className="space-y-4">
        <Field label="Emri i klientit ose kompanisë *">
          <input
            name="name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold"
          />
        </Field>
        <Field label="Emri i kompanisë">
          <input name="company_name" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Personi kontaktues">
          <input name="contact_person" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefon">
            <input name="phone" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
          <Field label="WhatsApp">
            <input name="whatsapp" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
        </div>
        <Field label="Email">
          <input name="email" type="email" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Adresa">
            <input name="address" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
          <Field label="Qyteti">
            <input name="city" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
        </div>
        <Field label="Numri fiskal">
          <input name="fiscal_number" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Burimi">
          <select name="source" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold">
            {sources.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Shënime">
          <textarea name="notes" rows={3} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </Field>

        <Button type="submit" className="w-full" disabled={pending}>
          Ruaj klientin
        </Button>
      </form>
    </div>
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
