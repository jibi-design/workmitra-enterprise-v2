// src/features/employee/careerJobs/components/CareerPostDetailSections.tsx
//
// Display sections for EmployeeCareerPostDetailsPage.

import type { CareerSearchPost } from "../helpers/careerSearchHelpers";
import { fmtSalaryRange, fmtExperience, fmtJobType, fmtWorkMode } from "../helpers/careerSearchHelpers";
export function DetailRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted, #6b7280)" }}>{label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-text, #111827)", textAlign: "right" }}>{value}</div>
    </div>
  );
}
import { EmployerTrustBadge } from "../../../../shared/employerProfile/EmployerTrustBadge";
import { employerSettingsStorage } from "../../../employer/company/storage/employerSettings.storage";

const CAREER_ACCENT = "var(--wm-er-accent-career)";

/* ── Job Details Card ──────────────────────────── */

export function JobDetailsCard({ post }: { post: CareerSearchPost }) {
  return (
    <div className="wm-ee-card" style={{ marginTop: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: CAREER_ACCENT, marginBottom: 10 }}>Job details</div>
      <DetailRow label="Job Type" value={fmtJobType(post.jobType)} />
      <DetailRow label="Work Mode" value={fmtWorkMode(post.workMode)} />
      <DetailRow label="Location" value={post.location} />
      <DetailRow label="Department" value={post.department} />
      <DetailRow label="Salary" value={fmtSalaryRange(post.salaryMin, post.salaryMax, post.salaryPeriod)} />
      <DetailRow label="Experience" value={fmtExperience(post.experienceMin, post.experienceMax)} />
      <DetailRow label="Interview Rounds" value={String(post.interviewRounds)} />
      <DetailRow label="Closing Date" value={post.closingDate ? new Date(post.closingDate).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : ""} />
    </div>
  );
}

/* ── Company Info ──────────────────────────────── */

export function CompanyInfoCard() {
  const co = employerSettingsStorage.get();
  const hasInfo = co.companyDescription.trim() || co.industryType || co.companySize || co.locationCity;
  if (!hasInfo) return null;
  return (
    <div className="wm-ee-card" style={{ marginTop: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: CAREER_ACCENT, marginBottom: 10 }}>About the company</div>
      <div style={{ marginBottom: 10 }}><EmployerTrustBadge variant="full" /></div>
      {co.companyDescription.trim() && (
        <div style={{ fontSize: 13, color: "var(--wm-emp-text, #111827)", lineHeight: 1.7, marginBottom: 8 }}>{co.companyDescription}</div>
      )}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {co.industryType && <InfoPill>{co.industryType}</InfoPill>}
        {co.companySize && <InfoPill>{co.companySize} employees</InfoPill>}
        {co.locationCity && <InfoPill>📍 {co.locationCity}{co.locationState ? `, ${co.locationState}` : ""}</InfoPill>}
      </div>
    </div>
  );
}

function InfoPill({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", color: CAREER_ACCENT }}>
      {children}
    </span>
  );
}

/* ── Description ───────────────────────────────── */

export function DescriptionCard({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div className="wm-ee-card" style={{ marginTop: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: CAREER_ACCENT, marginBottom: 8 }}>Description</div>
      <div style={{ fontSize: 13, color: "var(--wm-emp-text, #111827)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{text}</div>
    </div>
  );
}

/* ── Responsibilities ──────────────────────────── */

export function ResponsibilitiesCard({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="wm-ee-card" style={{ marginTop: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: CAREER_ACCENT, marginBottom: 8 }}>Responsibilities</div>
      <div style={{ display: "grid", gap: 6 }}>
        {items.map((r, i) => (
          <div key={i} style={{ fontSize: 13, color: "var(--wm-emp-text, #111827)", display: "flex", gap: 8 }}>
            <span style={{ color: CAREER_ACCENT, fontWeight: 700, flexShrink: 0 }}>•</span><span>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Requirements (Qualifications + Skills) ────── */

export function RequirementsCard({ qualifications, skills }: { qualifications: string[]; skills: string[] }) {
  if (qualifications.length === 0 && skills.length === 0) return null;
  return (
    <div className="wm-ee-card" style={{ marginTop: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: CAREER_ACCENT, marginBottom: 8 }}>Requirements</div>
      {qualifications.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted, #6b7280)", marginBottom: 4 }}>Qualifications</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {qualifications.map((q) => <span key={q} style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(29,78,216,0.06)", border: "1px solid rgba(29,78,216,0.12)", color: "var(--wm-emp-text, #111827)" }}>{q}</span>)}
          </div>
        </div>
      )}
      {skills.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--wm-emp-muted, #6b7280)", marginBottom: 4 }}>Skills</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {skills.map((s) => <span key={s} style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 999, background: "rgba(29,78,216,0.08)", color: CAREER_ACCENT }}>{s}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Already Applied Banner ────────────────────── */

export function AlreadyAppliedBanner({ onWithdraw }: { onWithdraw: () => void }) {
  return (
    <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 14, background: "rgba(22,163,74,0.04)", border: "1px solid rgba(22,163,74,0.15)" }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>You have applied to this position</div>
      <div style={{ fontSize: 12, color: "var(--wm-emp-muted, #6b7280)", marginTop: 4 }}>Your application is being reviewed. You can withdraw if needed.</div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <button className="wm-outlineBtn" type="button" onClick={onWithdraw} style={{ fontSize: 12, color: "var(--wm-error, #dc2626)" }}>Withdraw Application</button>
      </div>
    </div>
  );
}