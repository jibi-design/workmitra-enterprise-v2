// App name: Job Mitra
// File name: ShiftSearchSmartMatches.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftSearchSmartMatches.tsx

import type { MatchQuality, MatchResult } from "../helpers/smartMatchEngine";
import { formatShiftDateRange } from "../helpers/shiftSearchViewHelpers";

type Props = {
  matches: MatchResult[];
  matchQuality: MatchQuality;
  onOpenDetails: (postId: string) => void;
};

const QUALITY_LABEL: Record<MatchQuality, string> = {
  high: "Strong profile fit",
  medium: "Good profile fit",
  low: "Basic profile fit",
  "profile incomplete": "Profile incomplete",
};

export function ShiftSearchSmartMatches({ matches, matchQuality, onOpenDetails }: Props) {
  if (matchQuality === "profile incomplete") {
    return (
      <section
        className="wm-ee-card wm-ee-vShift"
        style={{
          marginTop: 14,
          borderLeft: "5px solid #d97706",
          borderRadius: "var(--wm-radius-employee-card)",
          background: "linear-gradient(180deg, rgba(255,251,235,0.9), rgba(255,255,255,0.98))",
          boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
        }}
      >
        <div style={{ fontWeight: 950, fontSize: 15, color: "var(--wm-er-text)" }}>
          Profile Fit Score
        </div>

        <div style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
          Add city and skills to unlock profile-based fit scoring (heuristic — not AI hiring).
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "11px 12px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(217,119,6,0.07)",
            border: "1px solid rgba(217,119,6,0.18)",
            color: "#92400e",
            fontSize: 12,
            fontWeight: 850,
            lineHeight: 1.45,
          }}
        >
          Profile incomplete. Fit score is hidden until enough profile data is available.
        </div>
      </section>
    );
  }

  if (matches.length === 0) return null;

  return (
    <section
      className="wm-ee-card wm-ee-vShift"
      style={{
        marginTop: 14,
        borderLeft: "5px solid #16a34a",
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(22,163,74,0.17)",
        background: "linear-gradient(180deg, rgba(240,253,244,0.78), rgba(255,255,255,0.98))",
        boxShadow: "0 14px 32px rgba(15,23,42,0.07)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div>
          <div style={{ fontWeight: 950, fontSize: 15, color: "var(--wm-er-text)" }}>
            Profile Fit Score
          </div>

          <div style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            Candidate match score is a profile heuristic for discovery only — not an algorithmic
            hiring guarantee. Review job details before applying.
          </div>
        </div>

        <span
          style={{
            padding: "6px 10px",
            borderRadius: "var(--wm-radius-pill)",
            background: "rgba(22,163,74,0.1)",
            border: "1px solid rgba(22,163,74,0.18)",
            color: "#16a34a",
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
          }}
        >
          {QUALITY_LABEL[matchQuality]}
        </span>
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {matches.map((match) => {
          const jobTitle = getSafeText(match.post.jobName, "Shift work");
          const employerName = getSafeEntityText(match.post.companyName, "Employer not specified");
          const locationName = getSafeEntityText(match.post.locationName, "Location not specified");

          return (
            <button
              key={match.post.id}
              type="button"
              onClick={() => onOpenDetails(match.post.id)}
              style={{
                width: "100%",
                textAlign: "left",
                border: "1px solid rgba(22,163,74,0.18)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(240,253,244,0.7))",
                borderRadius: "var(--wm-radius-chip)",
                padding: 12,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(15,23,42,0.045)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 950, color: "var(--wm-er-text)" }}>
                    {jobTitle}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      color: "var(--wm-er-muted)",
                      fontWeight: 700,
                    }}
                  >
                    {employerName} · {locationName}
                  </div>

                  <div style={{ marginTop: 3, fontSize: 12, color: "var(--wm-er-muted)" }}>
                    {formatShiftDateRange(match.post.startAt, match.post.endAt)}
                  </div>
                </div>

                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <div style={{ fontSize: 16, fontWeight: 950, color: "#16a34a" }}>
                    {match.score}%
                  </div>

                  <div
                    style={{
                      marginTop: 2,
                      fontSize: 10,
                      fontWeight: 850,
                      color: "var(--wm-er-muted)",
                    }}
                  >
                    fit score
                  </div>
                </div>
              </div>

              {match.reasons.length > 0 && (
                <div style={{ marginTop: 9, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {match.reasons.slice(0, 3).map((reason: string) => (
                    <span
                      key={reason}
                      style={{
                        fontSize: 11,
                        fontWeight: 850,
                        color: "#15803d",
                        background: "rgba(22,163,74,0.09)",
                        border: "1px solid rgba(22,163,74,0.12)",
                        borderRadius: "var(--wm-radius-pill)",
                        padding: "4px 9px",
                      }}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}

              <div
                style={{
                  marginTop: 10,
                  fontSize: 11,
                  fontWeight: 950,
                  color: "#16a34a",
                }}
              >
                View fit details
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function getSafeText(value: string, fallback: string): string {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : fallback;
}

function getSafeEntityText(value: string, fallback: string): string {
  const cleaned = value.trim();
  return cleaned.length > 0 ? cleaned : fallback;
}
