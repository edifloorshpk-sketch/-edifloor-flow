"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export function CopyMessageButton({ message, label }: { message: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently ignore, the WhatsApp link is the primary path
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="tap-target flex items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-medium hover:border-gold"
    >
      {copied ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
      {copied ? "U kopjua!" : label}
    </button>
  );
}
