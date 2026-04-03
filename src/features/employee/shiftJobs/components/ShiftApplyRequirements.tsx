// src/features/employee/shiftJobs/components/ShiftApplyRequirements.tsx

import type { CSSProperties } from "react";
import type { AnswerState } from "../helpers/shiftApplyHelpers";

/* ------------------------------------------------ */
/* AnswerPill                                       */
/* ------------------------------------------------ */
function AnswerPill(props: { label: string; active: boolean; onClick: () => void; tone?: "ok" | "warn" | "no" }) {
  const style: CSSProperties = {};
  if (props.active && props.tone === "ok") { style.background = "#16a34a"; style.color = "#fff"; style.borderColor = "#16a34a"; style.fontWeight = 900; }
  else if (props.active && props.tone === "warn") { style.background = "#d97706"; style.color = "#fff"; style.borderColor = "#d97706"; style.fontWeight = 900; }
  else if (props.active && props.tone === "no") { style.background = "#dc2626"; style.color = "#fff"; style.borderColor = "#dc2626"; style.fontWeight = 900; }
  return (<button className="wm-chipBtn" style={style} type="button" onClick={props.onClick}>{props.label}</button>);
}

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
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

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function ShiftApplyRequirements(props: Props) {
  const { mustHave, goodToHave, mustAns, goodAns, notes, mustGateOk, mustMetCount, mustTotal, onAnswer, onNote } = props;

  return (
    <>
      {/* Must-have */}
      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>Minimum requirements</div>
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
              <div key={item} style={{ borderTop: "1px solid var(--wm-er-divider)", paddingTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--wm-er-text)" }}>{item}</div>
                <div className="wm-chipRow" style={{ marginTop: 8 }}>
                  <AnswerPill label="Meets" tone="ok" active={mustAns[item] === "meets"} onClick={() => onAnswer("must", item, "meets")} />
                  <AnswerPill label="Not sure" tone="warn" active={mustAns[item] === "not_sure"} onClick={() => onAnswer("must", item, "not_sure")} />
                  <AnswerPill label="Don't meet" tone="no" active={mustAns[item] === "dont_meet"} onClick={() => onAnswer("must", item, "dont_meet")} />
                </div>
                <div className="wm-field">
                  <div className="wm-label">Note (optional)</div>
                  <input className="wm-input" value={notes[item] ?? ""} onChange={(e) => onNote(item, e.target.value)} placeholder="Add a note" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!mustGateOk && (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-error)", fontWeight: 800 }}>
            Complete all minimum requirements (set all to "Meets") to submit.
          </div>
        )}
      </section>

      {/* Good-to-have */}
      <section className="wm-ee-card" style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)" }}>Good to have</div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)" }}>Optional. Helps your shortlist score.</div>

        {goodToHave.length === 0 ? (
          <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-er-muted)" }}>No optional items set by employer.</div>
        ) : (
          <div style={{ marginTop: 10, display: "grid", gap: 12 }}>
            {goodToHave.map((item) => (
              <div key={item} style={{ borderTop: "1px solid var(--wm-er-divider)", paddingTop: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: "var(--wm-er-text)" }}>{item}</div>
                <div className="wm-chipRow" style={{ marginTop: 8 }}>
                  <AnswerPill label="Meets" tone="ok" active={goodAns[item] === "meets"} onClick={() => onAnswer("good", item, "meets")} />
                  <AnswerPill label="Not sure" tone="warn" active={goodAns[item] === "not_sure"} onClick={() => onAnswer("good", item, "not_sure")} />
                  <AnswerPill label="Don't meet" tone="no" active={goodAns[item] === "dont_meet"} onClick={() => onAnswer("good", item, "dont_meet")} />
                </div>
                <div className="wm-field">
                  <div className="wm-label">Note (optional)</div>
                  <input className="wm-input" value={notes[item] ?? ""} onChange={(e) => onNote(item, e.target.value)} placeholder="Add a note" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}