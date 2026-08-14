/** ActionPill — Wave 1 Design DNA compact press CTA (touch-first) */

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ActionPillDomain = "shift" | "career" | "diary" | "planner" | "vault" | "neutral";

export type ActionPillProps = {
  readonly children: ReactNode;
  readonly domain?: ActionPillDomain;
  /** Skip pill chrome — only press + active DNA (for wm-erCreateCta etc.). */
  readonly bare?: boolean;
  readonly active?: boolean;
  readonly className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">;

export function ActionPill({
  children,
  domain = "neutral",
  bare = false,
  active = false,
  className,
  type = "button",
  ...rest
}: ActionPillProps) {
  const classes = [
    "wm-press-btn",
    bare ? "" : "wm-actionPill",
    bare ? "" : `wm-actionPill--${domain}`,
    active ? "is-active" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} aria-pressed={active || undefined} {...rest}>
      {children}
    </button>
  );
}
