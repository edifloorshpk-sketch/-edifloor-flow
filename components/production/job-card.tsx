"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { advanceProductionJob } from "@/app/actions/production";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const FLOW = ["pranuar", "ne_prodhim", "kontrolli_cilesise", "gati_paketim", "gati_dorezim"] as const;
const LABELS: Record<(typeof FLOW)[number], string> = {
  pranuar: "Prano porosinë",
  ne_prodhim: "Fillo prodhimin",
  kontrolli_cilesise: "Kontrolli i cilësisë",
  gati_paketim: "Gati për paketim",
  gati_dorezim: "Gati për dorëzim",
};

export function ProductionJobCard({
  jobId,
  orderNumber,
  customerName,
  status,
}: {
  jobId: string;
  orderNumber: string;
  customerName: string;
  status: string;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const idx = FLOW.indexOf(status as (typeof FLOW)[number]);
  const next = idx >= 0 && idx < FLOW.length - 1 ? FLOW[idx + 1] : null;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{orderNumber}</p>
          <p className="text-xs text-muted">{customerName}</p>
        </div>
        <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-medium text-gold">
          {LABELS[status as (typeof FLOW)[number]] ?? status}
        </span>
      </div>
      {next && (
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await advanceProductionJob(jobId, next);
              router.refresh();
            })
          }
          className="mt-3 w-full !py-2 text-xs"
        >
          {LABELS[next]}
        </Button>
      )}
    </Card>
  );
}
