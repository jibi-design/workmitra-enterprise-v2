import type { HRCandidateRecord } from "../types/hrManagement.types";
import type { ExitTrigger } from "../types/exitProcessing.types";
import { EXIT_TRIGGER_LABELS } from "../types/exitProcessing.types";
import { InfoRow } from "./exitClearanceHelpers";
import { fmtExitDate } from "./ExitClearanceSection.helpers";

type ExitInfoCardProps = {
  exitData: NonNullable<HRCandidateRecord["exitData"]>;
  nowMs: number;
};

export function ExitInfoCard({ exitData, nowMs }: ExitInfoCardProps) {
  const noticeDaysLeft = exitData.noticePeriod.waived
    ? 0
    : Math.max(0, Math.ceil((exitData.noticePeriod.endDate - nowMs) / 86400000));

  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid rgba(220,38,38,0.2)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14, color: "#dc2626", marginBottom: 10 }}>
        Exit Processing
      </div>

      <InfoRow
        label="Reason"
        value={EXIT_TRIGGER_LABELS[exitData.trigger as ExitTrigger] || exitData.trigger}
      />
      {exitData.triggerNote && <InfoRow label="Note" value={exitData.triggerNote} />}
      <InfoRow label="Initiated" value={fmtExitDate(exitData.initiatedAt)} />

      <div
        style={{
          marginTop: 12,
          padding: 10,
          borderRadius: 8,
          background: "var(--wm-er-bg, #f9fafb)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--wm-er-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            marginBottom: 4,
          }}
        >
          Notice Period
        </div>
        {exitData.noticePeriod.waived ? (
          <div style={{ fontSize: 12, fontWeight: 700, color: "#d97706" }}>
            Notice period waived
            {exitData.noticePeriod.waivedReason ? ` – ${exitData.noticePeriod.waivedReason}` : ""}
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>
              {exitData.noticePeriod.totalDays} days ({fmtExitDate(exitData.noticePeriod.startDate)}{" "}
              – {fmtExitDate(exitData.noticePeriod.endDate)})
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: noticeDaysLeft > 0 ? "#d97706" : "#16a34a",
                marginTop: 4,
              }}
            >
              {noticeDaysLeft > 0
                ? `${noticeDaysLeft} day${noticeDaysLeft !== 1 ? "s" : ""} remaining`
                : "✓ Notice period completed"}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type SettlementNoteProps = {
  settlementNote: string;
  onChange: (value: string) => void;
  onSave: () => void;
};

export function SettlementNotePanel({ settlementNote, onChange, onSave }: SettlementNoteProps) {
  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 8 }}>
        Final Settlement Note
      </div>
      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginBottom: 8, lineHeight: 1.5 }}>
        Record any settlement details. This is a text note for your records – no calculations are
        done here.
      </div>
      <textarea
        value={settlementNote}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. All pending dues cleared. Final payment processed on exit date."
        rows={3}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: 13,
          fontWeight: 600,
          border: "1px solid var(--wm-er-border, #e5e7eb)",
          borderRadius: 8,
          outline: "none",
          color: "var(--wm-er-text)",
          background: "#fff",
          boxSizing: "border-box",
          resize: "vertical",
          fontFamily: "inherit",
        }}
      />
      <button
        className="wm-outlineBtn"
        type="button"
        onClick={onSave}
        style={{ marginTop: 8, fontSize: 11, padding: "6px 14px" }}
      >
        Save Note
      </button>
    </div>
  );
}

export function ExperienceLetterPanel({ experienceLetterSent }: { experienceLetterSent: boolean }) {
  return (
    <div
      style={{
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: `1px solid ${experienceLetterSent ? "rgba(22,163,74,0.2)" : "var(--wm-er-border, #e5e7eb)"}`,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 8 }}>
        Experience Letter
      </div>
      {experienceLetterSent ? (
        <div style={{ fontSize: 12, fontWeight: 800, color: "#16a34a" }}>
          ✓ Experience letter has been sent
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          Generate the experience letter from the Letters section above. Once sent, it will be
          marked here automatically.
        </div>
      )}
    </div>
  );
}
