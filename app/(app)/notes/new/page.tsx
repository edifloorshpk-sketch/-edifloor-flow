import { createCallNote } from "@/app/actions/quick";
import { Button } from "@/components/ui/button";

export default function NewCallNotePage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Shënim nga telefonata</h1>
      <p className="text-sm text-muted">
        Regjistrim i shpejtë brenda 30–60 sekondave. Nëse klienti nuk gjendet ende në sistem, shënimi ruhet si detyrë që të mos harrohet.
      </p>
      <form action={createCallNote} className="space-y-4">
        <input type="hidden" name="customer_id" value="" />
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Emri i telefonuesit</span>
          <input name="caller_name" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Përmbledhja e telefonatës *</span>
          <textarea name="summary" required rows={4} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </label>
        <Button type="submit" className="w-full">Ruaj shënimin</Button>
      </form>
    </div>
  );
}
