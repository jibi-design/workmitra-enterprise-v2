import type { AdminModerationCase } from "../../../moderation/contentReport.api";

type Props = {
  readonly item: AdminModerationCase;
  readonly busy: boolean;
  readonly onAct: (action: "dismiss" | "hide" | "restore" | "remove") => void;
};

export function AdminModerationCaseCard({ item, busy, onAct }: Props) {
  const title = item.title?.trim() || "Posting";
  const company = item.companyName?.trim() || "Employer";
  return (
    <article className="wm-ad-glass" data-testid={`moderation-case-${item.caseId}`} style={{ padding: 14, marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, color: "var(--wm-ad-dim)" }}>
        {item.domain === "shift" ? "SHIFT" : "CAREER"} · {item.queueStatus.toUpperCase()}
      </div>
      <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4, color: "var(--wm-ad-text)" }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--wm-ad-navy-500)", marginTop: 2 }}>
        {company} · {item.openCount} reports · score {item.weightedScore}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
        <button type="button" className="wm-outlineBtn" disabled={busy} onClick={() => onAct("dismiss")}>
          Dismiss
        </button>
        <button type="button" className="wm-outlineBtn" disabled={busy} onClick={() => onAct("hide")}>
          Hide posting
        </button>
        <button type="button" className="wm-outlineBtn" disabled={busy} onClick={() => onAct("restore")}>
          Restore
        </button>
        <button type="button" className="wm-primarybtn" disabled={busy} onClick={() => onAct("remove")}>
          Remove posting
        </button>
      </div>
    </article>
  );
}
