import Link from "next/link";
import { Bell } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/types/database";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { DesktopUserMenu } from "@/components/layout/desktop-user-menu";
import { getStaffIdentity } from "@/lib/identity";

const navLinks = [
  { href: "/dashboard", label: "Kryefaqja" },
  { href: "/orders", label: "Porositë" },
  { href: "/requests", label: "Punimet" },
  { href: "/calendar", label: "Kalendari" },
  { href: "/more", label: "Më shumë" },
];

export async function TopBar({ fullName, role }: { fullName: string; role: UserRole }) {
  const identity = await getStaffIdentity();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold text-sm font-display font-bold text-gold-foreground">
              EF
            </span>
            <span className="font-display text-sm font-semibold leading-tight">
              Edifloor Flow
              <span className="block text-[11px] font-normal text-muted">{ROLE_LABELS[role]} · {fullName}</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-4 md:flex">
            {navLinks.map((l) => (
              <Link key={l.href} href={l.href} className="text-sm text-muted hover:text-foreground">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/identity"
            className="tap-target flex items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium hover:border-gold"
          >
            {identity ? identity.name : "Kush je ti?"}
          </Link>
          <ThemeToggle />
          <Link
            href="/notifications"
            className="tap-target flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-surface-raised hover:text-foreground"
            aria-label="Njoftimet"
          >
            <Bell className="h-5 w-5" />
          </Link>
          <DesktopUserMenu />
        </div>
      </div>
    </header>
  );
}
