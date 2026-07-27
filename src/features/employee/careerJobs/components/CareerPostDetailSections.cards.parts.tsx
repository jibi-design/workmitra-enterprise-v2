import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import { employerSettingsStorage } from "../../../../shared/employerProfile/employerSettingsPublic";
import {
  fmtExperience,
  fmtJobType,
  fmtSalaryRange,
  fmtWorkMode,
  fmtNoticePeriod,
  type CareerSearchPost,
} from "../helpers/careerSearchHelpers";
import {
  CAREER_ACCENT,
  CAREER_MUTED,
  CAREER_TEXT,
  HIGHLIGHT_BOX_STYLE,
} from "./CareerPostDetailSections.styles";
import {
  DetailRow,
  InfoPill,
  PremiumSection,
  RequirementPill,
} from "./CareerPostDetailSections.parts";

export function JobDetailsCard({ post }: { post: CareerSearchPost }) {
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
          <div key={item.label} style={HIGHLIGHT_BOX_STYLE}>
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

export function AlreadyAppliedBanner({
  onWithdraw,
  canWithdraw = true,
  withdrawOnlineBlocked = false,
}: {
  onWithdraw: () => void;
  canWithdraw?: boolean;
  withdrawOnlineBlocked?: boolean;
}) {
  return (
    <section
      style={{
        marginTop: 16,
        padding: "16px",
        borderRadius: "var(--wm-radius-chip)",
        background: "#f0fdf4",
        border: "1px solid rgba(22,163,74,0.2)",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: "#15803d" }}>Application submitted</div>
      <div style={{ fontSize: 13, color: "#166534", marginTop: 6, lineHeight: 1.5 }}>
        {canWithdraw && withdrawOnlineBlocked
          ? "Your application is being reviewed. Self-serve withdraw is not online yet — contact support if you need to withdraw."
          : canWithdraw
            ? "Your application is being reviewed. You can withdraw if needed."
            : "Your application is being reviewed."}
      </div>
      {canWithdraw ? (
        <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={onWithdraw}
            aria-label={
              withdrawOnlineBlocked
                ? "Contact support to withdraw application"
                : "Withdraw application"
            }
            style={{
              fontSize: 13,
              color: "#dc2626",
              fontWeight: 700,
              border: "1px solid rgba(220,38,38,0.2)",
            }}
          >
            {withdrawOnlineBlocked ? "Contact support to withdraw" : "Withdraw Application"}
          </button>
        </div>
      ) : null}
    </section>
  );
}
