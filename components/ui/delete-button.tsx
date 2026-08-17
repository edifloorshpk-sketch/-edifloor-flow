"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteButton({
  label,
  confirmLabel,
  action,
}: {
  label: string;
  confirmLabel: string;
  action: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          disabled={pending}
          onClick={() => startTransition(action)}
          className="tap-target flex-1 rounded-xl bg-danger px-4 text-sm font-medium text-white"
        >
          {pending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : confirmLabel}
        </button>
        <button
          disabled={pending}
          onClick={() => setConfirming(false)}
          className="tap-target rounded-xl border border-border px-4 text-sm text-muted"
        >
          Anulo
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="tap-target flex w-full items-center justify-center gap-2 rounded-xl border border-danger text-sm font-medium text-danger hover:bg-danger/5"
    >
      <Trash2 className="h-4 w-4" /> {label}
    </button>
  );
}
