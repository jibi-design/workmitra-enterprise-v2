import type { AppLite } from "../../types/careerApplicationTypes";
import {
  CAREER_MUTED,
  CAREER_TEXT,
  formatScheduleDate,
  formatScheduleMode,
  formatScheduleTime,
  isExternalMeetingLink,
} from "./CareerApplicationCard.helpers";

export function CareerApplicationInterviewSection({
  app,
  onAcceptInterview,
  onDeclineInterview,
}: {
  app: AppLite;
  onAcceptInterview?: () => void;
  onDeclineInterview?: () => void;
}) {
  const scheduledInterview = app.nextScheduledInterview;
  if (!scheduledInterview) return null;

  const hasMeetingLink = isExternalMeetingLink(scheduledInterview.meetingLink);
  const canRespondToInterview =
    app.stage === "interview" &&
    scheduledInterview &&
    (!scheduledInterview.rsvpStatus || scheduledInterview.rsvpStatus === "pending");
  const interviewRsvpAccepted = scheduledInterview.rsvpStatus === "accepted";

  return (
    <section
      style={{
        marginTop: 18,
        padding: 16,
        borderRadius: "var(--wm-radius-employee-card)",
        border: "1px solid rgba(29,78,216,0.13)",
        background: "linear-gradient(135deg, rgba(239,246,255,0.86), rgba(255,255,255,0.94))",
        boxShadow: "0 10px 24px rgba(29,78,216,0.055)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 950,
              color: "#1e40af",
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
            {scheduledInterview.label}
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
        <ScheduleMeta label="Date" value={formatScheduleDate(scheduledInterview.scheduledDate)} />
        <ScheduleMeta label="Time" value={formatScheduleTime(scheduledInterview.scheduledTime)} />
        <ScheduleMeta label="Mode" value={formatScheduleMode(scheduledInterview.mode)} />
      </div>

      {(scheduledInterview.location || hasMeetingLink) && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(255,255,255,0.74)",
            border: "1px solid rgba(29,78,216,0.09)",
            fontSize: 12,
            fontWeight: 780,
            color: CAREER_MUTED,
            lineHeight: 1.45,
            overflowWrap: "anywhere",
          }}
        >
          {scheduledInterview.location && (
            <div>
              <b style={{ color: CAREER_TEXT }}>
                {scheduledInterview.mode === "phone" ? "Contact note" : "Location"}:
              </b>{" "}
              {scheduledInterview.location}
            </div>
          )}

          {hasMeetingLink && (
            <a
              href={scheduledInterview.meetingLink}
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                marginTop: scheduledInterview.location ? 8 : 0,
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

      {canRespondToInterview && (
        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onAcceptInterview}
            style={{
              flex: 1,
              minWidth: 140,
              minHeight: 44,
              borderRadius: "var(--wm-radius-chip)",
              border: "none",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 8px 20px rgba(37,99,235,0.22)",
            }}
          >
            Accept Interview
          </button>
          <button
            type="button"
            onClick={onDeclineInterview}
            style={{
              flex: 1,
              minWidth: 140,
              minHeight: 44,
              borderRadius: "var(--wm-radius-chip)",
              border: "1px solid rgba(220,38,38,0.25)",
              background: "rgba(254,242,242,0.9)",
              color: "#b91c1c",
              fontSize: 13,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Decline Interview
          </button>
        </div>
      )}

      {interviewRsvpAccepted && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: "var(--wm-radius-button)",
            background: "rgba(240,253,244,0.9)",
            border: "1px solid rgba(22,163,74,0.2)",
            fontSize: 12,
            fontWeight: 800,
            color: "#15803d",
          }}
        >
          You accepted this interview invite.
        </div>
      )}
    </section>
  );
}

function ScheduleMeta({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "9px 10px",
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(255,255,255,0.76)",
        border: "1px solid rgba(29,78,216,0.08)",
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
