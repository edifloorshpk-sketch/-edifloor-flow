// Hand-authored types mirroring supabase/migrations/0001_schema.sql.
// Once the project is linked, replace with `supabase gen types typescript`.

export type UserRole = "super_admin" | "menaxher" | "shitje" | "fabrike" | "terreni";

export type OrderSource = "telefon" | "whatsapp" | "email" | "showroom" | "terren" | "tjeter";

export type ProductOrderStatus =
  | "e_re" | "ne_pritje_konfirmimi" | "e_konfirmuar" | "ne_pritje_prodhimi"
  | "ne_prodhim" | "kontrolli_cilesise" | "gati" | "ne_transport"
  | "e_dorezuar" | "e_perfunduar" | "e_anuluar";

export type WorkRequestStatus =
  | "kerkese_e_re" | "duhet_telefonuar" | "vizite_e_planifikuar" | "vizita_u_realizua"
  | "duhet_pergatitur_oferta" | "oferta_u_dergua" | "ne_pritje_pergjigje"
  | "e_aprovuar" | "e_refuzuar" | "e_planifikuar" | "ne_proces" | "e_nderprere"
  | "e_perfunduar" | "e_faturuar" | "e_paguar" | "e_anuluar";

export type PriorityLevel = "e_ulet" | "normale" | "e_larte" | "urgjente";
export type FinishType = "gloss" | "matt" | "semi_matt" | "transparente" | "me_ngjyre";

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
}

export interface Customer {
  id: string;
  name: string;
  company_name: string | null;
  contact_person: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  fiscal_number: string | null;
  notes: string | null;
  source: OrderSource;
  is_archived: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category_id: string | null;
  description: string | null;
  unit: string;
  ab_ratio: string | null;
  min_consumption: number | null;
  standard_consumption: number | null;
  max_consumption: number | null;
  sale_price: number | null;
  current_stock: number;
  min_stock: number;
  is_active: boolean;
}

export interface ProductOrder {
  id: string;
  order_number: string;
  customer_id: string;
  order_date: string;
  status: ProductOrderStatus;
  priority: PriorityLevel;
  requested_deadline: string | null;
  responsible_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface WorkRequest {
  id: string;
  request_number: string;
  customer_id: string;
  location_text: string | null;
  area_sqm: number | null;
  floor_system_id: string | null;
  status: WorkRequestStatus;
  priority: PriorityLevel;
  deadline: string | null;
  created_at: string;
}

// Minimal placeholder so @supabase/ssr generics compile without full generated types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  menaxher: "Menaxher",
  shitje: "Shitje/Zyrë",
  fabrike: "Përgjegjës i fabrikës",
  terreni: "Ekipi i terrenit",
};

export const PRODUCT_ORDER_STATUS_LABELS: Record<ProductOrderStatus, string> = {
  e_re: "E re",
  ne_pritje_konfirmimi: "Në pritje të konfirmimit",
  e_konfirmuar: "E konfirmuar",
  ne_pritje_prodhimi: "Në pritje të prodhimit",
  ne_prodhim: "Në prodhim",
  kontrolli_cilesise: "Kontrolli i cilësisë",
  gati: "Gati",
  ne_transport: "Në transport",
  e_dorezuar: "E dorëzuar",
  e_perfunduar: "E përfunduar",
  e_anuluar: "E anuluar",
};

export const WORK_REQUEST_STATUS_LABELS: Record<WorkRequestStatus, string> = {
  kerkese_e_re: "Kërkesë e re",
  duhet_telefonuar: "Duhet telefonuar",
  vizite_e_planifikuar: "Vizitë e planifikuar",
  vizita_u_realizua: "Vizita u realizua",
  duhet_pergatitur_oferta: "Duhet përgatitur oferta",
  oferta_u_dergua: "Oferta u dërgua",
  ne_pritje_pergjigje: "Në pritje të përgjigjes",
  e_aprovuar: "E aprovuar",
  e_refuzuar: "E refuzuar",
  e_planifikuar: "E planifikuar",
  ne_proces: "Në proces",
  e_nderprere: "E ndërprerë",
  e_perfunduar: "E përfunduar",
  e_faturuar: "E faturuar",
  e_paguar: "E paguar",
  e_anuluar: "E anuluar",
};

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  e_ulet: "E ulët",
  normale: "Normale",
  e_larte: "E lartë",
  urgjente: "Urgjente",
};

// urgency -> tailwind color token, per spec: green ok / yellow approaching / red overdue / gray archived
export function urgencyFromDeadline(deadline: string | null, isDone: boolean): "green" | "yellow" | "red" | "gray" {
  if (isDone) return "gray";
  if (!deadline) return "yellow";
  const days = (new Date(deadline).getTime() - Date.now()) / 86400000;
  if (days < 0) return "red";
  if (days <= 2) return "yellow";
  return "green";
}
