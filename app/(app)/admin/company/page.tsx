import { createClient } from "@/lib/supabase/server";
import { updateCompanySettings } from "@/app/actions/admin";
import { uploadCompanyLogo } from "@/app/actions/branding";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminCompanyPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("company_settings").select("*").eq("id", 1).single();

  return (
    <div className="space-y-6">
      <h1 className="font-display text-xl font-semibold">Të dhënat e kompanisë</h1>

      <Card>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted">Logoja</p>
        {settings?.logo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={settings.logo_url} alt="Logo" className="mb-3 h-16 object-contain" />
        )}
        <form action={uploadCompanyLogo} className="flex items-center gap-2">
          <input type="file" name="logo" accept="image/*" className="text-sm" />
          <Button type="submit" variant="secondary" className="!py-1.5 text-xs">Ngarko</Button>
        </form>
      </Card>

      <form action={updateCompanySettings} className="space-y-4">
        <Field label="Emri i kompanisë">
          <input name="company_name" defaultValue={settings?.company_name} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Adresa">
          <input name="address" defaultValue={settings?.address ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Telefoni">
            <input name="phone" defaultValue={settings?.phone ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
          <Field label="Email">
            <input name="email" defaultValue={settings?.email ?? ""} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
          </Field>
        </div>
        <Field label="TVSH (%)">
          <input name="vat_rate" type="number" step="0.1" defaultValue={settings?.vat_rate ?? 18} className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </Field>
        <Field label="Numri WhatsApp i Fabrikës (për njoftime porosish)">
          <input
            name="factory_whatsapp"
            placeholder="p.sh. +38344123456"
            defaultValue={settings?.factory_whatsapp ?? ""}
            className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold"
          />
          <p className="mt-1 text-xs text-muted">
            Numri i personit që e menaxhon grupin &quot;Fabrika&quot; në WhatsApp. Çdo porosi do të ketë buton për ta dërguar drejt këtij numri.
          </p>
        </Field>
        <Button type="submit" className="w-full">Ruaj</Button>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted">{label}</span>
      {children}
    </label>
  );
}
