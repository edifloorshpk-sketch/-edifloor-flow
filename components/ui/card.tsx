import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

const urgencyColors = {
  green: "border-l-ok",
  yellow: "border-l-warn",
  red: "border-l-danger",
  gray: "border-l-archived",
} as const;

export function UrgencyCard({
  urgency,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { urgency: keyof typeof urgencyColors }) {
  return (
    <Card
      className={cn("border-l-4", urgencyColors[urgency], className)}
      {...props}
    />
  );
}
