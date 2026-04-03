// src/features/employer/myStaff/components/StaffDetailSections.tsx

import type { StaffRecord } from "../storage/myStaff.storage";
import type { StatusMeta } from "../helpers/staffDetailHelpers";
import { formatDate } from "../helpers/staffDetailHelpers";
import { IconPerson, IconWarning, IconCheckCircle, FieldRow } from "./staffDetailComponents";

/* ------------------------------------------------ */
/* Props types                                      */
/* ------------------------------------------------ */
type HeroCardProps = {
  record: StaffRecord;
  sm: StatusMeta;
};

type EmploymentDetailsProps = {
  record: StaffRecord;
  sm: StatusMeta;
  duration: string;
};

type ResignationBannerProps = {
  onAccept: () => void;
  onReject: () => void;
};

type ExitActionsProps = {
  onStartExit: () => void;
};

type ExitedInfoProps = {
  record: StaffRecord;
};

/* ------------------------------------------------ */
/* Exit Done Banner                                 */
/* ------------------------------------------------ */
export function ExitDoneBanner() {
  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div
        style={{
          background: "rgba(22,163,74,0.08)",
          border: "1px solid rgba(22,163,74,0.2)",
          borderRadius: 12,
          padding: 14,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <IconCheckCircle />
        <span style={{ fontWeight: 900, fontSize: 13, color: "#16a34a" }}>
          Exit processed successfully. Work history updated.
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Hero Card                                        */
/* ------------------------------------------------ */
export function HeroCard({ record, sm }: HeroCardProps) {
  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div
        className="wm-er-card"
        style={{
          borderLeft: `4px solid ${sm.color}`,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: sm.color + "12",
            color: sm.color,
            flexShrink: 0,
          }}
        >
          <IconPerson />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)", lineHeight: 1.3 }}>
            {record.employeeName}
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "var(--wm-er-muted)", marginTop: 2 }}>
            {record.jobTitle}
            {record.category ? ` – ${record.category}` : ""}
          </div>
          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 900,
                padding: "2px 8px",
                borderRadius: 999,
                background: sm.color + "14",
                color: sm.color,
                border: `1px solid ${sm.color}33`,
              }}
            >
              {sm.label}
            </span>
            {record.addMethod === "via_app" && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(55,48,163,0.08)",
                  color: "var(--wm-er-accent-career)",
                  border: "1px solid rgba(55,48,163,0.2)",
                }}
              >
                Via App
              </span>
            )}
            {record.employeeConfirmed && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "rgba(22,163,74,0.08)",
                  color: "#16a34a",
                  border: "1px solid rgba(22,163,74,0.2)",
                }}
              >
                Confirmed
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Employment Details                               */
/* ------------------------------------------------ */
export function EmploymentDetails({ record, sm, duration }: EmploymentDetailsProps) {
  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div className="wm-er-card" style={{ padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 4 }}>
          Employment Details
        </div>
        <FieldRow label="Employee Name" value={record.employeeName} />
        <FieldRow label="Unique ID" value={record.employeeUniqueId || "–"} />
        <FieldRow label="Job Title" value={record.jobTitle} />
        {record.category && <FieldRow label="Category" value={record.category} />}
        <FieldRow label="Employment Type" value={record.employmentType.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} />
        <FieldRow label="Joined" value={formatDate(record.joinedAt)} />
        <FieldRow label="Duration" value={duration} />
        <FieldRow label="Status" value={sm.label} />
        <FieldRow label="Added Via" value={record.addMethod === "via_app" ? "WorkMitra App" : "Manually Added"} />
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Resignation Banner                               */
/* ------------------------------------------------ */
export function ResignationBanner({ onAccept, onReject }: ResignationBannerProps) {
  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div
        className="wm-er-card"
        style={{ borderLeft: "4px solid #d97706", padding: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#d97706", fontWeight: 900, fontSize: 14, marginBottom: 8 }}>
          <IconWarning /> Resignation Submitted
        </div>
        <div style={{ fontSize: 13, color: "var(--wm-er-text)", lineHeight: 1.5 }}>
          This employee has submitted their resignation. Review the details and choose an action below.
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onAccept}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "#16a34a",
              color: "#fff",
              fontWeight: 900,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Accept Resignation
          </button>
          <button
            type="button"
            onClick={onReject}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1.5px solid rgba(0,0,0,0.12)",
              background: "transparent",
              color: "var(--wm-er-text)",
              fontWeight: 800,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            Reject Resignation
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Exit Actions                                     */
/* ------------------------------------------------ */
export function ExitActions({ onStartExit }: ExitActionsProps) {
  return (
    <div style={{ padding: "20px 20px 0" }}>
      <div
        style={{
          fontSize: 12,
          color: "var(--wm-er-muted)",
          lineHeight: 1.5,
          marginBottom: 10,
          padding: "10px 12px",
          background: "rgba(220,38,38,0.04)",
          border: "1px solid rgba(220,38,38,0.1)",
          borderRadius: 10,
        }}
      >
        Use this if the employee is leaving – termination, layoff, contract end, or if they left without resigning in the app. This will update their verified work history.
      </div>
      <button
        type="button"
        onClick={onStartExit}
        style={{
          width: "100%",
          padding: "14px 20px",
          borderRadius: 12,
          border: "2px solid #dc2626",
          background: "rgba(220,38,38,0.06)",
          color: "#dc2626",
          fontWeight: 900,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        End Employment
      </button>
    </div>
  );
}

/* ------------------------------------------------ */
/* Exited Info                                      */
/* ------------------------------------------------ */
export function ExitedInfo({ record }: ExitedInfoProps) {
  return (
    <div style={{ padding: "12px 20px 0" }}>
      <div className="wm-er-card" style={{ borderLeft: "4px solid #6b7280", padding: 16 }}>
        <div style={{ fontWeight: 900, fontSize: 14, color: "#6b7280", marginBottom: 8 }}>
          Employment Ended
        </div>
        {record.exitedAt && <FieldRow label="Exit Date" value={formatDate(record.exitedAt)} />}
        {record.exitReason && (
          <FieldRow label="Reason" value={record.exitReason.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} />
        )}
        {typeof record.employerRating === "number" && (
          <FieldRow label="Your Rating" value={"★".repeat(record.employerRating) + "☆".repeat(5 - record.employerRating)} />
        )}
        {record.employerComment && <FieldRow label="Your Comment" value={record.employerComment} />}
      </div>
    </div>
  );
}