/** Job Mitra | StatusBadge.tsx | Ultra-Enterprise semantic status pill */

import type { EnterpriseDomainAccent, EnterpriseTone } from "./enterprise.types";

export type StatusBadgeProps = {
  label: string;
  tone?: EnterpriseTone;
  accent?: EnterpriseDomainAccent;
  className?: string;
  testId?: string;
};

export function StatusBadge({
  label,
  tone = "neutral",
  accent,
  className,
  testId,
}: StatusBadgeProps) {
  const classes = [
    "wm-ent-badge",
    `wm-ent-badge--${tone}`,
    accent ? `wm-ent-badge--accent-${accent}` : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes} data-testid={testId ?? "wm-ent-badge"} data-tone={tone}>
      {label}
    </span>
  );
}
