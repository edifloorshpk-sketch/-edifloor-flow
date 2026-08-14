"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole, toggleUserActive } from "@/app/actions/admin";
import { ROLE_LABELS, type UserRole } from "@/lib/types/database";
import { Card } from "@/components/ui/card";

interface UserRow {
  id: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
}

export function UsersTable({ users }: { users: UserRow[] }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <Card key={u.id} className={!u.is_active ? "opacity-50" : ""}>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">{u.full_name}</span>
            <div className="flex items-center gap-2">
              <select
                defaultValue={u.role}
                disabled={pending}
                onChange={(e) =>
                  startTransition(async () => {
                    await updateUserRole(u.id, e.target.value);
                    router.refresh();
                  })
                }
                className="tap-target rounded-lg border border-border bg-surface px-2 text-xs outline-none focus:border-gold"
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <button
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await toggleUserActive(u.id, !u.is_active);
                    router.refresh();
                  })
                }
                className={`rounded-lg px-2 py-1 text-xs font-medium ${u.is_active ? "text-danger" : "text-ok"}`}
              >
                {u.is_active ? "Çaktivizo" : "Aktivizo"}
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
