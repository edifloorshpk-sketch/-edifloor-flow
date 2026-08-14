import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const in30 = new Date(Date.now() + 30 * 86400000).toISOString();

  const { data: events } = await supabase
    .from("calendar_events")
    .select("id, title, event_type, start_at")
    .gte("start_at", today)
    .lte("start_at", in30)
    .order("start_at");

  const byDay = new Map<string, typeof events>();
  (events ?? []).forEach((e) => {
    const day = e.start_at.slice(0, 10);
    byDay.set(day, [...(byDay.get(day) ?? []), e]);
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Kalendari</h1>
      {byDay.size === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
          Asnjë ngjarje e planifikuar në 30 ditët e ardhshme.
          <br />
          <span className="text-xs">
            (Pamja drag-and-drop dhe paralajmërimet për konflikte do të shtohen në versionin e ardhshëm.)
          </span>
        </p>
      ) : (
        [...byDay.entries()].map(([day, items]) => (
          <div key={day}>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted">
              {new Date(day).toLocaleDateString("sq", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <div className="space-y-2">
              {(items ?? []).map((e) => (
                <Card key={e.id} className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-gold" />
                  <span className="text-sm">{e.title}</span>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
