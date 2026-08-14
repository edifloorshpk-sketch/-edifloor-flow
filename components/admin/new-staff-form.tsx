"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createStaffUser } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, type UserRole } from "@/lib/types/database";
import { UserPlus } from "lucide-react";

export function NewStaffForm() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="tap-target flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-4 text-sm font-medium text-gold-foreground"
        >
          <UserPlus className="h-4 w-4" /> Shto punëtor të ri
        </button>
      ) : (
        <form
          action={(fd) => {
            setError(null);
            startTransition(async () => {
              try {
                await createStaffUser(fd);
                setOpen(false);
                router.refresh();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Gabim");
              }
            });
          }}
          className="space-y-3 rounded-xl border border-border bg-surface p-4"
        >
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Emri i plotë *</span>
            <input name="full_name" required className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Email *</span>
            <input name="email" type="email" required className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Fjalëkalimi fillestar * (min. 8 shkronja)</span>
            <input name="password" type="text" required minLength={8} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-muted">Roli</span>
            <select name="role" defaultValue="shitje" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold">
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label as UserRole}</option>
              ))}
            </select>
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? "Duke krijuar…" : "Krijo llogarinë"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Anulo</Button>
          </div>
        </form>
      )}
    </div>
  );
}
