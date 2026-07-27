// App name: Job Mitra
// File name: CareerCandidateProfileSummary.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerCandidateProfileSummary.tsx

import type { CareerApplication } from "../types/careerTypes";

type CareerCandidateProfileSummaryProps = {
  profile: CareerApplication["profileSnapshot"];
};

const CAREER_BLUE = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";

export function CareerCandidateProfileSummary({ profile }: CareerCandidateProfileSummaryProps) {
  if (
    !profile ||
    (!profile.city &&
      !profile.experience &&
      !profile.languages?.length &&
      (!profile.skills || profile.skills.length === 0))
  ) {
    return null;
  }

  const meta = [
    profile.city ? profile.city : null,
    profile.experience ? profile.experience : null,
    profile.languages?.length ? profile.languages.join(", ") : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div style={{ marginTop: 6 }}>
      {meta.length > 0 && (
        <div
          style={{
            fontSize: 11.2,
            fontWeight: 780,
            color: CAREER_MUTED,
            lineHeight: 1.35,
            wordBreak: "break-word",
          }}
        >
          {meta.join(" • ")}
        </div>
      )}

      {profile.skills && profile.skills.length > 0 && (
        <div style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
          {profile.skills.slice(0, 4).map((skill) => (
            <span
              key={skill}
              style={{
                fontSize: 10.2,
                fontWeight: 850,
                padding: "3px 8px",
                borderRadius: "var(--wm-radius-pill)",
                background: "rgba(29,78,216,0.075)",
                color: CAREER_BLUE,
                border: "1px solid rgba(29,78,216,0.11)",
                lineHeight: 1.15,
              }}
            >
              {skill}
            </span>
          ))}

          {profile.skills.length > 4 && (
            <span
              style={{
                fontSize: 10.2,
                fontWeight: 850,
                padding: "3px 8px",
                borderRadius: "var(--wm-radius-pill)",
                background: "rgba(15,23,42,0.045)",
                color: CAREER_MUTED,
                border: "1px solid rgba(148,163,184,0.12)",
                lineHeight: 1.15,
              }}
            >
              +{profile.skills.length - 4} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
