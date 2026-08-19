"use client";

import { useEffect, useRef } from "react";

export function AutoNotifyWhatsApp({ link, shouldTrigger }: { link: string | null; shouldTrigger: boolean }) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!shouldTrigger || !link || firedRef.current) return;
    firedRef.current = true;
    window.location.href = link;
  }, [link, shouldTrigger]);

  if (!shouldTrigger || !link) return null;

  return (
    <div className="rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-center text-sm text-gold">
      Duke ju çuar te WhatsApp — Fabrika…
    </div>
  );
}
