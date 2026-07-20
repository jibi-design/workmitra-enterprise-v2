// App name: Job Mitra
// File name: ReviewsSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\ReviewsSection.tsx

import { EditedBadge } from "../../../../../shared/components/rating/EditedBadge";
import type { VaultSectionData } from "../../services/vaultDataAggregator";
import { SectionCard } from "./VaultProfileSharedUi";

function formatReviewDate(value?: number): string {
  if (!value) return "";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function sourceLabel(source: string): string {
  if (source === "shift") return "Shift Jobs";
  return "Shift Jobs";
}

export function ReviewsSection({ data }: { data: VaultSectionData["references"] }) {
  const shiftReviews = data.filter((ref) => ref.source === "shift");

  return (
    <SectionCard>
      {shiftReviews.length === 0 ? (
        <div
          style={{
            fontSize: 12,
            color: "var(--wm-emp-muted)",
            textAlign: "center",
            padding: "8px 0",
          }}
        >
          No shift work reviews yet. Reviews from completed shift assignments may appear here.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {shiftReviews.map((ref, index) => {
            const ratingColor =
              ref.rating >= 4 ? "#16a34a" : ref.rating >= 2 ? "#f59e0b" : "#94a3b8";
            const barPct = Math.round((ref.rating / 5) * 100);
            const reviewDate = formatReviewDate(ref.createdAt);

            return (
              <div
                key={`${ref.companyName}-${ref.jobId ?? index}-${ref.createdAt ?? index}`}
                style={{
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid rgba(22,163,74,0.14)",
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98) 58%, rgba(240,253,244,0.52))",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        color: "var(--wm-emp-text)",
                        lineHeight: 1.25,
                      }}
                    >
                      {ref.companyName}
                    </div>

                    {ref.jobTitle && (
                      <div
                        style={{
                          marginTop: 3,
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--wm-emp-muted)",
                        }}
                      >
                        {ref.jobTitle}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 10.5,
                        fontWeight: 850,
                        color: "var(--wm-emp-muted)",
                      }}
                    >
                      1 shift review
                    </div>
                  </div>

                  <span
                    style={{
                      padding: "6px 9px",
                      borderRadius: 999,
                      background: "rgba(22,163,74,0.08)",
                      border: "1px solid rgba(22,163,74,0.16)",
                      color: ratingColor,
                      fontSize: 12,
                      fontWeight: 950,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ref.rating}/5
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 8,
                    height: 5,
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barPct}%`,
                      height: "100%",
                      borderRadius: 999,
                      background: ratingColor,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>

                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: "rgba(22,163,74,0.08)",
                      border: "1px solid rgba(22,163,74,0.14)",
                      color: "#16a34a",
                      fontSize: 10,
                      fontWeight: 900,
                    }}
                  >
                    {sourceLabel(ref.source)}
                  </span>

                  {typeof ref.hireAgain === "boolean" && (
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: ref.hireAgain ? "rgba(22,163,74,0.08)" : "rgba(239,68,68,0.06)",
                        border: ref.hireAgain
                          ? "1px solid rgba(22,163,74,0.14)"
                          : "1px solid rgba(239,68,68,0.14)",
                        color: ref.hireAgain ? "#16a34a" : "#dc2626",
                        fontSize: 10,
                        fontWeight: 900,
                      }}
                    >
                      Hire again: {ref.hireAgain ? "Yes" : "No"}
                    </span>
                  )}

                  <EditedBadge editedAt={ref.editedAt ?? null} />

                  {reviewDate && (
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 999,
                        background: "rgba(15,23,42,0.035)",
                        border: "1px solid rgba(148,163,184,0.18)",
                        color: "var(--wm-emp-muted)",
                        fontSize: 10,
                        fontWeight: 850,
                      }}
                    >
                      {reviewDate}
                    </span>
                  )}
                </div>

                {ref.tags && ref.tags.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {ref.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          padding: "4px 8px",
                          borderRadius: 999,
                          background: "rgba(124,58,237,0.06)",
                          border: "1px solid rgba(124,58,237,0.12)",
                          color: "#7c3aed",
                          fontSize: 10,
                          fontWeight: 850,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {ref.comment && (
                  <div
                    style={{
                      marginTop: 9,
                      padding: "9px 10px",
                      borderRadius: 13,
                      background: "rgba(248,250,252,0.96)",
                      border: "1px solid rgba(226,232,240,0.9)",
                      color: "var(--wm-emp-muted)",
                      fontSize: 12,
                      fontWeight: 700,
                      lineHeight: 1.45,
                    }}
                  >
                    {ref.comment}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
