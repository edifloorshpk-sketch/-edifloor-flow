import Link from "next/link";
import { Package, Layers, Users, Building2 } from "lucide-react";

export default function AdminHomePage() {
  const sections = [
    { href: "/admin/products", label: "Produktet", desc: "Çmime, konsume, stoqe, paketime", icon: Package },
    { href: "/admin/systems", label: "Sistemet e dyshemeve", desc: "Shtresat dhe rezerva e humbjes", icon: Layers },
    { href: "/admin/users", label: "Përdoruesit dhe rolet", desc: "Qasje sipas rolit", icon: Users },
    { href: "/admin/company", label: "Të dhënat e kompanisë", desc: "Emri, logoja, TVSH", icon: Building2 },
  ];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Paneli administrativ</h1>
      <div className="space-y-2">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="tap-target flex items-center gap-3 rounded-xl border border-border bg-surface px-4 hover:border-gold">
              <Icon className="h-5 w-5 text-gold" />
              <span>
                <span className="block text-sm font-medium">{s.label}</span>
                <span className="block text-xs text-muted">{s.desc}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
