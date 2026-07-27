// App name: Job Mitra
// File name: ShiftTimelineActions.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\statusTimeline\ShiftTimelineActions.tsx

import type { CSSProperties, ReactNode } from "react";

import { TEXT_DARK, getActionStyle } from "./shiftTimeline.styles";
import type { ShiftTimelineAction } from "./shiftTimeline.types";

export type ShiftTimelineActionsProps = {
  readonly actions: readonly ShiftTimelineAction[];
};

export function ShiftTimelineActions({ actions }: ShiftTimelineActionsProps) {
  return (
    <section
      style={{
        borderTop: "1px solid rgba(148, 163, 184, 0.18)",
        paddingTop: 12,
        display: "grid",
        gap: 9,
      }}
      aria-label="Next actions"
    >
      <div style={{ fontSize: 12, fontWeight: 950, color: TEXT_DARK }}>Next action</div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {actions.map((action) => (
          <TimelineActionButton key={action.id} action={action} />
        ))}
      </div>
    </section>
  );
}

function TimelineActionButton({ action }: { readonly action: ShiftTimelineAction }) {
  const disabled = action.disabled === true;

  const baseStyle: CSSProperties = {
    ...getActionStyle(action.variant, disabled),
    minHeight: 38,
    borderRadius: "var(--wm-radius-pill)",
    padding: "9px 13px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 950,
    textDecoration: "none",
    outline: "none",
  };

  const content: ReactNode = (
    <>
      <span>{action.label}</span>
      {action.external === true && <span aria-hidden="true">↗</span>}
    </>
  );

  if (action.href && !disabled) {
    return (
      <a
        href={action.href}
        target={action.external === true ? "_blank" : undefined}
        rel={action.external === true ? "noopener noreferrer" : undefined}
        aria-label={action.ariaLabel ?? action.label}
        title={action.helper}
        style={baseStyle}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={disabled}
      aria-label={action.ariaLabel ?? action.label}
      title={action.helper}
      style={baseStyle}
    >
      {content}
    </button>
  );
}
