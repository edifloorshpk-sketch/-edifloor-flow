export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      <h1 className="font-display text-2xl font-semibold">Jeni jashtë linje</h1>
      <p className="max-w-xs text-muted">
        Kjo faqe nuk është e disponueshme pa internet. Të dhënat e regjistruara në terren do të
        sinkronizohen automatikisht sapo të ktheheni online.
      </p>
    </div>
  );
}
