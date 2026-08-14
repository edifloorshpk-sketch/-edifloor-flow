"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, HardHat, CalendarDays, MoreHorizontal, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { QuickRegisterSheet } from "@/components/layout/quick-register-sheet";

const items = [
  { href: "/dashboard", label: "Kryefaqja", icon: Home },
  { href: "/orders", label: "Porositë", icon: ClipboardList },
  { href: "/requests", label: "Punimet", icon: HardHat },
  { href: "/calendar", label: "Kalendari", icon: CalendarDays },
  { href: "/more", label: "Më shumë", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();
  const [quickOpen, setQuickOpen] = useState(false);

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="relative flex items-center justify-between px-2">
          {items.slice(0, 2).map((item) => (
            <NavItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}

          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setQuickOpen(true)}
              className="tap-target -translate-y-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-lg active:scale-95 transition-transform"
              aria-label="Regjistro të re"
            >
              <Plus className="h-6 w-6" strokeWidth={2.5} />
            </button>
          </div>

          {items.slice(2).map((item) => (
            <NavItem key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </div>
      </nav>

      <QuickRegisterSheet open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  );
}

function NavItem({
  item,
  active,
}: {
  item: (typeof items)[number];
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[11px]",
        active ? "text-gold" : "text-muted"
      )}
    >
      <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
      {item.label}
    </Link>
  );
}
