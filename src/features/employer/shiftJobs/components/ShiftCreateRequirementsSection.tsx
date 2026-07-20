// src/features/employer/shiftJobs/components/ShiftCreateRequirementsSection.tsx

import type { CSSProperties } from "react";
import { SectionHead, IconRequirements } from "./ShiftCreateIcons";

type Props = {
  mustHave: string;
  onMustHave: (v: string) => void;
  mustCount: number;
  goodToHave: string;
  onGoodToHave: (v: string) => void;
  goodCount: number;
  dressCode: string;
  onDressCode: (v: string) => void;
};

const CARD_STYLE: CSSProperties = {
  marginTop: 12,
  borderRadius: 20,
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
  boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
};

const TEXTAREA_STYLE: CSSProperties = {
  height: 100,
  paddingTop: 10,
  fontFamily: "inherit",
  lineHeight: 1.45,
};

const SMALL_TEXT_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  color: "var(--wm-er-muted)",
  lineHeight: 1.45,
};

export function ShiftCreateRequirementsSection(props: Props) {
  return (
    <section className="wm-er-card" style={CARD_STYLE}>
      <SectionHead
        icon={<IconRequirements />}
        title="Requirements"
        sub="One item per line. Workers must answer these before applying."
      />

      <div className="wm-field">
        <div className="wm-label">Must-have (one per line)</div>
        <textarea
          className="wm-input"
          style={TEXTAREA_STYLE}
          value={props.mustHave}
          onChange={(e) => props.onMustHave(e.target.value)}
          placeholder="Enter requirements, one per line"
          maxLength={2000}
        />
        <div style={SMALL_TEXT_STYLE}>
          {props.mustCount} {props.mustCount === 1 ? "item" : "items"} added. Maximum 25.
        </div>
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Good-to-have (one per line)</div>
        <textarea
          className="wm-input"
          style={{ ...TEXTAREA_STYLE, height: 86 }}
          value={props.goodToHave}
          onChange={(e) => props.onGoodToHave(e.target.value)}
          placeholder="Enter preferred skills, one per line"
          maxLength={2000}
        />
        <div style={SMALL_TEXT_STYLE}>
          {props.goodCount} {props.goodCount === 1 ? "item" : "items"} added. Maximum 25.
        </div>
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">
          Dress Code{" "}
          <span style={{ fontWeight: 500, color: "var(--wm-er-muted)" }}>(optional)</span>
        </div>
        <input
          className="wm-input"
          value={props.dressCode}
          onChange={(e) => props.onDressCode(e.target.value)}
          placeholder="e.g. Black trousers and white shirt, safety boots required"
          maxLength={200}
        />
        <div style={SMALL_TEXT_STYLE}>Workers will see this on the shift details page.</div>
      </div>
    </section>
  );
}
