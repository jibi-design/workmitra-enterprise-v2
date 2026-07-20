// App: Job Mitra / WorkMitra_Enterprise_v2
// File: AnnouncePreviewSubmitSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\AnnouncePreviewSubmitSection.tsx

import type { AnnounceFormData } from "../types/announceForm.types";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  form: AnnounceFormData;
  errors: string[];
  isSubmitting: boolean;
  onSubmit: () => void;
  sectionStyle: React.CSSProperties;
  sectionLabelStyle: React.CSSProperties;
};

export function AnnouncePreviewSubmitSection({
  form,
  errors,
  isSubmitting,
  onSubmit,
  sectionStyle,
  sectionLabelStyle,
}: Props) {
  return (
    <>
      <div style={sectionStyle}>
        <div style={sectionLabelStyle}>Settings</div>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-er-text)" }}>
          Auto-replace from waiting list: <strong>{form.autoReplace ? "ON" : "OFF"}</strong>
        </div>
      </div>

      {errors.length > 0 && (
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
          {errors.map((error, index) => (
            <div key={index} style={{ fontSize: 12, color: "var(--wm-error)" }}>
              {error}
            </div>
          ))}
        </div>
      )}

      <button
        className="wm-primarybtn"
        type="button"
        onClick={onSubmit}
        disabled={isSubmitting}
        style={{
          width: "100%",
          background: AMBER,
          fontSize: 15,
          fontWeight: 900,
          padding: "14px",
        }}
      >
        {isSubmitting ? "Sending..." : "Send Announcement"}
      </button>

      <div
        style={{ fontSize: 11, color: "var(--wm-er-muted)", textAlign: "center", lineHeight: 1.4 }}
      >
        Your staff in the selected categories will be notified immediately. They can mark their
        availability for each shift.
      </div>
    </>
  );
}
