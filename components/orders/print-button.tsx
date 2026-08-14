"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="mb-4 flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-medium text-gold-foreground print:hidden"
    >
      <Printer className="h-4 w-4" /> Printo / Ruaj si PDF
    </button>
  );
}
