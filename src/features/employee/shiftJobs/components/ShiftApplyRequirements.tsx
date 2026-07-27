// App name: Job Mitra | ShiftApplyRequirements.tsx — glass + seg-tabs (post-details polish)

import type { AnswerState } from "../helpers/shiftApplyHelpers";

function AnswerPill(props: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      className={`wm-shift-seg-tab ${props.active ? "isActive" : ""}`}
      type="button"
      onClick={props.onClick}
      aria-pressed={props.active}
    >
      {props.label}
    </button>
  );
}

type Props = {
  mustHave: string[];
  goodToHave: string[];
  mustAns: Record<string, AnswerState>;
  goodAns: Record<string, AnswerState>;
  notes: Record<string, string>;
  mustGateOk: boolean;
  mustMetCount: number;
  mustTotal: number;
  onAnswer: (kind: "must" | "good", item: string, value: AnswerState) => void;
  onNote: (item: string, value: string) => void;
};

export function ShiftApplyRequirements(props: Props) {
  const {
    mustHave,
    goodToHave,
    mustAns,
    goodAns,
    notes,
    mustGateOk,
    mustMetCount,
    mustTotal,
    onAnswer,
    onNote,
  } = props;

  return (
    <>
      <section
        className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn"
        data-testid="shift-apply-must-have"
        style={{ padding: 16, animationDelay: "120ms" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
            Minimum requirements
          </div>
          <div style={{ fontSize: 12, fontWeight: 900, color: "var(--wm-er-muted)" }}>
            {mustTotal === 0 ? "No minimum requirements" : `${mustMetCount}/${mustTotal} completed`}
          </div>
        </div>

        {mustTotal === 0 ? (
          <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>
            No specific requirements set by employer. You can submit directly.
          </div>
        ) : (
          <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
            {mustHave.map((item) => (
              <div
                key={item}
                style={{ borderTop: "1px solid var(--wm-er-divider)", paddingTop: 10 }}
              >
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--wm-er-text)" }}>
                  {item}
                </div>
                <div className="wm-shift-seg-tab-row" style={{ marginTop: 8 }}>
                  <AnswerPill
                    label="Meets"
                    active={mustAns[item] === "meets"}
                    onClick={() => onAnswer("must", item, "meets")}
                  />
                  <AnswerPill
                    label="Not sure"
                    active={mustAns[item] === "not_sure"}
                    onClick={() => onAnswer("must", item, "not_sure")}
                  />
                  <AnswerPill
                    label="Don't meet"
                    active={mustAns[item] === "dont_meet"}
                    onClick={() => onAnswer("must", item, "dont_meet")}
                  />
                </div>
                <div className="wm-field">
                  <div className="wm-label">Note (optional)</div>
                  <input
                    className="wm-input"
                    value={notes[item] ?? ""}
                    onChange={(e) => onNote(item, e.target.value)}
                    placeholder="Add a note"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {!mustGateOk ? (
          <div
            role="alert"
            style={{ marginTop: 10, fontSize: 12, color: "var(--wm-error)", fontWeight: 800 }}
          >
            Complete all minimum requirements (set all to &quot;Meets&quot;) to submit.
          </div>
        ) : null}
      </section>

      <section
        className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn"
        data-testid="shift-apply-good-to-have"
        style={{ padding: 16, animationDelay: "140ms" }}
      >
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>
          Good to have
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>
          Optional. Helps your shortlist score.
        </div>

        {goodToHave.length === 0 ? (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-er-muted)" }}>
            No optional items set by employer.
          </div>
        ) : (
          <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
            {goodToHave.map((item) => (
              <div
                key={item}
                style={{ borderTop: "1px solid var(--wm-er-divider)", paddingTop: 10 }}
              >
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--wm-er-text)" }}>
                  {item}
                </div>
                <div className="wm-shift-seg-tab-row" style={{ marginTop: 8 }}>
                  <AnswerPill
                    label="Meets"
                    active={goodAns[item] === "meets"}
                    onClick={() => onAnswer("good", item, "meets")}
                  />
                  <AnswerPill
                    label="Not sure"
                    active={goodAns[item] === "not_sure"}
                    onClick={() => onAnswer("good", item, "not_sure")}
                  />
                  <AnswerPill
                    label="Don't meet"
                    active={goodAns[item] === "dont_meet"}
                    onClick={() => onAnswer("good", item, "dont_meet")}
                  />
                </div>
                <div className="wm-field">
                  <div className="wm-label">Note (optional)</div>
                  <input
                    className="wm-input"
                    value={notes[item] ?? ""}
                    onChange={(e) => onNote(item, e.target.value)}
                    placeholder="Add a note"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
