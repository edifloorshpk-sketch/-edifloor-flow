"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleTaskDone } from "@/app/actions/tasks";
import { Check } from "lucide-react";

export function CompleteTaskButton({ taskId, isDone }: { taskId: string; isDone: boolean }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await toggleTaskDone(taskId, !isDone);
          router.refresh();
        })
      }
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
        isDone ? "border-ok bg-ok text-white" : "border-border"
      }`}
    >
      {isDone && <Check className="h-4 w-4" />}
    </button>
  );
}
