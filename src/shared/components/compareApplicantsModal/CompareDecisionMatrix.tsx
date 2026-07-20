// App name: Job Mitra
// File name: CompareDecisionMatrix.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\shared\components\compareApplicantsModal\CompareDecisionMatrix.tsx

import type { CompareColumn } from "./compareApplicantsModal.types";
import {
  formatSalary,
  formatScreening,
  formatStatus,
  getDecisionSignal,
} from "./compareApplicantsModal.formatters";
import { CAREER_BLUE_DEEP, CAREER_MUTED, CAREER_TEXT } from "./compareApplicantsModal.theme";

type CompareDecisionMatrixProps = {
  columns: CompareColumn[];
};

export function CompareDecisionMatrix({ columns }: CompareDecisionMatrixProps) {
  return (
    <div
      style={{
        marginTop: 13,
        padding: "12px 11px",
        borderRadius: 21,
        background:
          "radial-gradient(circle at 100% 0%, rgba(29,78,216,0.08), transparent 32%), linear-gradient(135deg, rgba(255,255,255,1), rgba(248,250,252,0.98))",
        border: "1px solid rgba(29,78,216,0.11)",
      }}
    >
      <div style={{ fontSize: 13.2, fontWeight: 950, color: CAREER_TEXT, lineHeight: 1.2 }}>
        Side-by-side decision details
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 11.2,
          fontWeight: 760,
          color: CAREER_MUTED,
          lineHeight: 1.4,
        }}
      >
        Each column belongs to the candidate name shown at the top.
      </div>

      <div style={{ marginTop: 11, overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div
          style={{
            minWidth: Math.max(430, columns.length * 140 + 112),
            display: "grid",
            gridTemplateColumns: `112px repeat(${columns.length}, minmax(134px, 1fr))`,
            gap: 7,
          }}
        >
          <MatrixLabel label="Candidate" strong />
          {columns.map((column) => (
            <CandidateMatrixHeader key={`header-${column.applicant.id}`} column={column} />
          ))}

          <CompareRow
            label="Status"
            values={columns.map((column) => formatStatus(column.applicant.status))}
          />
          <CompareRow
            label="Experience"
            values={columns.map((column) => column.applicant.experience || "Not specified")}
          />
          <CompareRow label="Level" values={columns.map((column) => column.experienceLevel)} />
          <CompareRow
            label="Skills"
            values={columns.map((column) => column.matchedSkillsText)}
            emphasis
          />
          <CompareRow
            label="Notice"
            values={columns.map((column) => column.applicant.noticePeriod || "Not provided")}
          />
          <CompareRow
            label="Salary"
            values={columns.map((column) => formatSalary(column.applicant.expectedSalary))}
          />
          <CompareRow
            label="Location"
            values={columns.map((column) => column.applicant.location || "Not provided")}
          />
          <CompareRow
            label="Screening"
            values={columns.map((column) => formatScreening(column.applicant))}
          />
          <CompareRow label="Rating" values={columns.map((column) => column.ratingText)} />
          <CompareRow label="Applied" values={columns.map((column) => column.appliedDate)} />
          <CompareRow
            label="Listed skills"
            values={columns.map((column) => column.skillsText)}
            tall
          />
        </div>
      </div>
    </div>
  );
}

function CandidateMatrixHeader({ column }: { column: CompareColumn }) {
  const signal = getDecisionSignal(column.applicant.priorityTag);

  return (
    <div
      style={{
        minHeight: 50,
        padding: "9px 9px",
        borderRadius: 15,
        background: "rgba(239,246,255,0.82)",
        border: "1px solid rgba(29,78,216,0.13)",
        color: CAREER_BLUE_DEEP,
      }}
    >
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 950,
          lineHeight: 1.15,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {column.applicant.name || "Worker Profile"}
      </div>

      <div
        style={{
          marginTop: 5,
          display: "inline-flex",
          padding: "3px 7px",
          borderRadius: 999,
          background: signal.background,
          border: `1px solid ${signal.border}`,
          color: signal.color,
          fontSize: 8.8,
          fontWeight: 950,
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {column.reviewOrderLabel}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  values,
  emphasis = false,
  tall = false,
  strong = false,
}: {
  label: string;
  values: string[];
  emphasis?: boolean;
  tall?: boolean;
  strong?: boolean;
}) {
  return (
    <>
      <MatrixLabel label={label} strong={strong} />
      {values.map((value, index) => (
        <MatrixValue
          key={`${label}-${index}`}
          value={value}
          emphasis={emphasis}
          tall={tall}
          strong={strong}
        />
      ))}
    </>
  );
}

function MatrixLabel({ label, strong = false }: { label: string; strong?: boolean }) {
  return (
    <div
      style={{
        minHeight: 44,
        padding: "9px 8px",
        borderRadius: 14,
        background: strong ? "rgba(29,78,216,0.08)" : "rgba(15,23,42,0.035)",
        border: strong ? "1px solid rgba(29,78,216,0.12)" : "1px solid rgba(226,232,240,0.8)",
        color: strong ? CAREER_BLUE_DEEP : CAREER_MUTED,
        fontSize: 9.4,
        fontWeight: 950,
        textTransform: "uppercase",
        letterSpacing: 0.34,
        display: "flex",
        alignItems: "center",
      }}
    >
      {label}
    </div>
  );
}

function MatrixValue({
  value,
  emphasis = false,
  tall = false,
  strong = false,
}: {
  value: string;
  emphasis?: boolean;
  tall?: boolean;
  strong?: boolean;
}) {
  return (
    <div
      style={{
        minHeight: tall ? 58 : 44,
        padding: "9px 9px",
        borderRadius: 14,
        background: strong
          ? "rgba(239,246,255,0.86)"
          : emphasis
            ? "rgba(239,246,255,0.72)"
            : "rgba(248,250,252,0.88)",
        border: strong
          ? "1px solid rgba(29,78,216,0.15)"
          : emphasis
            ? "1px solid rgba(29,78,216,0.13)"
            : "1px solid rgba(226,232,240,0.84)",
        color: strong || emphasis ? CAREER_BLUE_DEEP : CAREER_TEXT,
        fontSize: tall ? 10.8 : 11.3,
        fontWeight: strong || emphasis ? 950 : 860,
        lineHeight: 1.35,
        display: "flex",
        alignItems: tall ? "flex-start" : "center",
        wordBreak: "break-word",
      }}
    >
      {value}
    </div>
  );
}
