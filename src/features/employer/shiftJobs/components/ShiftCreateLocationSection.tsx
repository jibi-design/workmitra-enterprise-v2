// src/features/employer/shiftJobs/components/ShiftCreateLocationSection.tsx

import { SectionHead, IconLocation } from "./ShiftCreateIcons";

type Props = {
  locationName: string; onLocationName: (v: string) => void; locationAutoFilled: boolean;
  locationAddress: string; onLocationAddress: (v: string) => void;
  mapsLink: string; onMapsLink: (v: string) => void;
};

const HINT_STYLE: React.CSSProperties = { marginTop: 3, fontSize: 11, color: "var(--wm-er-muted)", fontStyle: "italic" };

export function ShiftCreateLocationSection(props: Props) {
  return (
    <section className="wm-er-card" style={{ marginTop: 12 }}>
      <SectionHead icon={<IconLocation />} title="Work Location" sub="Where will the workers report" />

      <div className="wm-field">
        <div className="wm-label">City / Area <span style={{ color: "var(--wm-error)" }}>*</span></div>
        <input className="wm-input" value={props.locationName} onChange={(e) => props.onLocationName(e.target.value)} placeholder="Enter city or area" maxLength={100} />
        {props.locationAutoFilled && <div style={HINT_STYLE}>From your company profile</div>}
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Full Address (optional)</div>
        <textarea className="wm-input" style={{ height: 60, paddingTop: 10, fontFamily: "inherit" }} value={props.locationAddress} onChange={(e) => props.onLocationAddress(e.target.value)} placeholder="Building name, street, landmark..." maxLength={300} />
      </div>

      <div className="wm-field" style={{ marginTop: 10 }}>
        <div className="wm-label">Google Maps Link (optional)</div>
        <input className="wm-input" value={props.mapsLink} onChange={(e) => props.onMapsLink(e.target.value)} placeholder="Paste Google Maps link here" maxLength={500} />
        <div style={{ marginTop: 4, fontSize: 11, color: "var(--wm-er-muted)" }}>Workers can tap this link to navigate to the location.</div>
      </div>
    </section>
  );
}