// App name: Job Mitra | JobPublicDetailsSection.tsx — surface-glass (post-details polish)

import { DetailBox } from "./DetailBox";
import {
  DETAIL_GRID_STYLE,
  SECTION_PAD,
  SECTION_TEXT_STYLE,
  SECTION_TITLE_STYLE,
} from "./shiftPostDetail.styles";
import { formatJobType, getCleanText } from "./shiftPostDetail.utils";
import { expLabel, fmtDateRange, type ShiftPostDemo } from "../../helpers/shiftApplyHelpers";

export function JobPublicDetailsSection({ post }: { readonly post: ShiftPostDemo }) {
  const description = getCleanText(post.description);
  const category = getCleanText(post.category);
  const shiftTiming = getCleanText(post.shiftTiming);
  const mapsLink = getCleanText(post.mapsLink);
  const reportingAddress = getCleanText(post.locationAddress);
  const jobType = formatJobType(post.jobType);
  const vacancyText =
    typeof post.vacancies === "number" && post.vacancies > 0
      ? `${post.vacancies} ${post.vacancies === 1 ? "worker" : "workers"} needed`
      : "Not listed";

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-animateIn"
      data-testid="shift-post-job-details"
      style={{ ...SECTION_PAD, animationDelay: "40ms" }}
    >
      <div style={SECTION_TITLE_STYLE}>Job details</div>

      {description ? (
        <div className="wm-shift-surface-glass" style={{ marginBottom: 12, padding: "10px 12px" }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              color: "var(--wm-er-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.35,
            }}
          >
            Description
          </div>
          <div style={{ marginTop: 5, ...SECTION_TEXT_STYLE }}>{description}</div>
        </div>
      ) : null}

      <div style={DETAIL_GRID_STYLE}>
        <DetailBox label="Category" value={category || "Not listed"} />
        <DetailBox label="Shift timing" value={shiftTiming || "Not specified"} />
        <DetailBox label="Job type" value={jobType} />
        <DetailBox label="Vacancies" value={vacancyText} />
        <DetailBox label="Date range" value={fmtDateRange(post.startAt, post.endAt)} />
        <DetailBox label="Experience" value={expLabel(post.experience)} />
      </div>

      {reportingAddress ? (
        <div className="wm-shift-surface-glass" style={{ marginTop: 10, padding: "10px 12px" }}>
          <div
            style={{
              fontSize: 9,
              fontWeight: 900,
              color: "var(--wm-er-muted)",
              textTransform: "uppercase",
              letterSpacing: 0.35,
            }}
          >
            Reporting address
          </div>
          <div style={{ marginTop: 5, ...SECTION_TEXT_STYLE }}>{reportingAddress}</div>
        </div>
      ) : null}

      {mapsLink ? (
        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
          className="wm-outlineBtn wm-shift-pressable"
          style={{
            display: "inline-flex",
            width: "100%",
            marginTop: 10,
            minHeight: 44,
            justifyContent: "center",
            textDecoration: "none",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          Open map link
        </a>
      ) : null}
    </section>
  );
}
