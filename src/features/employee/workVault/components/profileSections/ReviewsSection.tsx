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
  if (source === "planner") return "Gig Projects";
  if (source === "career") return "Career";
  if (source === "workforce") return "Workforce";
  return "Shift Jobs";
}

export function ReviewsSection({ data }: { data: VaultSectionData["references"] }) {
  const shiftReviews = data.filter((ref) => ref.source === "shift");
  const plannerReviews = data.filter((ref) => ref.source === "planner");
  const hasAny = shiftReviews.length > 0 || plannerReviews.length > 0;

  return (
    <SectionCard>
      {!hasAny ? (
        <div
          style={{
            fontSize: 12,
            color: "var(--wm-emp-muted)",
            textAlign: "center",
            padding: "8px 0",
          }}
        >
          No work reviews yet. Shift and Gig Project reviews may appear here after completion.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {shiftReviews.map((ref, index) =>
            renderReviewCard(ref, index, {
              border: "1px solid rgba(22,163,74,0.14)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98) 58%, rgba(240,253,244,0.52))",
              badgeBg: "rgba(22,163,74,0.08)",
              badgeBorder: "1px solid rgba(22,163,74,0.16)",
              countLabel: "1 shift review",
            }),
          )}
          {plannerReviews.map((ref, index) =>
            renderReviewCard(ref, index, {
              border: "1px solid rgba(8,145,178,0.18)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,1), rgba(248,250,252,0.98) 58%, rgba(236,254,255,0.55))",
              badgeBg: "rgba(8,145,178,0.08)",
              badgeBorder: "1px solid rgba(8,145,178,0.18)",
              countLabel: "1 Gig Project epoch",
            }),
          )}
        </div>
      )}
    </SectionCard>
  );
}

function renderReviewCard(
  ref: VaultSectionData["references"][number],
  index: number,
  theme: {
    border: string;
    background: string;
    badgeBg: string;
    badgeBorder: string;
    countLabel: string;
  },
) {
  const ratingColor = ref.rating >= 4 ? "#16a34a" : ref.rating >= 2 ? "#f59e0b" : "#94a3b8";
  const barPct = Math.round((ref.rating / 5) * 100);
  const reviewDate = formatReviewDate(ref.createdAt);

  return (
    <div
      key={`${ref.source}-${ref.companyName}-${ref.jobId ?? index}-${ref.createdAt ?? index}`}
      data-testid={ref.source === "planner" ? "vault-planner-review" : "vault-shift-review"}
      style={{
        padding: 12,
        borderRadius: "var(--wm-radius-chip)",
        border: theme.border,
        background: theme.background,
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

          {ref.jobTitle ? (
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
          ) : null}

          <div
            style={{
              marginTop: 4,
              fontSize: 10.5,
              fontWeight: 850,
              color: "var(--wm-emp-muted)",
            }}
          >
            {sourceLabel(ref.source)} · {theme.countLabel}
          </div>
        </div>

        <span
          style={{
            padding: "6px 9px",
            borderRadius: "var(--wm-radius-pill)",
            background: theme.badgeBg,
            border: theme.badgeBorder,
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
          borderRadius: "var(--wm-radius-pill)",
          background: "rgba(15,23,42,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${barPct}%`,
            height: "100%",
            borderRadius: "var(--wm-radius-pill)",
            background: ratingColor,
            transition: "width 0.3s ease",
          }}
        />
      </div>

      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "var(--wm-radius-pill)",
            background: theme.badgeBg,
            border: theme.badgeBorder,
            color: ratingColor,
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {sourceLabel(ref.source)}
        </span>

        {typeof ref.hireAgain === "boolean" ? (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "var(--wm-radius-pill)",
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
        ) : null}

        <EditedBadge editedAt={ref.editedAt ?? null} />

        {reviewDate ? (
          <span
            style={{
              padding: "4px 8px",
              borderRadius: "var(--wm-radius-pill)",
              background: "rgba(15,23,42,0.035)",
              border: "1px solid rgba(148,163,184,0.18)",
              color: "var(--wm-emp-muted)",
              fontSize: 10,
              fontWeight: 850,
            }}
          >
            {reviewDate}
          </span>
        ) : null}
      </div>

      {ref.tags && ref.tags.length > 0 ? (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {ref.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: "4px 8px",
                borderRadius: "var(--wm-radius-pill)",
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
      ) : null}

      {ref.comment ? (
        <div
          style={{
            marginTop: 9,
            padding: "9px 10px",
            borderRadius: "var(--wm-radius-chip)",
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
      ) : null}
    </div>
  );
}
