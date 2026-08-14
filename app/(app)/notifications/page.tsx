import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("id, title, body, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Njoftimet</h1>
      <div className="space-y-2">
        {(notifications ?? []).map((n) => (
          <Card key={n.id} className={n.is_read ? "opacity-60" : "border-gold/40"}>
            <div className="flex items-start gap-2">
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="text-xs text-muted">{n.body}</p>}
              </div>
            </div>
          </Card>
        ))}
        {(notifications ?? []).length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted">
            Asnjë njoftim ende.
          </p>
        )}
      </div>
    </div>
  );
}
