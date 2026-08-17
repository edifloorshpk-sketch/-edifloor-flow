import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { WORK_REQUEST_STATUS_LABELS } from "@/lib/types/database";
import { ConvertToProjectButton } from "@/components/requests/convert-button";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { MessageCircle } from "lucide-react";
import { archiveWorkRequest } from "@/app/actions/requests";
import { DeleteButton } from "@/components/ui/delete-button";

export const dynamic = "force-dynamic";

export default async function WorkRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: request }, { data: project }] = await Promise.all([
    supabase.from("work_requests").select("*, customers(id, name, phone, whatsapp), floor_systems(name, layer_count), staff_members(name)").eq("id", id).single(),
    supabase.from("projects").select("id, status").eq("work_request_id", id).maybeSingle(),
  ]);

  if (!request) notFound();
  const customer = request.customers;
  const system = request.floor_systems;

  const waMessage = `Përshëndetje ${customer.name}, ju shkruajmë nga Edifloor Group për kërkesën ${request.request_number}. Statusi aktual: ${WORK_REQUEST_STATUS_LABELS[request.status as keyof typeof WORK_REQUEST_STATUS_LABELS]}.${request.deadline ? ` Afati: ${request.deadline}.` : ""}`;
  const waLink = buildWhatsAppLink(customer.whatsapp || customer.phone, waMessage);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-gold">{request.request_number}</p>
        <h1 className="font-display text-xl font-semibold">
          <Link href={`/customers/${customer.id}`} className="hover:underline">{customer.name}</Link>
        </h1>
        <p className="text-sm text-muted">
          {request.location_text}
          {request.staff_members?.name && ` · Regjistroi: ${request.staff_members.name}`}
        </p>
      </div>

      <Card>
        <p className="mb-1 text-xs uppercase tracking-wide text-muted">Statusi</p>
        <span className="rounded-full bg-gold/10 px-3 py-1 text-sm font-medium text-gold">
          {WORK_REQUEST_STATUS_LABELS[request.status as keyof typeof WORK_REQUEST_STATUS_LABELS]}
        </span>
      </Card>

      {waLink && (
        <a
          href={waLink}
          target="_blank"
          className="tap-target flex items-center justify-center gap-2 rounded-xl border border-ok text-sm font-medium text-ok hover:bg-ok/10"
        >
          <MessageCircle className="h-4 w-4" /> Dërgo në WhatsApp
        </a>
      )}

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Info label="Sipërfaqja" value={`${request.area_sqm ?? "—"} m²`} />
        <Info label="Sistemi" value={system ? `${system.name} (${system.layer_count} shtresa)` : "—"} />
        <Info label="Ngjyra" value={request.color_ral ?? "—"} />
        <Info label="Data e vizitës" value={request.visit_date ?? "—"} />
        <Info label="Afati" value={request.deadline ?? "—"} />
        <Info label="Çmimi/m²" value={request.price_per_sqm ? `€${request.price_per_sqm}` : "—"} />
      </div>

      {request.client_notes && (
        <Card>
          <p className="text-xs uppercase tracking-wide text-muted">Shënimet e klientit</p>
          <p className="mt-1 text-sm">{request.client_notes}</p>
        </Card>
      )}

      {project ? (
        <Link href={`/projects/${project.id}`}>
          <Card className="border-gold/40 bg-gold/5 text-center text-sm font-medium text-gold">
            Shiko projektin aktiv →
          </Card>
        </Link>
      ) : (
        ["e_aprovuar", "oferta_u_dergua", "ne_pritje_pergjigje"].includes(request.status) && (
          <ConvertToProjectButton requestId={request.id} />
        )
      )}

      <DeleteButton
        label="Fshij kërkesën"
        confirmLabel="Konfirmo fshirjen"
        action={archiveWorkRequest.bind(null, request.id)}
      />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p>{value}</p>
    </div>
  );
}
