import Link from "next/link";
import { Bell } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/types/database";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function TopBar({ fullName, role }: { fullName: string; role: UserRole }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-sm font-display font-bold text-gold-foreground">
            EF
          </span>
          <span className="font-display text-sm font-semibold leading-tight">
            Edifloor Flow
            <span className="block text-[11px] font-normal text-muted">{ROLE_LABELS[role]} · {fullName}</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            href="/notifications"
            className="tap-target flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface-raised hover:text-foreground"
            aria-label="Njoftimet"
          >
            <Bell className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
