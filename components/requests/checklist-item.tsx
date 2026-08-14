"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleChecklistStep } from "@/app/actions/checklist";
import { Check } from "lucide-react";

export function ChecklistItem({
  id,
  projectId,
  stepName,
  isDone,
}: {
  id: string;
  projectId: string;
  stepName: string;
  isDone: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleChecklistStep(id, projectId, !isDone);
          router.refresh();
        })
      }
      className="tap-target flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 text-left"
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
          isDone ? "border-ok bg-ok text-white" : "border-border"
        }`}
      >
        {isDone && <Check className="h-4 w-4" />}
      </span>
      <span className={`text-sm ${isDone ? "text-muted line-through" : ""}`}>{stepName}</span>
    </button>
  );
}
