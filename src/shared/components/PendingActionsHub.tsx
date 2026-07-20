// App name: Job Mitra
// File name: PendingActionsHub.tsx
//
// ONE hub card — all manual pending actions render as rows inside.
// Always visible; accent + pulse when any row is active.

import { PulseNode } from "../../features/pulse/PulseNode";
import type { PendingActionItem } from "../pendingActions/pendingActions.types";

export type { PendingActionItem as PendingAction };

type PendingActionsHubProps = {
  items: PendingActionItem[];
  emptyTitle?: string;
  emptyBody?: string;
};

const DOMAIN_ROW_ACCENT = {
  shift: "#059669",
  career: "#1d4ed8",
} as const;

function rowAccent(domain: string): string {
  if (domain in DOMAIN_ROW_ACCENT) {
    return DOMAIN_ROW_ACCENT[domain as keyof typeof DOMAIN_ROW_ACCENT];
  }
  return "#64748b";
}

export function PendingActionsHub({
  items,
  emptyTitle = "Pending Actions",
  emptyBody = "Manual approvals, reviews, and selections will appear here when action is needed.",
}: PendingActionsHubProps) {
  const activeItems = items.filter((item) => item.count > 0);
  const totalCount = activeItems.reduce((sum, item) => sum + item.count, 0);
  const isActive = totalCount > 0;

  return (
    <section
      className={`wm-pendingActionsHub wm-animateIn ${isActive ? "isActive" : "isIdle"}`}
      data-testid="pending-actions-hub"
      data-pending-active={isActive ? "true" : "false"}
    >
      <div className="wm-pendingActionsHub__head">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="wm-pendingActionsHub__title">
              {isActive ? "Pending Actions" : emptyTitle}
            </div>
            <div className="wm-pendingActionsHub__sub">
              {isActive
                ? `${totalCount} manual action${totalCount !== 1 ? "s" : ""} need your attention.`
                : emptyBody}
            </div>
          </div>

          <span
            className="wm-pendingActionsHub__badge"
            aria-label={isActive ? `${totalCount} pending actions` : "No pending actions"}
          >
            {isActive ? totalCount : "✓"}
          </span>
        </div>
      </div>

      {activeItems.length > 0 ? (
        <ul className="wm-pendingActionsHub__rows">
          {activeItems.map((item) => (
            <PendingActionRow key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div
          style={{
            margin: "0 12px 12px",
            padding: 16,
            borderRadius: 12,
            background: "rgba(248, 250, 252, 0.92)",
            border: "1px solid rgba(226, 232, 240, 0.6)",
            boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.04)",
            fontSize: 14,
            fontWeight: 500,
            color: "#64748b",
            lineHeight: 1.55,
          }}
        >
          All caught up. Shift reviews, offer approvals, interview steps, and other manual tasks
          will list inside this card.
        </div>
      )}
    </section>
  );
}

function PendingActionRow({ item }: { readonly item: PendingActionItem }) {
  const accent = rowAccent(item.domain);

  const ctaButton = (
    <button
      type="button"
      className="wm-press-btn"
      onClick={item.onAction}
      style={{
        padding: "7px 12px",
        borderRadius: 10,
        border: `1px solid ${accent}33`,
        background: `${accent}0F`,
        color: accent,
        fontSize: 11.5,
        fontWeight: 900,
        cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {item.ctaLabel}
    </button>
  );

  return (
    <li className="wm-pendingActionsHub__row" data-testid={`pending-action-row-${item.id}`}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12.5, fontWeight: 900, color: accent, lineHeight: 1.3 }}>
            {item.label}
          </span>
          <span
            style={{
              minWidth: 22,
              height: 22,
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${accent}14`,
              border: `1px solid ${accent}33`,
              color: accent,
              fontSize: 10,
              fontWeight: 950,
            }}
          >
            {item.count}
          </span>
          <span
            style={{
              fontSize: 9.5,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.4,
              color: "#94a3b8",
            }}
          >
            {item.domain}
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#64748b",
            fontWeight: 650,
            marginTop: 4,
            lineHeight: 1.4,
          }}
        >
          {item.detail}
        </div>
      </div>

      <div style={{ flexShrink: 0, alignSelf: "center" }}>
        {item.dualActions ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="wm-press-btn"
              data-testid={`pending-action-decline-${item.id}`}
              onClick={item.dualActions.onDecline}
              style={{
                padding: "7px 12px",
                borderRadius: 10,
                border: "1px solid rgba(148,163,184,0.35)",
                background: "rgba(248,250,252,0.95)",
                color: "#475569",
                fontSize: 11.5,
                fontWeight: 800,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {item.dualActions.declineLabel}
            </button>

            {item.dualActions.onLater ? (
              <button
                type="button"
                className="wm-press-btn"
                data-testid={`pending-action-later-${item.id}`}
                onClick={item.dualActions.onLater}
                style={{
                  padding: "7px 12px",
                  borderRadius: 10,
                  border: "1px solid rgba(148,163,184,0.35)",
                  background: "rgba(248,250,252,0.95)",
                  color: "#64748b",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {item.dualActions.laterLabel ?? "Later"}
              </button>
            ) : null}

            <PulseNode variant="button" isGuiding style={{ "--wm-pulse-node-radius": "10px" }}>
              <button
                type="button"
                className="wm-press-btn"
                data-testid={`pending-action-accept-${item.id}`}
                onClick={item.dualActions.onAccept}
                style={{
                  padding: "7px 12px",
                  borderRadius: 10,
                  border: `1px solid ${accent}44`,
                  background: `${accent}12`,
                  color: accent,
                  fontSize: 11.5,
                  fontWeight: 900,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {item.dualActions.acceptLabel}
              </button>
            </PulseNode>
          </div>
        ) : item.pulseId ? (
          <PulseNode
            variant="button"
            pulseId={item.pulseId}
            style={{ "--wm-pulse-node-radius": "10px" }}
          >
            {ctaButton}
          </PulseNode>
        ) : (
          ctaButton
        )}
      </div>
    </li>
  );
}
