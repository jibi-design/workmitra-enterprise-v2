// src/features/employer/shiftJobs/components/ShiftCreateRequirementsSection.tsx

import { SectionHead, IconRequirements } from "./ShiftCreateIcons";

type Props = {
  mustHave: string;   onMustHave: (v: string) => void;   mustCount: number;
  goodToHave: string; onGoodToHave: (v: string) => void; goodCount: number;
  dressCode: string;  onDressCode: (v: string) => void;
};

export function ShiftCreateRequirementsSection(props: Props) {
  return (
    <section className="wm-er-card" style={{ marginTop: 12 }}>
      <SectionHead icon={<IconRequirements />} title="Requirements" sub="One item per line. Workers must answer these before applying." />

      <div className="wm-field">
        <div className="wm-label">Must-have (one per line)</div>
        <textarea className="wm-input" style={{ height: 100, paddingTop: 10, fontFamily: "inherit" }}
          value={props.mustHave} onChange={(e) => props.onMustHave(e.target.value)}
          placeholder="Enter requirements, one per line" maxLength={2000} />
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
          {props.mustCount} {props.mustCount === 1 ? "item" : "items"} (max 25)
        </div>
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Good-to-have (one per line)</div>
        <textarea className="wm-input" style={{ height: 80, paddingTop: 10, fontFamily: "inherit" }}
          value={props.goodToHave} onChange={(e) => props.onGoodToHave(e.target.value)}
          placeholder="Enter preferred skills, one per line" maxLength={2000} />
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
          {props.goodCount} {props.goodCount === 1 ? "item" : "items"} (max 25)
        </div>
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Dress Code <span style={{ fontWeight: 500, color: "var(--wm-er-muted)" }}>(optional)</span></div>
        <input className="wm-input" value={props.dressCode}
          onChange={(e) => props.onDressCode(e.target.value)}
          placeholder="e.g. Black trousers and white shirt, Safety boots required"
          maxLength={200} />
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>
          Workers will see this on the shift details page.
        </div>
      </div>
    </section>
  );
}