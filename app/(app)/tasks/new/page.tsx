import { createTask } from "@/app/actions/quick";
import { Button } from "@/components/ui/button";

export default function NewTaskPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-semibold">Detyrë e re</h1>
      <form action={createTask} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Titulli *</span>
          <input name="title" required className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Përshkrimi</span>
          <textarea name="description" rows={3} className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm outline-none focus:border-gold" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm text-muted">Afati</span>
          <input name="due_date" type="date" className="tap-target w-full rounded-xl border border-border bg-surface px-4 text-sm outline-none focus:border-gold" />
        </label>
        <Button type="submit" className="w-full">Ruaj detyrën</Button>
      </form>
    </div>
  );
}
