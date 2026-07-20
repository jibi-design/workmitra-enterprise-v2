// App name: Job Mitra
// File name: JobPublicDetailsSection.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\shiftPostDetails\JobPublicDetailsSection.tsx

import { DetailBox } from "./DetailBox";
import {
  CARD_STYLE,
  DETAIL_GRID_STYLE,
  SECTION_TEXT_STYLE,
  SECTION_TITLE_STYLE,
  SHIFT_GREEN,
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
    <div className="wm-ee-card" style={CARD_STYLE}>
      <div style={SECTION_TITLE_STYLE}>Job details</div>

      {description && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 14,
            background: "rgba(248,250,252,0.96)",
            border: "1px solid rgba(226,232,240,0.9)",
          }}
        >
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
      )}

      <div style={DETAIL_GRID_STYLE}>
        <DetailBox label="Category" value={category || "Not listed"} />
        <DetailBox label="Shift timing" value={shiftTiming || "Not specified"} />
        <DetailBox label="Job type" value={jobType} />
        <DetailBox label="Vacancies" value={vacancyText} />
        <DetailBox label="Date range" value={fmtDateRange(post.startAt, post.endAt)} />
        <DetailBox label="Experience" value={expLabel(post.experience)} />
      </div>

      {reportingAddress && (
        <div
          style={{
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 14,
            background: "rgba(248,250,252,0.96)",
            border: "1px solid rgba(226,232,240,0.9)",
          }}
        >
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
      )}

      {mapsLink && (
        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            marginTop: 10,
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(22,163,74,0.18)",
            background: "rgba(22,163,74,0.07)",
            color: SHIFT_GREEN,
            fontSize: 12,
            fontWeight: 900,
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          Open map link
        </a>
      )}
    </div>
  );
}
