/** PendingActionRow — single hub row with optional Pulse CTA. */

import { PulseNode } from "../../features/pulse/PulseNode";
import type { PendingActionItem } from "../pendingActions/pendingActions.types";

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

export function PendingActionRow({ item }: { readonly item: PendingActionItem }) {
  const accent = rowAccent(item.domain);

  const ctaButton = (
    <button
      type="button"
      className="wm-press-btn wm-pendingActionsHub__cta"
      onClick={item.onAction}
      style={{ borderColor: `${accent}33`, background: `${accent}0F`, color: accent }}
    >
      {item.ctaLabel}
    </button>
  );

  return (
    <li className="wm-pendingActionsHub__row" data-testid={`pending-action-row-${item.id}`}>
      <div className="wm-pendingActionsHub__rowCopy">
        <div className="wm-pendingActionsHub__rowTitle">
          <span className="wm-pendingActionsHub__label" style={{ color: accent }}>
            {item.label}
          </span>
          <span
            className="wm-pendingActionsHub__count"
            style={{
              background: `${accent}14`,
              borderColor: `${accent}33`,
              color: accent,
            }}
          >
            {item.count}
          </span>
        </div>
        <div className="wm-pendingActionsHub__detail">{item.detail}</div>
      </div>

      <div className="wm-pendingActionsHub__actions">
        {item.dualActions ? (
          <div className="wm-pendingActionsHub__dual">
            <button
              type="button"
              className="wm-press-btn wm-pendingActionsHub__cta wm-pendingActionsHub__cta--muted"
              data-testid={`pending-action-decline-${item.id}`}
              onClick={item.dualActions.onDecline}
            >
              {item.dualActions.declineLabel}
            </button>
            {item.dualActions.onLater ? (
              <button
                type="button"
                className="wm-press-btn wm-pendingActionsHub__cta wm-pendingActionsHub__cta--muted"
                data-testid={`pending-action-later-${item.id}`}
                onClick={item.dualActions.onLater}
              >
                {item.dualActions.laterLabel ?? "Later"}
              </button>
            ) : null}
            <PulseNode variant="button" isGuiding style={{ "--wm-pulse-node-radius": "10px" }}>
              <button
                type="button"
                className="wm-press-btn wm-pendingActionsHub__cta"
                data-testid={`pending-action-accept-${item.id}`}
                onClick={item.dualActions.onAccept}
                style={{ borderColor: `${accent}44`, background: `${accent}12`, color: accent }}
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
