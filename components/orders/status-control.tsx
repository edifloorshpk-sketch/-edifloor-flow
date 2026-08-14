"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/actions/orders";
import { Button } from "@/components/ui/button";

export function OrderStatusControl<T extends string>({
  orderId,
  currentStatus,
  flow,
  labels,
}: {
  orderId: string;
  currentStatus: T;
  flow: T[];
  labels: Record<T, string>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const currentIndex = flow.indexOf(currentStatus);
  const next = currentIndex >= 0 && currentIndex < flow.length - 1 ? flow[currentIndex + 1] : null;

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
        {labels[currentStatus]}
      </span>
      {next && (
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await updateOrderStatus(orderId, next);
              router.refresh();
            })
          }
          className="!px-3 !py-1.5 text-xs"
        >
          Kalo te &quot;{labels[next]}&quot;
        </Button>
      )}
    </div>
  );
}
