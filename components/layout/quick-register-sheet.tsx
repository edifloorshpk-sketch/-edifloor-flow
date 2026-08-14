"use client";

import { useRouter } from "next/navigation";
import { Package, HardHat, UserPlus, ListTodo, PhoneCall, X } from "lucide-react";

const options = [
  { href: "/orders/new", label: "Porosi produktesh", desc: "Regjistro një porosi për materiale", icon: Package },
  { href: "/requests/new", label: "Kërkesë për punime", desc: "Regjistro një kërkesë për dysheme", icon: HardHat },
  { href: "/customers/new", label: "Klient i ri", desc: "Shto klient në sistem", icon: UserPlus },
  { href: "/tasks/new", label: "Detyrë e re", desc: "Cakto një detyrë me afat", icon: ListTodo },
  { href: "/notes/new", label: "Shënim nga telefonata", desc: "Ruaj shpejt një telefonatë të hyrë", icon: PhoneCall },
];

export function QuickRegisterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl border border-border bg-surface-raised p-5 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Regjistro të re</h2>
          <button onClick={onClose} className="tap-target rounded-full p-2 text-muted hover:bg-surface" aria-label="Mbyll">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.href}
                onClick={() => {
                  onClose();
                  router.push(opt.href);
                }}
                className="tap-target flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left hover:border-gold"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{opt.label}</span>
                  <span className="block text-xs text-muted">{opt.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
