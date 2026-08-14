# Edifloor Flow

PWA që bashkon porositë e produkteve, kërkesat për punime, prodhimin, ekipet e terrenit,
kalendarin dhe njoftimet e Edifloor Group në një vend të vetëm.

Stack: Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage,
Realtime, RLS) · PWA e instalueshme.

## Gjendja aktuale (Fazë 1)

**E gatshme dhe funksionale:**
- Skema e plotë e databazës (`supabase/migrations/0001_schema.sql`) — klientë, produkte, sisteme
  dyshemesh me shtresa, porosi produktesh, kërkesa punimesh, projekte, checklista, prodhim,
  detyra, komente, njoftime, log aktivitetesh
- Numërim automatik ED-P-YYYY-#### / ED-W-YYYY-#### (`0002_functions.sql`)
- Row Level Security për 5 rolet (`0003_rls.sql`)
- Të dhëna demo reale: katalogu i plotë i produkteve Edifloor, shabllonet e sistemeve
  2/3/4-shtresa, klientë demo, një porosi e vonuar, një projekt aktiv në terren (`0004_seed.sql`)
- Kyçja (Supabase Auth) dhe krijimi automatik i profilit me rol
- Kryefaqja me karta të ngjyrosura sipas urgjencës dhe seksionin "Kërkon vëmendje"
- Moduli i klientëve: listë, kërkim, formular me paralajmërim dublimi live, faqja e detajeve
  me butona telefono/WhatsApp/email/hartë
- Porosi produktesh: formular me rreshta dinamikë produktesh, faqja e detajeve me ndryshim statusi
- Kërkesa për punime: formular i plotë me **kalkulimin automatik të materialit** (sipërfaqja ×
  konsumi/m² × rezerva e humbjes) sipas shtresave të sistemit të zgjedhur, live, me sasi që mungon
  krahasuar me stokun
- "Ktheje në projekt aktiv" — krijon projektin dhe checklistën e terrenit automatikisht
- Ekrani i fabrikës (`/production`) me butona hap-pas-hapi për të avancuar statusin
- Ekrani i projektit në terren (`/projects/[id]`) me checklist të prekshme
- Kalendari (pamje agjende), njoftimet, menyja "Më shumë" e filtruar sipas rolit
- Dizajni: temë industriale e zezë/e bardhë/ari, dark + light mode, PWA e instalueshme

**Ende jo e ndërtuar (Fazë 2 e propozuar):**
- Ngarkimi i fotografive (para/gjatë/pas) në Supabase Storage + navigimi Google Maps te ekrani i terrenit
- Push notifications (regjistrimi i subscription-it + dërgimi automatik sipas rregullave të afateve)
- Gjenerimi i PDF-ve (konfirmimi i porosisë, fleta e prodhimit, checklist-i i terrenit, etj.)
- Raportet dhe eksportimi CSV/Excel
- Paneli administrativ (menaxhimi i produkteve/sistemeve/çmimeve pa prekur kodin)
- Kalendari me drag-and-drop dhe paralajmërime konfliktesh
- Offline queue për regjistrimin e të dhënave në terren pa internet
- Katalogu i produkteve (faqe UI për shtim/redaktim), moduli i pagesave, komentet me @përmendje

## Instalimi

```bash
npm install
cp .env.example .env.local   # plotëso me URL dhe anon key nga Supabase
npm run dev
```

> **Shënim:** `npm run build`/`npm run dev` përdorin flamurin `--webpack` (jo Turbopack e
> paracaktuar e Next 16), sepse `next-pwa` ende nuk është plotësisht i pajtueshëm me Turbopack.

## Konfigurimi i Supabase

1. Krijo një projekt të ri në supabase.com.
2. Në **SQL Editor**, ekzekuto migrimet me radhë nga `supabase/migrations/`:
   `0001_schema.sql` → `0002_functions.sql` → `0003_rls.sql` → `0004_seed.sql`.
3. Në **Project Settings → API**, kopjo `Project URL` dhe `anon public key` në `.env.local`.
4. Krijo përdoruesin e parë nga **Authentication → Users → Add user**, pastaj në tabelën
   `profiles` (SQL Editor ose Table Editor) vendos `role = 'super_admin'` për atë përdorues —
   profili krijohet automatikisht me rolin `shitje` në regjistrim të parë, admini i parë duhet
   ngritur manualisht.
5. Krijo një Storage bucket të quajtur `attachments` (publik ose me politika sipas nevojës) para
   se të lidhësh ngarkimin e fotografive në Fazën 2.

## Deploy në Vercel

1. Shtyj repository-n në GitHub.
2. Importoje në vercel.com → zgjidh framework Next.js (auto-detektohet).
3. Shto `NEXT_PUBLIC_SUPABASE_URL` dhe `NEXT_PUBLIC_SUPABASE_ANON_KEY` te Environment Variables.
4. Deploy. PWA-ja instalohet automatikisht nga shfletuesi (Add to Home Screen) sapo faqja hapet
   në HTTPS.

## Struktura

```
app/(auth)/login          — faqja e kyçjes
app/(app)/...             — çdo faqe pas kyçjes (dashboard, customers, orders, requests, ...)
app/actions/               — Server Actions (mutacionet e databazës)
components/ui              — përbërës bazë (Button, Card)
components/layout          — TopBar, BottomNav, tema
components/orders|requests|production — përbërës specifikë për module
lib/supabase                — klientët browser/server/middleware
lib/types/database.ts       — tipet TypeScript + etiketat shqip
lib/calc/material.ts        — kalkulatori i materialit (i ripërdorshëm/i testueshëm)
supabase/migrations         — skema SQL, RLS, seed data
```

## Rolet

| Rol | Qasje |
|---|---|
| `super_admin` | Gjithçka |
| `menaxher` | Shikon/miraton gjithçka, financat sipas autorizimit |
| `shitje` | Klientë, porosi, kërkesa |
| `fabrike` | Vetëm ekrani i prodhimit |
| `terreni` | Vetëm projektet e caktuara |

RLS zbatohet në nivel databaze (jo vetëm UI) — çdo tabelë e ndjeshme ka politika sipas rolit
në `0003_rls.sql`.
