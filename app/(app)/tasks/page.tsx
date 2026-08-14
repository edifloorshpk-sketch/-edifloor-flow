import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CompleteTaskButton } from "@/components/tasks/complete-button";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, title, description, due_date, is_done")
    .order("is_done")
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-semibold">Detyrat</h1>
        <Link href="/tasks/new">
          <Button className="!px-3"><Plus className="h-4 w-4" /> Detyrë e re</Button>
        </Link>
      </div>
      <div className="space-y-2">
        {(tasks ?? []).map((t) => (
          <Card key={t.id} className={t.is_done ? "opacity-50" : ""}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className={`text-sm font-medium ${t.is_done ? "line-through" : ""}`}>{t.title}</p>
                {t.description && <p className="text-xs text-muted">{t.description}</p>}
                {t.due_date && <p className="mt-1 text-xs text-gold">Afati: {t.due_date}</p>}
              </div>
              <CompleteTaskButton taskId={t.id} isDone={t.is_done} />
            </div>
          </Card>
        ))}
        {(tasks ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">Asnjë detyrë ende.</p>
        )}
      </div>
    </div>
  );
}
