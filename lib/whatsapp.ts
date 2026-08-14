export function buildWhatsAppLink(phone: string | null | undefined, message: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/[^\d+]/g, "").replace(/^\+/, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
