import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise/EnterpriseEmpty";
import type { CareerJobPost } from "../types/careerTypes";
import {
  EMPLOYMENT_TERMS_SECTION_STYLE,
  STAT_BOX_STYLE,
  formatPostedNoticePeriod,
} from "./EmployerCareerPostDashboardPage.styles";

export function PostNotFoundView({ onBack }: { onBack: () => void }) {
  return (
    <div className="wm-er-vCareer wm-stackGrid">
      <DomainHero
        variant="career"
        audience="employer"
        title="Post Dashboard"
        subtitle="Post not found"
        description="This career post may have been removed or is unavailable."
      />
      <EnterpriseEmpty
        title="Post not found"
        subtitle="Return to Career Posts to continue."
        domain="career"
        primaryLabel="Back to Career Jobs"
        onPrimary={onBack}
      />
    </div>
  );
}

export function EmploymentTermsSection({ post }: { post: CareerJobPost }) {
  const hasResponsibilities = post.responsibilities.length > 0;

  return (
    <section className="wm-premium-widget" style={EMPLOYMENT_TERMS_SECTION_STYLE}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: "linear-gradient(to bottom, #1d4ed8, rgba(29,78,216,0.1))",
        }}
      />

      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: "#1e40af",
            textTransform: "uppercase",
            letterSpacing: 0.8,
            padding: "6px 12px",
            background: "rgba(37, 99, 235, 0.08)",
            borderRadius: "var(--wm-radius-button)",
            border: "1px solid rgba(37, 99, 235, 0.12)",
          }}
        >
          Employment terms
        </div>
      </div>

      <div className="wm-stable-row" style={{ gap: 12 }}>
        <div className="wm-stat-box" style={STAT_BOX_STYLE}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Notice period
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 18,
              fontWeight: 900,
              color: "#0f172a",
              lineHeight: 1.2,
            }}
          >
            {formatPostedNoticePeriod(post.noticePeriodDays)}
          </div>
          <div style={{ marginTop: 4, fontSize: 11, color: "#64748b", fontWeight: 700 }}>
            Required after resignation
          </div>
        </div>

        <div className="wm-stat-box" style={STAT_BOX_STYLE}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Responsibilities
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 18,
              fontWeight: 900,
              color: hasResponsibilities ? "#0f172a" : "#b45309",
              lineHeight: 1.2,
            }}
          >
            {hasResponsibilities ? `${post.responsibilities.length} added` : "Action needed"}
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 11,
              color: hasResponsibilities ? "#64748b" : "#b45309",
              fontWeight: 700,
            }}
          >
            {hasResponsibilities ? "Visible to candidates" : "Recommended to add"}
          </div>
        </div>
      </div>

      {!hasResponsibilities && (
        <div
          style={{
            marginTop: 14,
            padding: "14px 16px",
            borderRadius: "var(--wm-radius-chip)",
            background: "linear-gradient(135deg, rgba(254,243,199,0.8), rgba(255,251,235,0.9))",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#92400e", lineHeight: 1.5 }}>
            Responsibilities are not added. Add them later if you want applicants to understand
            daily work clearly.
          </div>
        </div>
      )}
    </section>
  );
}
