"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { convertRequestToProject } from "@/app/actions/projects";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle } from "lucide-react";

export function ConvertToProjectButton({ requestId }: { requestId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const projectId = await convertRequestToProject(requestId);
          router.push(`/requests/${requestId}`);
          router.refresh();
          void projectId;
        })
      }
      className="w-full"
    >
      <ArrowRightCircle className="h-4 w-4" /> Ktheje në projekt aktiv
    </Button>
  );
}
