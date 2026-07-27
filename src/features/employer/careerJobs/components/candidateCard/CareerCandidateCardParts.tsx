import {
  formatScheduleDate,
  formatScheduleMode,
  formatScheduleTime,
  getEmployerScheduledInterview,
  isExternalMeetingLink,
} from "./careerCandidateCard.helpers";
import { CAREER_BLUE, CAREER_MUTED, CAREER_TEXT } from "./careerCandidateCard.constants";

export function ScheduleMeta({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "9px 10px",
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(255,255,255,0.76)",
        border: "1px solid rgba(217,119,6,0.09)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 9.5,
          fontWeight: 950,
          color: CAREER_MUTED,
          textTransform: "uppercase",
          letterSpacing: 0.45,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 3,
          fontSize: 11.5,
          fontWeight: 950,
          color: CAREER_TEXT,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function EmployerInterviewScheduleSummary({
  schedule,
}: {
  schedule: NonNullable<ReturnType<typeof getEmployerScheduledInterview>>;
}) {
  const hasMeetingLink = isExternalMeetingLink(schedule.meetingLink);

  return (
    <section
      style={{
        marginTop: 16,
        padding: 16,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(217,119,6,0.18)",
        background: "linear-gradient(135deg, rgba(255,251,235,0.84), rgba(255,255,255,0.94))",
        boxShadow: "0 10px 24px rgba(217,119,6,0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 950,
              color: "#92400e",
              letterSpacing: 0.55,
              textTransform: "uppercase",
            }}
          >
            Interview scheduled
          </div>
          <div
            style={{
              marginTop: 5,
              fontSize: 14,
              fontWeight: 950,
              color: CAREER_TEXT,
              lineHeight: 1.2,
            }}
          >
            {schedule.label}
          </div>
          <div
            style={{
              marginTop: 5,
              fontSize: 11.5,
              fontWeight: 800,
              color: CAREER_MUTED,
            }}
          >
            Visible to candidate in their Applications page.
          </div>
        </div>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "var(--wm-radius-pill)",
            background: "#f59e0b",
            boxShadow: "0 0 0 6px rgba(245,158,11,0.13)",
            flexShrink: 0,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 13,
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        <ScheduleMeta label="Date" value={formatScheduleDate(schedule.scheduledDate)} />
        <ScheduleMeta label="Time" value={formatScheduleTime(schedule.scheduledTime)} />
        <ScheduleMeta label="Mode" value={formatScheduleMode(schedule.interviewMode)} />
      </div>
      {(schedule.location || hasMeetingLink) && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(255,255,255,0.74)",
            border: "1px solid rgba(217,119,6,0.11)",
            fontSize: 12,
            fontWeight: 780,
            color: CAREER_MUTED,
            lineHeight: 1.45,
            overflowWrap: "anywhere",
          }}
        >
          {schedule.location && (
            <div>
              <b style={{ color: CAREER_TEXT }}>
                {schedule.interviewMode === "phone" ? "Contact note" : "Location"}:
              </b>{" "}
              {schedule.location}
            </div>
          )}
          {hasMeetingLink && (
            <a
              href={schedule.meetingLink ?? "#"}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                marginTop: schedule.location ? 8 : 0,
                color: "#1d4ed8",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              Open meeting link
            </a>
          )}
        </div>
      )}
    </section>
  );
}

export function CompactTag({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 12px",
        background: "rgba(248,250,252,0.8)",
        border: "1px solid rgba(15,23,42,0.04)",
        borderRadius: "var(--wm-radius-10)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 11.5, fontWeight: 700, color: CAREER_MUTED }}>{label}:</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: CAREER_TEXT }}>{value}</span>
    </div>
  );
}

export function CandidateContactPanel({ phone, email }: { phone: string; email: string }) {
  const hasPhone = phone.trim().length > 0;
  const hasEmail = email.trim().length > 0;
  if (!hasPhone && !hasEmail) return null;

  return (
    <div
      style={{
        marginTop: 16,
        padding: "12px",
        borderRadius: "var(--wm-radius-10)",
        background: "rgba(239,246,255,0.5)",
        border: "1px solid #e0e7ff",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 900,
          color: CAREER_BLUE,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          marginBottom: 8,
        }}
      >
        Contact Details
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {hasPhone && (
          <div style={{ fontSize: 13, fontWeight: 800, color: CAREER_TEXT }}>📞 {phone}</div>
        )}
        {hasEmail && (
          <div style={{ fontSize: 13, fontWeight: 800, color: CAREER_TEXT }}>✉️ {email}</div>
        )}
      </div>
    </div>
  );
}

export function BackupSuggestionBadge() {
  return (
    <span
      style={{
        padding: "4px 8px",
        borderRadius: "var(--wm-radius-8)",
        background: "#fffbeb",
        color: "#92400e",
        border: "1px solid #fde68a",
        fontSize: 11,
        fontWeight: 800,
      }}
    >
      Backup
    </span>
  );
}
