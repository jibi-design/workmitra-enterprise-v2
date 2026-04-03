// src/features/employer/workforceOps/components/AnnounceStepDetails.tsx
//
// Step 4: Announcement details — title, work date, time, location, description, auto-replace.

import { useState } from "react";
import { validateAnnouncementStep3 } from "../helpers/workforceValidation";
import { AMBER } from "./workforceStyles";

/* ─────────────────────────────────────────────────────────────────────────── */
/* Props                                                                      */
/* ─────────────────────────────────────────────────────────────────────────── */

type Props = {
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  autoReplace: boolean;
  onChange: (patch: Partial<{
    title: string;
    date: string;
    time: string;
    location: string;
    description: string;
    autoReplace: boolean;
  }>) => void;
  onNext: () => void;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* Styles                                                                     */
/* ─────────────────────────────────────────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-text)",
  marginBottom: 4,
  display: "block",
};

const toggleRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 0",
};

const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
  width: 44,
  height: 24,
  borderRadius: 12,
  border: "none",
  background: active ? AMBER : "var(--wm-er-border)",
  cursor: "pointer",
  position: "relative",
  transition: "background 0.2s",
  flexShrink: 0,
});

const toggleKnobStyle = (active: boolean): React.CSSProperties => ({
  width: 20,
  height: 20,
  borderRadius: 10,
  background: "#fff",
  position: "absolute",
  top: 2,
  left: active ? 22 : 2,
  transition: "left 0.2s",
  boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
});

/* ─────────────────────────────────────────────────────────────────────────── */
/* Component                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

export function AnnounceStepDetails({ title, date, time, location, description, autoReplace, onChange, onNext }: Props) {
  const [errors, setErrors] = useState<string[]>([]);

  function handleNext() {
    const result = validateAnnouncementStep3(title, date);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    onNext();
  }

  const canProceed = title.trim().length > 0 && date.length > 0;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="wm-er-card">
        <div style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 12 }}>
          Announcement Details
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Title <span style={{ color: "var(--wm-error)" }}>*</span></label>
            <input
              type="text"
              className="wm-input"
              placeholder="e.g. Weekend Staff Required, Site Work - Block A"
              value={title}
              onChange={(e) => { onChange({ title: e.target.value }); setErrors([]); }}
              style={{ width: "100%", fontSize: 13 }}
              maxLength={100}
            />
          </div>

          {/* Date + Time */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Work Date <span style={{ color: "var(--wm-error)" }}>*</span></label>
              <input
                type="date"
                className="wm-input"
                value={date}
                onChange={(e) => { onChange({ date: e.target.value }); setErrors([]); }}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>
            <div>
              <label style={labelStyle}>Reporting Time</label>
              <input
                type="time"
                className="wm-input"
                value={time}
                onChange={(e) => onChange({ time: e.target.value })}
                style={{ width: "100%", fontSize: 13 }}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={labelStyle}>Location</label>
            <input
              type="text"
              className="wm-input"
              placeholder="e.g. Main Office, Site B, Warehouse 3"
              value={location}
              onChange={(e) => onChange({ location: e.target.value })}
              style={{ width: "100%", fontSize: 13 }}
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              className="wm-input"
              placeholder="Any additional details or instructions for staff..."
              value={description}
              onChange={(e) => onChange({ description: e.target.value })}
              rows={3}
              style={{ width: "100%", fontSize: 13, resize: "vertical" }}
              maxLength={500}
            />
          </div>
        </div>
      </div>

      {/* Auto-Replace Toggle */}
      <div className="wm-er-card">
        <div style={toggleRowStyle}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--wm-er-text)" }}>
              Auto-Replace from Waiting List
            </div>
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2, maxWidth: 260 }}>
              If someone cancels, automatically move the next person from the waiting list.
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ autoReplace: !autoReplace })}
            style={toggleBtnStyle(autoReplace)}
          >
            <div style={toggleKnobStyle(autoReplace)} />
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(220,38,38,0.06)" }}>
          {errors.map((e, i) => (
            <div key={i} style={{ fontSize: 12, color: "var(--wm-error)" }}>{e}</div>
          ))}
        </div>
      )}

      {/* Next */}
      <button
        className="wm-primarybtn"
        type="button"
        onClick={handleNext}
        disabled={!canProceed}
        style={{
          width: "100%",
          background: canProceed ? AMBER : "var(--wm-er-muted)",
          fontSize: 14,
          padding: "12px",
        }}
      >
        Next — Preview & Send
      </button>
    </div>
  );
}