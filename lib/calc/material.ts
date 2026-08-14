// Kalkulimi automatik i materialit
// Sasia e nevojshme = Sipërfaqja × Konsumi për m² × (1 + Rezerva e humbjes)

export interface LayerInput {
  layerName: string;
  productId: string;
  productName: string;
  consumptionPerSqm: number; // kg/m² (or product unit per m²)
  packageSizeKg?: number; // default packaging size for rounding up boxes/buckets
}

export interface LayerResult extends LayerInput {
  theoreticalQty: number;
  totalQty: number; // with waste reserve applied
  packageCount: number | null;
  stockAvailable?: number;
  qtyMissing?: number;
}

export function calcLayerQuantity(
  surfaceSqm: number,
  consumptionPerSqm: number,
  wasteReservePct: number
): { theoretical: number; total: number } {
  const theoretical = surfaceSqm * consumptionPerSqm;
  const total = theoretical * (1 + wasteReservePct / 100);
  return {
    theoretical: round3(theoretical),
    total: round3(total),
  };
}

export function calcSystemMaterials(
  surfaceSqm: number,
  wasteReservePct: number,
  layers: LayerInput[],
  stockByProductId?: Record<string, number>
): LayerResult[] {
  return layers.map((layer) => {
    const { theoretical, total } = calcLayerQuantity(surfaceSqm, layer.consumptionPerSqm, wasteReservePct);
    const packageCount = layer.packageSizeKg ? Math.ceil(total / layer.packageSizeKg) : null;
    const stockAvailable = stockByProductId?.[layer.productId];
    const qtyMissing =
      stockAvailable !== undefined ? Math.max(0, round3(total - stockAvailable)) : undefined;
    return {
      ...layer,
      theoreticalQty: theoretical,
      totalQty: total,
      packageCount,
      stockAvailable,
      qtyMissing,
    };
  });
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
