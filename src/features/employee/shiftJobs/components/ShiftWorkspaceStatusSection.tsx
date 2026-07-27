// App name: Job Mitra | ShiftWorkspaceStatusSection.tsx — surface-glass (Wave C)

import {
  buildStatusExplanation,
  explanationBgColor,
  explanationBorderColor,
} from "../helpers/shiftWorkspaceDisplayHelpers";
import type { ShiftWorkspace } from "../types/shiftWorkspace.types";

export function ShiftWorkspaceStatusSection({
  workspace,
  readOnly,
}: {
  workspace: ShiftWorkspace;
  readOnly: boolean;
}) {
  const explain = buildStatusExplanation(workspace);

  if (!explain) {
    return null;
  }

  return (
    <section
      className="wm-shift-surface-glass wm-animateIn"
      data-testid="shift-workspace-status"
      style={{
        animationDelay: "60ms",
        padding: "14px 16px",
        borderColor: explanationBorderColor(explain.tone),
        background: explanationBgColor(explain.tone),
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-emp-text)" }}>
        {explain.title}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 12,
          color: "var(--wm-emp-muted)",
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        {explain.body}
      </div>

      {readOnly ? (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            fontWeight: 700,
            color: "var(--wm-emp-muted)",
            opacity: 0.85,
          }}
        >
          Read-only: actions are disabled for this work group.
        </div>
      ) : null}
    </section>
  );
}
