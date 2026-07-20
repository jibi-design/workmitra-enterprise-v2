// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShiftCreateLocationSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftCreateLocationSection.tsx

import type { CSSProperties } from "react";
import { SectionHead, IconLocation } from "./ShiftCreateIcons";

type Props = {
  locationName: string;
  onLocationName: (v: string) => void;
  locationAutoFilled: boolean;
  locationAddress: string;
  onLocationAddress: (v: string) => void;
  mapsLink: string;
  onMapsLink: (v: string) => void;
};

const CARD_STYLE: CSSProperties = {
  marginTop: 12,
  borderRadius: 20,
  border: "1px solid rgba(226,232,240,0.95)",
  background: "linear-gradient(180deg, rgba(255,255,255,1), rgba(248,250,252,0.97))",
  boxShadow: "0 10px 24px rgba(15,23,42,0.045)",
};

const HINT_STYLE: CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  color: "var(--wm-er-muted)",
  lineHeight: 1.45,
};

const INFO_BOX_STYLE: CSSProperties = {
  marginTop: 10,
  padding: "10px 12px",
  borderRadius: 14,
  background: "rgba(22,163,74,0.06)",
  border: "1px solid rgba(22,163,74,0.16)",
  fontSize: 11,
  color: "var(--wm-er-muted)",
  lineHeight: 1.5,
};

export function ShiftCreateLocationSection(props: Props) {
  return (
    <section className="wm-er-card" style={CARD_STYLE}>
      <SectionHead
        icon={<IconLocation />}
        title="Work Location"
        sub="Tell workers where they should report"
      />

      <div className="wm-field">
        <div className="wm-label">
          City / Area <span style={{ color: "var(--wm-error)" }}>*</span>
        </div>
        <input
          className="wm-input"
          value={props.locationName}
          onChange={(e) => props.onLocationName(e.target.value)}
          placeholder="Enter city or area"
          maxLength={100}
        />
        {props.locationAutoFilled && <div style={HINT_STYLE}>From your company profile.</div>}
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Full Address (optional)</div>
        <textarea
          className="wm-input"
          style={{ height: 72, paddingTop: 10, fontFamily: "inherit", lineHeight: 1.45 }}
          value={props.locationAddress}
          onChange={(e) => props.onLocationAddress(e.target.value)}
          placeholder="Building name, street, entrance note, landmark..."
          maxLength={300}
        />
      </div>

      <div className="wm-field" style={{ marginTop: 12 }}>
        <div className="wm-label">Map Link (optional)</div>
        <input
          className="wm-input"
          value={props.mapsLink}
          onChange={(e) => props.onMapsLink(e.target.value)}
          placeholder="Paste map/location link here"
          maxLength={500}
        />
      </div>

      <div style={INFO_BOX_STYLE}>
        Keep location details clear. Workers use this information to plan travel and arrive at the
        correct reporting point.
      </div>
    </section>
  );
}
