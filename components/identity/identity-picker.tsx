"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { User } from "lucide-react";

export function IdentityPicker({ staff }: { staff: { id: string; name: string }[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";

  function choose(id: string, name: string) {
    const value = encodeURIComponent(JSON.stringify({ id, name }));
    document.cookie = `edifloor_identity=${value}; path=/; max-age=${60 * 60 * 24 * 60}`;
    router.push(next);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {staff.map((s) => (
        <button
          key={s.id}
          onClick={() => choose(s.id, s.name)}
          className="tap-target flex flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-6 hover:border-gold"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold">
            <User className="h-6 w-6" />
          </span>
          <span className="text-sm font-medium">{s.name}</span>
        </button>
      ))}
    </div>
  );
}
