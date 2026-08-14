import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WORK_REQUEST_STATUS_LABELS, urgencyFromDeadline, type WorkRequestStatus } from "@/lib/types/database";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("work_requests")
    .select("id, request_number, status, area_sqm, deadline, customers(name)")
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Punimet</h1>
        <Link href="/requests/new">
          <Button className="!px-3"><Plus className="h-4 w-4" /> Kërkesë e re</Button>
        </Link>
      </div>
      <div className="space-y-2">
        {(requests ?? []).map((r) => (
          <Link key={r.id} href={`/requests/${r.id}`}>
            <Card className={`border-l-4 ${
              { green: "border-l-ok", yellow: "border-l-warn", red: "border-l-danger", gray: "border-l-archived" }[
                urgencyFromDeadline(r.deadline, ["e_perfunduar", "e_paguar", "e_anuluar"].includes(r.status))
              ]
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{r.request_number}</p>
                  {/* @ts-expect-error joined relation */}
                  <p className="text-xs text-muted">{r.customers?.name} · {r.area_sqm} m²</p>
                </div>
                <span className="text-xs text-muted">{WORK_REQUEST_STATUS_LABELS[r.status as WorkRequestStatus]}</span>
              </div>
            </Card>
          </Link>
        ))}
        {(requests ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Asnjë kërkesë ende.</p>
        )}
      </div>
    </div>
  );
}
