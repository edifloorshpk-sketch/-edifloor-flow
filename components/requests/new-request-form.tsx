"use client";

import { useMemo, useState, useTransition } from "react";
import { createWorkRequest, searchCustomers } from "@/app/actions/requests";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { calcSystemMaterials, type LayerInput } from "@/lib/calc/material";
import { Search } from "lucide-react";

interface SystemRow {
  id: string;
  name: string;
  category: string | null;
  layer_count: number;
  waste_reserve_pct: number;
}

interface LayerRow {
  id: string;
  floor_system_id: string;
  layer_order: number;
  layer_name: string;
  finish: string | null;
  consumption_per_sqm: number | null;
  product_id: string | null;
  products: {
    id: string;
    name: string;
    standard_consumption: number | null;
    current_stock: number | null;
    product_packaging: { size_value: number; is_default: boolean }[] | null;
  } | null;
}

export function NewWorkRequestForm({
  systems,
  layers,
  initialCustomerId,
}: {
  systems: SystemRow[];
  layers: LayerRow[];
  initialCustomerId?: string;
}) {
  const [customerId, setCustomerId] = useState(initialCustomerId ?? "");
  const [customerLabel, setCustomerLabel] = useState("");
  const [customerResults, setCustomerResults] = useState<{ id: string; name: string; phone: string | null }[]>([]);
  const [systemId, setSystemId] = useState("");
  const [area, setArea] = useState<number>(0);
  const [, startTransition] = useTransition();

  const selectedSystem = systems.find((s) => s.id === systemId);
  const systemLayers = layers.filter((l) => l.floor_system_id === systemId);

  const calc = useMemo(() => {
    if (!selectedSystem || !area) return [];
    const inputs: LayerInput[] = systemLayers.map((l) => ({
      layerName: l.layer_name,
      productId: l.product_id ?? "",
      productName: l.products?.name ?? l.layer_name,
      consumptionPerSqm: l.consumption_per_sqm ?? l.products?.standard_consumption ?? 0,
      packageSizeKg: l.products?.product_packaging?.find((p) => p.is_default)?.size_value,
    }));
    const stockMap = Object.fromEntries(
      systemLayers.map((l) => [l.product_id ?? "", l.products?.current_stock ?? 0])
    );
    return calcSystemMaterials(area, selectedSystem.waste_reserve_pct, inputs, stockMap);
  }, [selectedSystem, systemLayers, area]);

  function onCustomerSearch(term: string) {
    setCustomerLabel(term);
    startTransition(async () => {
      const results = await searchCustomers(term);
      setCustomerResults(results as never);
    });
  }

  return (
    <form action={createWorkRequest} className="space-y-4">
      <input type="hidden" name="customer_id" value={customerId} />

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

      <Field label="Lokacioni">
        <input name="location_text" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Lloji i objektit">
          <input name="building_type" placeholder="p.sh. depo, parking" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Sipërfaqja (m²) *">
          <input
            name="area_sqm"
            type="number"
            step="0.01"
            required
            value={area || ""}
            onChange={(e) => setArea(Number(e.target.value))}
            className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold"
          />
        </Field>
      </div>

      <Field label="Sistemi i dyshemesë *">
        <select
          name="floor_system_id"
          required
          value={systemId}
          onChange={(e) => setSystemId(e.target.value)}
          className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold"
        >
          <option value="">Zgjidh sistemin…</option>
          {systems.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.layer_count} shtresa)
            </option>
          ))}
        </select>
      </Field>

      {calc.length > 0 && (
        <Card className="border-gold/40 bg-gold/5">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gold">
            Kalkulimi automatik i materialit ({area} m² · rezervë {selectedSystem?.waste_reserve_pct}%)
          </p>
          <div className="space-y-2">
            {calc.map((row) => (
              <div key={row.layerName} className="flex items-center justify-between text-sm">
                <span>{row.productName}</span>
                <span className="text-right">
                  <span className="font-medium">{row.totalQty} kg</span>
                  {row.packageCount !== null && (
                    <span className="ml-1.5 text-xs text-muted">({row.packageCount} paketime)</span>
                  )}
                  {row.qtyMissing !== undefined && row.qtyMissing > 0 && (
                    <span className="block text-xs text-danger">Mungon: {row.qtyMissing} kg</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Ngjyra RAL/NCS">
          <input name="color_ral" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Finish">
          <select name="finish" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold">
            <option value="">—</option>
            <option value="gloss">Gloss</option>
            <option value="matt">Matt</option>
            <option value="semi_matt">Semi-Matt</option>
            <option value="transparente">Transparente</option>
            <option value="me_ngjyre">Me ngjyrë</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data e vizitës">
          <input name="visit_date" type="date" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Afati">
          <input name="deadline" type="date" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Çmimi për m²">
          <input name="price_per_sqm" type="number" step="0.01" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Buxheti i përafërt">
          <input name="estimated_budget" type="number" step="0.01" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
      </div>

      <Field label="Shënimet e klientit">
        <textarea name="client_notes" rows={3} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold" />
      </Field>

      <Button type="submit" className="w-full" disabled={!customerId}>
        Ruaj kërkesën
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
