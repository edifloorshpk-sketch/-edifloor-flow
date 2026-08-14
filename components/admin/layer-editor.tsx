"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSystemLayer, addSystemLayer, deleteSystemLayer } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface Layer {
  id: string;
  layer_order: number;
  layer_name: string;
  product_id: string | null;
  consumption_per_sqm: number | null;
}
interface ProductOption {
  id: string;
  name: string;
}

export function LayerEditor({ systemId, layers, products }: { systemId: string; layers: Layer[]; products: ProductOption[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-3">
      {layers.map((layer) => (
        <Card key={layer.id}>
          <form
            action={(fd) => {
              fd.append("floor_system_id", systemId);
              startTransition(async () => {
                await updateSystemLayer(layer.id, fd);
                router.refresh();
              });
            }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted">Shtresa {layer.layer_order}</span>
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    await deleteSystemLayer(layer.id, systemId);
                    router.refresh();
                  })
                }
                className="ml-auto text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <input
              name="layer_name"
              defaultValue={layer.layer_name}
              className="tap-target w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                name="product_id"
                defaultValue={layer.product_id ?? ""}
                className="tap-target rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold"
              >
                <option value="">Produkti —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                name="consumption_per_sqm"
                type="number"
                step="0.001"
                placeholder="kg/m²"
                defaultValue={layer.consumption_per_sqm ?? ""}
                className="tap-target rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold"
              />
            </div>
            <Button type="submit" variant="secondary" disabled={pending} className="w-full !py-1.5 text-xs">
              Ruaj shtresën
            </Button>
          </form>
        </Card>
      ))}

      <form
        action={(fd) =>
          startTransition(async () => {
            await addSystemLayer(systemId, fd);
            router.refresh();
          })
        }
        className="flex items-center gap-2"
      >
        <input name="layer_name" placeholder="Emri i shtresës së re" required className="tap-target flex-1 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-gold" />
        <button type="submit" className="tap-target flex items-center gap-1 rounded-xl bg-gold px-3 text-xs font-medium text-gold-foreground">
          <Plus className="h-4 w-4" /> Shto
        </button>
      </form>
    </div>
  );
}
