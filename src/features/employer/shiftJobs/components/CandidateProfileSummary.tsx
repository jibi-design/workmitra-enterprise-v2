// App name: Job Mitra
// File name: CandidateProfileSummary.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\shiftJobs\components\CandidateProfileSummary.tsx

import type { EmployeeShiftApplication } from "../../shiftJobs/storage/employerShift.storage";

type CandidateProfileSummaryProps = {
  profile: EmployeeShiftApplication["profileSnapshot"];
};

export function CandidateProfileSummary({ profile }: CandidateProfileSummaryProps) {
  const city = profile?.city?.trim() || "Not specified";
  const experience = profile?.experience?.trim() || "Fresher";
  const languages = cleanList(profile?.languages ?? []);
  const skills = cleanList(profile?.skills ?? []);

  return (
    <div
      style={{
        marginTop: 10,
        padding: "10px 11px",
        borderRadius: 16,
        background: "linear-gradient(180deg, rgba(248,250,252,0.98), rgba(255,255,255,0.96))",
        border: "1px solid rgba(203,213,225,0.86)",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        <MiniProfileBox label="City" value={city} />
        <MiniProfileBox label="Experience" value={experience} />
        <MiniProfileBox
          label="Languages"
          value={languages.length > 0 ? languages.slice(0, 2).join(", ") : "Not listed"}
        />
        <MiniProfileBox label="Skills" value={formatCompactList(skills)} />
      </div>
    </div>
  );
}

function MiniProfileBox({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "8px 9px",
        borderRadius: 13,
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(226,232,240,0.9)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 950,
          color: "var(--wm-er-muted)",
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          fontWeight: 900,
          color: "var(--wm-er-text)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function formatCompactList(values: string[]): string {
  if (values.length === 0) return "Not listed";

  const visible = values.slice(0, 2);
  const extraCount = Math.max(0, values.length - visible.length);

  return `${visible.join(", ")}${extraCount > 0 ? `, +${extraCount} more` : ""}`;
}

function cleanList(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const cleaned = value.trim();
    const key = cleaned.toLowerCase();

    if (!cleaned || seen.has(key)) continue;

    seen.add(key);
    result.push(cleaned);
  }

  return result;
}
