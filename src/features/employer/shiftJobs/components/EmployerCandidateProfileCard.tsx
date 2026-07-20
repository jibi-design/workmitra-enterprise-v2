// App name: Job Mitra

// File name: EmployerCandidateProfileCard.tsx

// Phase 1: Work Vault snapshot + availability badge + privacy shield.

import { availabilityStorage } from "../../../employee/shiftJobs/storage/availabilityStorage";

import type { WorkerRatingSummary } from "../../../../shared/rating/ratingTypes";

import {
  getExperienceLabel,
  hasCandidateProfileInfo,
} from "../helpers/employerCandidateDetail.helpers";

import { ShiftContactPlatformLockStrip } from "./ShiftContactPlatformLockStrip";

import type {
  ApplicantStatus,
  EmployeeShiftApplication,
} from "../../shiftJobs/storage/employerShift.storage";

type EmployerCandidateProfileCardProps = {
  snapshot: EmployeeShiftApplication["profileSnapshot"];

  workerRating: WorkerRatingSummary | null;

  workerWmId?: string;

  shiftStartAt?: number;

  applicantStatus: ApplicantStatus;
};

export function EmployerCandidateProfileCard({
  snapshot,

  workerRating,

  workerWmId = "",

  shiftStartAt,

  applicantStatus,
}: EmployerCandidateProfileCardProps) {
  const name = snapshot?.fullName;

  const city = snapshot?.city;

  const experience = snapshot?.experience;

  const skills = snapshot?.skills ?? [];

  const languages = snapshot?.languages ?? [];

  const hasProfile = Boolean(name || city || experience || skills.length || languages.length);

  if (!hasProfile && !hasCandidateProfileInfo(snapshot)) {
    return (
      <div style={{ marginTop: 12 }} className="wm-ee-card">
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
          No profile information provided by candidate.
        </div>
      </div>
    );
  }

  const hasRating = workerRating !== null && workerRating.totalRatings > 0;

  const freeBadgeLabel =
    workerWmId && shiftStartAt !== undefined
      ? availabilityStorage.getFreeDayBadgeLabel(workerWmId, shiftStartAt)
      : null;

  return (
    <div style={{ marginTop: 12 }} className="wm-ee-card">
      {freeBadgeLabel && (
        <div
          style={{
            marginBottom: 12,

            display: "inline-flex",

            alignItems: "center",

            gap: 6,

            padding: "7px 12px",

            borderRadius: 999,

            background: "rgba(16,185,129,0.10)",

            border: "1px solid rgba(16,185,129,0.28)",

            fontSize: 12,

            fontWeight: 900,

            color: "#059669",
          }}
        >
          <span aria-hidden="true">✅</span>

          {freeBadgeLabel}
        </div>
      )}

      <div
        style={{
          fontWeight: 1000,

          fontSize: 14,

          color: "var(--wm-er-text)",

          marginBottom: 12,
        }}
      >
        Work Vault Profile
      </div>

      {hasRating && workerRating && (
        <div
          style={{
            marginBottom: 12,

            padding: "9px 12px",

            borderRadius: 10,

            background: "rgba(16,185,129,0.07)",

            border: "1px solid rgba(16,185,129,0.18)",

            display: "flex",

            alignItems: "center",

            justifyContent: "space-between",

            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>★</span>

            <span style={{ fontSize: 14, fontWeight: 900, color: "#059669" }}>
              {workerRating.averageStars.toFixed(1)}
            </span>

            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 650 }}>
              ({workerRating.totalRatings} rating{workerRating.totalRatings !== 1 ? "s" : ""})
            </span>
          </div>

          {workerRating.hireAgainTotal > 0 && (
            <span style={{ fontSize: 11, color: "#059669", fontWeight: 750 }}>
              Hire again {workerRating.hireAgainCount}/{workerRating.hireAgainTotal}
            </span>
          )}
        </div>
      )}

      <div style={{ display: "grid", gap: 8 }}>
        {name && (
          <div className="wm-kv">
            <div className="k">Name</div>

            <div className="v" style={{ fontWeight: 800 }}>
              {name}
            </div>
          </div>
        )}

        {city && (
          <div className="wm-kv">
            <div className="k">City</div>

            <div className="v">{city}</div>
          </div>
        )}

        {experience && (
          <div className="wm-kv">
            <div className="k">Experience</div>

            <div className="v">{getExperienceLabel(experience)}</div>
          </div>
        )}
      </div>

      {skills.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div
            style={{
              fontSize: 11,

              fontWeight: 900,

              color: "var(--wm-er-muted)",

              marginBottom: 6,
            }}
          >
            SKILLS
          </div>

          <div className="wm-chipRow">
            {skills.slice(0, 8).map((skill) => (
              <span
                key={skill}

                style={{
                  fontSize: 11,

                  fontWeight: 700,

                  padding: "3px 10px",

                  borderRadius: 999,

                  background: "rgba(15,118,110,0.10)",

                  color: "var(--wm-er-accent-shift)",

                  border: "1px solid rgba(15,118,110,0.18)",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {languages.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div
            style={{
              fontSize: 11,

              fontWeight: 900,

              color: "var(--wm-er-muted)",

              marginBottom: 6,
            }}
          >
            LANGUAGES
          </div>

          <div className="wm-chipRow">
            {languages.map((language) => (
              <span
                key={language}

                style={{
                  fontSize: 11,

                  fontWeight: 700,

                  padding: "3px 10px",

                  borderRadius: 999,

                  background: "rgba(2,132,199,0.08)",

                  color: "#0284c7",

                  border: "1px solid rgba(2,132,199,0.18)",
                }}
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}

      <ShiftContactPlatformLockStrip applicantStatus={applicantStatus} />
    </div>
  );
}
