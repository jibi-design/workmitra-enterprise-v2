/** Job Mitra | TrustStrip.tsx | High-trust lock / RTW / stale / compliance strip */

import type { ReactNode } from "react";
import type { EnterpriseTone, EnterpriseTrustKind } from "./enterprise.types";
import { StatusBadge } from "./StatusBadge";

export type TrustStripProps = {
  kind: EnterpriseTrustKind;
  tone?: EnterpriseTone;
  title: ReactNode;
  message?: ReactNode;
  badgeLabel?: string;
  actions?: ReactNode;
  testId?: string;
};

function defaultTone(kind: EnterpriseTrustKind): EnterpriseTone {
  switch (kind) {
    case "rtw":
      return "warning";
    case "stale":
      return "warning";
    case "lock":
      return "pending";
    case "pulse":
      return "warning";
    case "compliance":
      return "critical";
    case "info":
    default:
      return "neutral";
  }
}

export function TrustStrip({
  kind,
  tone,
  title,
  message,
  badgeLabel,
  actions,
  testId,
}: TrustStripProps) {
  const resolved = tone ?? defaultTone(kind);
  return (
    <div
      className={`wm-ent-trust wm-ent-trust--${resolved}`}
      data-testid={testId ?? "wm-ent-trust"}
      data-kind={kind}
      role="status"
    >
      <StatusBadge label={badgeLabel ?? (typeof title === "string" ? title : "Trust")} tone={resolved} />
      <div className="wm-ent-trust__message">
        <strong>{title}</strong>
        {message ? <> — {message}</> : null}
      </div>
      {actions ? <div className="wm-ent-trust__actions">{actions}</div> : null}
    </div>
  );
}
