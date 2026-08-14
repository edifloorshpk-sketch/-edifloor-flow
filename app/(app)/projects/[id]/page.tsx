import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { ChecklistItem } from "@/components/requests/checklist-item";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: project }, { data: steps }] = await Promise.all([
    supabase.from("projects").select("*, work_requests(request_number, location_text, area_sqm, floor_system_id), customers(name, phone)").eq("id", id).single(),
    supabase.from("project_checklists").select("*").eq("project_id", id).order("step_order"),
  ]);

  if (!project) notFound();
  const request = project.work_requests;
  const customer = project.customers;

  const done = (steps ?? []).filter((s) => s.is_done).length;
  const total = (steps ?? []).length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-gold">{request?.request_number}</p>
        <h1 className="font-display text-xl font-semibold">{customer?.name}</h1>
        <p className="text-sm text-muted">{request?.location_text} · {request?.area_sqm} m²</p>
      </div>

      <Card>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Checklista ditore</span>
          <span className="text-muted">{done}/{total}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-ok transition-all" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
        </div>
      </Card>

      <div className="space-y-2">
        {(steps ?? []).map((s) => (
          <ChecklistItem key={s.id} id={s.id} projectId={id} stepName={s.step_name} isDone={s.is_done} />
        ))}
      </div>

      <p className="text-xs text-muted">
        Ngarkimi i fotografive (para/gjatë/pas) dhe navigimi te Google Maps do të shtohen te ky ekran në versionin e ardhshëm.
      </p>
    </div>
  );
}
