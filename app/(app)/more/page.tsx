import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/layout/logout-button";
import { Factory, Users, Package, ClipboardList, BarChart3, Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const role = profile?.role ?? "shitje";
  const items = [
    { href: "/customers", label: "Klientët", icon: Users, roles: ["super_admin", "menaxher", "shitje"] },
    { href: "/production", label: "Prodhimi", icon: Factory, roles: ["super_admin", "menaxher", "fabrike"] },
    { href: "/catalog", label: "Katalogu i produkteve", icon: Package, roles: ["super_admin", "menaxher"] },
    { href: "/reports", label: "Raportet", icon: BarChart3, roles: ["super_admin", "menaxher"] },
    { href: "/tasks", label: "Detyrat", icon: ClipboardList, roles: ["super_admin", "menaxher", "shitje", "fabrike", "terreni"] },
    { href: "/admin", label: "Paneli administrativ", icon: Settings, roles: ["super_admin"] },
  ].filter((i) => i.roles.includes(role));

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Më shumë</h1>
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="tap-target flex items-center gap-3 rounded-xl border border-border bg-surface px-4 hover:border-gold"
            >
              <Icon className="h-5 w-5 text-gold" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      <LogoutButton />
    </div>
  );
}
