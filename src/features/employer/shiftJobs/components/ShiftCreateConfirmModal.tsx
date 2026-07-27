// App: Job Mitra / WorkMitra_Enterprise_v2
// File: ShiftCreateConfirmModal.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\ShiftCreateConfirmModal.tsx

import type { CSSProperties } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { ShiftDuplicateWarning, ShiftPayBasisDraft } from "../helpers/shiftCreateHelpers";
import { formatShiftPayDisplay } from "../helpers/shiftCreateHelpers";

type Props = {
  open: boolean;
  jobName: string;
  companyName: string;
  workers: number;
  payPerDay: number;
  payBasis: ShiftPayBasisDraft;
  locationName: string;
  dateRange: string;
  category: string;
  shiftTiming: string;
  requirementsCount: number;
  goodToHaveCount: number;
  providedCount: number;
  quickQuestionCount: number;
  duplicateWarnings: ShiftDuplicateWarning[];
  onConfirm: () => void;
  onCancel: () => void;
};

function cap(s: string): string {
  const t = s.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

const ICON_WRAP: CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: "var(--wm-radius-chip)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(22,163,74,0.1)",
  color: "#16a34a",
  flexShrink: 0,
};

const SUMMARY_CARD: CSSProperties = {
  marginTop: 16,
  background: "linear-gradient(180deg, rgba(240,253,244,0.78), rgba(255,255,255,0.98))",
  border: "1px solid rgba(22,163,74,0.18)",
  borderRadius: "var(--wm-radius-chip)",
  padding: 14,
};

const DETAIL_GRID: CSSProperties = {
  marginTop: 12,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
};

const DETAIL_BOX: CSSProperties = {
  borderRadius: "var(--wm-radius-button)",
  border: "1px solid rgba(226,232,240,0.95)",
  background: "#fff",
  padding: "10px 12px",
};

const DETAIL_LABEL: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  color: "var(--wm-er-muted)",
  textTransform: "uppercase",
  letterSpacing: 0.45,
};

const DETAIL_VALUE: CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  lineHeight: 1.35,
};

const WARNING_BOX: CSSProperties = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(217,119,6,0.07)",
  border: "1px solid rgba(217,119,6,0.2)",
};

const DUPLICATE_BOX: CSSProperties = {
  marginTop: 14,
  padding: "12px 14px",
  borderRadius: "var(--wm-radius-chip)",
  background: "rgba(220,38,38,0.06)",
  border: "1px solid rgba(220,38,38,0.22)",
};

const BTN_ROW: CSSProperties = {
  marginTop: 18,
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};

const BTN_BASE: CSSProperties = {
  padding: "12px 0",
  borderRadius: "var(--wm-radius-button)",
  fontSize: 13,
  fontWeight: 800,
  cursor: "pointer",
  textAlign: "center",
};

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div style={DETAIL_BOX}>
      <div style={DETAIL_LABEL}>{label}</div>
      <div style={DETAIL_VALUE}>{value || "Not provided"}</div>
    </div>
  );
}

export function ShiftCreateConfirmModal({
  open,
  jobName,
  companyName,
  workers,
  payPerDay,
  payBasis,
  locationName,
  dateRange,
  category,
  shiftTiming,
  requirementsCount,
  goodToHaveCount,
  providedCount,
  quickQuestionCount,
  duplicateWarnings,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  const hasDuplicates = duplicateWarnings.length > 0;
  const payDisplay = formatShiftPayDisplay(payPerDay, payBasis);

  return (
    <CenterModal
      open={open}
      onBackdropClose={onCancel}
      ariaLabel="Review shift post before publishing"
      maxWidth={460}
    >
      <div style={{ padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={ICON_WRAP}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: "var(--wm-er-text)" }}>
              Preview before publish
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              Review the shift details before workers can see this post.
            </div>
          </div>
        </div>

        <div style={SUMMARY_CARD}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: "var(--wm-er-text)" }}>
                {cap(jobName)}
              </div>
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 3 }}>
                {cap(companyName)} · {category || "Category"}
              </div>
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: "#16a34a", whiteSpace: "nowrap" }}>
              {payDisplay}
            </div>
          </div>

          <div style={DETAIL_GRID}>
            <ReviewField label="Workers" value={`${workers} worker${workers !== 1 ? "s" : ""}`} />
            <ReviewField label="Date" value={dateRange} />
            <ReviewField label="Location" value={locationName} />
            <ReviewField label="Timing" value={shiftTiming || "Not specified"} />
          </div>

          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
            <span className="wm-chip">Must-have: {requirementsCount}</span>
            <span className="wm-chip">Good-to-have: {goodToHaveCount}</span>
            <span className="wm-chip">Provided: {providedCount}</span>
            <span className="wm-chip">Questions: {quickQuestionCount}</span>
          </div>
        </div>

        {hasDuplicates && (
          <div style={DUPLICATE_BOX}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                style={{ flexShrink: 0, marginTop: 1 }}
                aria-hidden="true"
              >
                <path fill="#dc2626" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
              </svg>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#991b1b" }}>
                  Possible duplicate shift found
                </div>
                <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.5, marginTop: 4 }}>
                  Please review before publishing. You can still continue if this is intentional.
                </div>
              </div>
            </div>

            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {duplicateWarnings.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: 10,
                    borderRadius: "var(--wm-radius-10)",
                    background: "#fff",
                    border: "1px solid rgba(220,38,38,0.14)",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-er-text)" }}>
                    {item.jobName} · {item.companyName}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 3 }}>
                    {item.locationName} · {item.dateRange}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={WARNING_BOX}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              style={{ flexShrink: 0, marginTop: 1 }}
              aria-hidden="true"
            >
              <path fill="#d97706" d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" />
            </svg>
            <div style={{ fontSize: 12, color: "#92400e", lineHeight: 1.5 }}>
              This post will be visible to workers immediately after publishing.
            </div>
          </div>
        </div>

        <div style={BTN_ROW}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              ...BTN_BASE,
              border: "1.5px solid #d1d5db",
              background: "#fff",
              color: "var(--wm-er-text)",
            }}
          >
            Review Again
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              ...BTN_BASE,
              border: "none",
              background: hasDuplicates ? "#b45309" : "#16a34a",
              color: "#fff",
            }}
          >
            {hasDuplicates ? "Publish Anyway" : "Publish Shift"}
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
