// App name: Job Mitra
// File name: CareerPostDetailSections.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\components\CareerPostDetailSections.tsx

import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";
import {
  fmtExperience,
  fmtJobType,
  fmtSalaryRange,
  fmtWorkMode,
  fmtNoticePeriod,
  type CareerSearchPost,
} from "../helpers/careerSearchHelpers";

const CAREER_ACCENT = "var(--wm-er-accent-career, #1d4ed8)";
const CAREER_TEXT = "#0f172a";
const CAREER_MUTED = "#64748b";

function PremiumSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="wm-ee-card"
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: 16,
        border: "1px solid rgba(15, 23, 42, 0.08)",
        background: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ fontSize: 16, fontWeight: 800, color: CAREER_TEXT }}>{title}</div>

      {subtitle && (
        <div
          style={{
            marginTop: 4,
            marginBottom: 16,
            fontSize: 13,
            fontWeight: 500,
            color: CAREER_MUTED,
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </div>
      )}

      {!subtitle && <div style={{ height: 16 }} />}

      {children}
    </section>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.25fr",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid rgba(15, 23, 42, 0.04)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: CAREER_MUTED }}>{label}</div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          color: CAREER_TEXT,
          textAlign: "right",
          lineHeight: 1.4,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function JobDetailsCard({ post }: { post: CareerSearchPost }) {
  // Global Currency Fix: Remove currency symbols for Universal App Format
  const rawSalary = fmtSalaryRange(post.salaryMin, post.salaryMax, post.salaryPeriod);
  const cleanSalary = rawSalary.replace(/[$₹£€¥]/g, "").trim();

  const highlightItems = [
    { label: "Job type", value: fmtJobType(post.jobType) },
    { label: "Work mode", value: fmtWorkMode(post.workMode) },
    { label: "Salary", value: cleanSalary },
    { label: "Experience", value: fmtExperience(post.experienceMin, post.experienceMax) },
  ].filter((item) => item.value);

  return (
    <PremiumSection title="Role details" subtitle="Core role information shared by the employer.">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        {highlightItems.map((item) => (
          <div
            key={item.label}
            style={{
              padding: "12px",
              borderRadius: "12px",
              background: "#f8fafc",
              border: "1px solid #f1f5f9",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: CAREER_MUTED,
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 14,
                fontWeight: 800,
                color: CAREER_TEXT,
                lineHeight: 1.3,
                wordBreak: "break-word",
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <DetailRow label="Location" value={post.location} />
      <DetailRow label="Department" value={post.department} />
      <DetailRow label="Interview rounds" value={String(post.interviewRounds)} />
      {/* Added Missing Notice Period */}
      <DetailRow label="Notice period" value={fmtNoticePeriod(post.noticePeriodDays)} />
      <DetailRow
        label="Closing date"
        value={
          post.closingDate
            ? new Date(post.closingDate).toLocaleDateString(undefined, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : ""
        }
      />
    </PremiumSection>
  );
}

export function CompanyInfoCard() {
  const company = employerSettingsStorage.get();
  const hasInfo =
    company.companyDescription.trim() ||
    company.industryType ||
    company.companySize ||
    company.locationCity;

  if (!hasInfo) return null;

  return (
    <PremiumSection
      title="About the company"
      subtitle="Employer profile information shown from the current local profile."
    >
      <div style={{ marginBottom: 12 }}>
        <EmployerTrustBadge variant="full" />
      </div>

      {company.companyDescription.trim() && (
        <div style={{ fontSize: 14, color: CAREER_TEXT, lineHeight: 1.7, marginBottom: 12 }}>
          {company.companyDescription}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {company.industryType && <InfoPill>{company.industryType}</InfoPill>}
        {company.companySize && <InfoPill>{company.companySize} employees</InfoPill>}
        {company.locationCity && (
          <InfoPill>
            {company.locationCity}
            {company.locationState ? `, ${company.locationState}` : ""}
          </InfoPill>
        )}
      </div>
    </PremiumSection>
  );
}

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        padding: "6px 12px",
        borderRadius: 999,
        background: "rgba(29,78,216,0.08)",
        border: "1px solid rgba(29,78,216,0.12)",
        color: CAREER_ACCENT,
      }}
    >
      {children}
    </span>
  );
}

export function DescriptionCard({ text }: { text: string }) {
  if (!text) return null;

  return (
    <PremiumSection title="Description" subtitle="Employer-provided role overview.">
      <div style={{ fontSize: 14, color: CAREER_TEXT, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
        {text}
      </div>
    </PremiumSection>
  );
}

export function ResponsibilitiesCard({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <PremiumSection
      title="Responsibilities"
      subtitle="Main work items shared for this career role."
    >
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            style={{ fontSize: 14, color: CAREER_TEXT, display: "flex", gap: 10, lineHeight: 1.6 }}
          >
            <span style={{ color: CAREER_ACCENT, fontWeight: 800, flexShrink: 0 }}>
              {index + 1}.
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </PremiumSection>
  );
}

export function RequirementsCard({
  qualifications,
  skills,
}: {
  qualifications: string[];
  skills: string[];
}) {
  if (qualifications.length === 0 && skills.length === 0) return null;

  return (
    <PremiumSection
      title="Requirements"
      subtitle="Required qualifications and skills for this role."
    >
      {qualifications.length > 0 && (
        <div style={{ marginBottom: skills.length > 0 ? 16 : 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: CAREER_MUTED, marginBottom: 8 }}>
            Qualifications
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {qualifications.map((qualification) => (
              <RequirementPill key={qualification} label={qualification} tone="neutral" />
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: CAREER_MUTED, marginBottom: 8 }}>
            Skills
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {skills.map((skill) => (
              <RequirementPill key={skill} label={skill} tone="blue" />
            ))}
          </div>
        </div>
      )}
    </PremiumSection>
  );
}

function RequirementPill({ label, tone }: { label: string; tone: "blue" | "neutral" }) {
  const isBlue = tone === "blue";

  return (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        padding: "6px 14px",
        borderRadius: 999,
        background: isBlue ? "rgba(29,78,216,0.08)" : "#f1f5f9",
        border: isBlue ? "1px solid rgba(29,78,216,0.12)" : "1px solid #e2e8f0",
        color: isBlue ? CAREER_ACCENT : CAREER_TEXT,
      }}
    >
      {label}
    </span>
  );
}

export function AlreadyAppliedBanner({ onWithdraw }: { onWithdraw: () => void }) {
  return (
    <section
      style={{
        marginTop: 16,
        padding: "16px",
        borderRadius: 16,
        background: "#f0fdf4",
        border: "1px solid rgba(22,163,74,0.2)",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: "#15803d" }}>Application submitted</div>

      <div style={{ fontSize: 13, color: "#166534", marginTop: 6, lineHeight: 1.5 }}>
        Your application is being reviewed. You can withdraw if needed.
      </div>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <button
          className="wm-outlineBtn"
          type="button"
          onClick={onWithdraw}
          style={{
            fontSize: 13,
            color: "#dc2626",
            fontWeight: 700,
            border: "1px solid rgba(220,38,38,0.2)",
          }}
        >
          Withdraw Application
        </button>
      </div>
    </section>
  );
}
