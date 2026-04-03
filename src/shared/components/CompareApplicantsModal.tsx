// src/shared/components/CompareApplicantsModal.tsx
//
// Applicant Comparison — swipeable card stack (mobile-first).
// Max 3 candidates. No auto-highlighting — clean data only.
// Employer decides, app informs.

import { useState } from "react";
import { ratingStorage } from "../rating/ratingStorage";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
export type ComparableApplicant = {
  id: string;
  name: string;
  wmId: string;
  appliedAt: number;
  status: string;
  skills?: string[];
  experience?: string;
  requiredSkills?: string[];
};

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  isOpen: boolean;
  applicants: ComparableApplicant[];
  onClose: () => void;
};

/* ------------------------------------------------ */
/* Star display                                     */
/* ------------------------------------------------ */
function Stars({ count }: { count: number }) {
  if (count === 0) return <span style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>No ratings</span>;
  return (
    <span style={{ fontSize: 14, letterSpacing: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(count) ? "#f59e0b" : "#d1d5db" }}>&#9733;</span>
      ))}
      <span style={{ marginLeft: 4, fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)" }}>{count.toFixed(1)}</span>
    </span>
  );
}

/* ------------------------------------------------ */
/* Level badge                                      */
/* ------------------------------------------------ */
function LevelBadge({ points }: { points: number }) {
  const level = points >= 600 ? "Platinum" : points >= 300 ? "Gold" : points >= 100 ? "Silver" : "Bronze";
  const color = points >= 600 ? "#7c3aed" : points >= 300 ? "#d97706" : points >= 100 ? "#6b7280" : "#94a3b8";
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: `${color}14`, color, border: `1px solid ${color}33` }}>
      {level}
    </span>
  );
}

/* ------------------------------------------------ */
/* Data row                                         */
/* ------------------------------------------------ */
function DataRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid var(--wm-er-divider, #eef1f5)" }}>
      <span style={{ fontSize: 12, color: "var(--wm-er-muted)", fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-er-text)", textAlign: "right" }}>{value}</span>
    </div>
  );
}

/* ------------------------------------------------ */
/* Skills match                                     */
/* ------------------------------------------------ */
function skillMatchCount(applicantSkills: string[], required: string[]): string {
  if (required.length === 0) return "N/A";
  const matched = applicantSkills.filter((s) => required.some((r) => r.toLowerCase() === s.toLowerCase())).length;
  return `${matched}/${required.length}`;
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function CompareApplicantsModal({ isOpen, applicants, onClose }: Props) {
  const [index, setIndex] = useState(0);

  if (!isOpen || applicants.length === 0) return null;

  const total = applicants.length;
  const current = applicants[index];
  const summary = ratingStorage.getWorkerSummary(current.wmId);
  const requiredSkills = current.requiredSkills ?? [];

  const appliedDate = new Date(current.appliedAt).toLocaleDateString(undefined, {
    month: "short", day: "numeric", year: "numeric",
  });

  const statusLabel = current.status.charAt(0).toUpperCase() + current.status.slice(1);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 420, maxHeight: "90vh", overflow: "auto", boxShadow: "0 8px 32px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid var(--wm-er-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>Compare applicants</div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>{total} candidates selected</div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--wm-er-muted)", fontSize: 20, padding: 4 }}>&times;</button>
        </div>

        {/* Card */}
        <div style={{ padding: "16px 18px" }}>
          {/* Identity */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>{current.name}</div>
            {current.wmId && (
              <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2, fontFamily: "monospace" }}>{current.wmId}</div>
            )}
          </div>

          {/* Data rows */}
          <DataRow label="Rating" value={<Stars count={summary.averageStars} />} />
          <DataRow label="Level" value={<LevelBadge points={summary.points} />} />
          <DataRow label="Total ratings" value={summary.totalRatings} />
          <DataRow label="Hire again" value={summary.hireAgainCount > 0 ? `${summary.hireAgainCount}/${summary.hireAgainTotal}` : "None yet"} />
          <DataRow label="Experience" value={current.experience ?? "Not specified"} />
          <DataRow
            label="Skills match"
            value={current.skills ? skillMatchCount(current.skills, requiredSkills) : "N/A"}
          />
          <DataRow label="Applied" value={appliedDate} />
          <DataRow label="Status" value={statusLabel} />

          {/* Skills tags */}
          {current.skills && current.skills.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--wm-er-muted)", marginBottom: 6 }}>Skills</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {current.skills.map((s) => {
                  const isMatch = requiredSkills.some((r) => r.toLowerCase() === s.toLowerCase());
                  return (
                    <span key={s} style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 999,
                      background: isMatch ? "rgba(22,163,74,0.08)" : "var(--wm-er-bg, #f8fafc)",
                      color: isMatch ? "#16a34a" : "var(--wm-er-muted)",
                      border: isMatch ? "1px solid rgba(22,163,74,0.2)" : "1px solid var(--wm-er-border)",
                    }}>
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation: dots + prev/next */}
        <div style={{ padding: "12px 18px 16px", borderTop: "1px solid var(--wm-er-border)" }}>
          {/* Dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
            {applicants.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Candidate ${i + 1}`}
                style={{
                  width: i === index ? 20 : 8, height: 8, borderRadius: 999, border: "none", cursor: "pointer",
                  background: i === index ? "var(--wm-brand-600, #1d4ed8)" : "rgba(29,78,216,0.15)",
                  transition: "width 0.2s, background 0.2s",
                }}
              />
            ))}
          </div>

          {/* Prev / Next */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: "1px solid var(--wm-er-border)", background: "#fff",
                fontSize: 13, fontWeight: 700, color: index === 0 ? "var(--wm-er-muted)" : "var(--wm-er-text)",
                cursor: index === 0 ? "not-allowed" : "pointer",
              }}
            >
              &#8592; Previous
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => setIndex((i) => i + 1)}
              style={{
                flex: 1, padding: "10px 0", borderRadius: 10,
                border: "none", background: index === total - 1 ? "#d1d5db" : "var(--wm-brand-600, #1d4ed8)",
                fontSize: 13, fontWeight: 700, color: "#fff",
                cursor: index === total - 1 ? "not-allowed" : "pointer",
              }}
            >
              Next &#8594;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}