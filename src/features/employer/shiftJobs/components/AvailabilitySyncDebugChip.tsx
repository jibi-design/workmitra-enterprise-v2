/** Compact QA strip — only when wm_debug_availability_sync=1 */

import type { CSSProperties } from "react";
import { isAvailabilitySyncDebugEnabled } from "../../../shared/shift/availabilitySyncDebug";

type Props = {
  label: string;
  lines: string[];
};

const style: CSSProperties = {
  marginTop: 8,
  padding: "6px 8px",
  borderRadius: 8,
  border: "1px dashed rgba(234,179,8,0.55)",
  background: "rgba(234,179,8,0.08)",
  color: "#a16207",
  fontSize: 11,
  fontWeight: 650,
  lineHeight: 1.35,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
};

export function AvailabilitySyncDebugChip({ label, lines }: Props) {
  if (!isAvailabilitySyncDebugEnabled()) return null;

  return (
    <div
      data-testid="availability-sync-debug-chip"
      data-debug-label={label}
      style={style}
      role="status"
    >
      <div>[QA] {label}</div>
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}
