// App name: Job Mitra
// Facade — CareerApplicationCard.tsx

import { EmployerTrustBadge } from "../../../../../shared/employerProfile/EmployerTrustBadge";
import {
  explanationForStage,
  fmtDateTime,
  stageLabel,
} from "../../helpers/careerApplicationHelpers";
import { fmtJobType, fmtWorkMode, type CareerSearchPost } from "../../helpers/careerSearchHelpers";
import {
  canShowCareerWithdraw,
  isCareerWithdrawOnlineBlocked,
} from "../../services/careerApplyService";
import type { AppLite } from "../../types/careerApplicationTypes";
import {
  CareerApplicationStatusTracker,
  CareerApplicationFooter,
  CareerInterviewProgress,
  CareerOfferDetails,
} from "./CareerApplicationCardParts";
import {
  CARD_INTERACTIONS,
  CAREER_MUTED,
  CAREER_TEXT,
  cardLeftColor,
  statusPillClass,
} from "./CareerApplicationCard.helpers";
import { CareerApplicationInterviewSection } from "./CareerApplicationCardInterviewSection";

export function AppCard({
  app,
  post,
  isPulseActive = false,
  onOpen,
  onWithdraw,
  onAcceptOffer,
  onDeclineOffer,
  onAcceptInterview,
  onDeclineInterview,
}: {
  app: AppLite;
  post?: CareerSearchPost;
  isPulseActive?: boolean;
  onOpen: () => void;
  onWithdraw: () => void;
  onAcceptOffer?: () => void;
  onDeclineOffer?: () => void;
  onAcceptInterview?: () => void;
  onDeclineInterview?: () => void;
}) {
  const title = post?.jobTitle ?? "Career Position";
  const company = post?.companyName ?? "Company";
  const sub = post
    ? [fmtJobType(post.jobType), fmtWorkMode(post.workMode), post.location]
        .filter(Boolean)
        .join(" • ")
    : "";
  const totalRounds = post?.interviewRounds ?? 0;
  const explanation = explanationForStage(app, totalRounds);
  const canWithdraw = canShowCareerWithdraw(app.stage);
  const withdrawOnlineBlocked = isCareerWithdrawOnlineBlocked();

  return (
    <article
      className="wm-career-card wm-app-card wm-press-card"
      aria-label={`${title} at ${company}, status ${stageLabel(app)}`}
      style={{
        padding: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{CARD_INTERACTIONS}</style>

      {!isPulseActive && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background: `linear-gradient(to bottom, ${cardLeftColor(app.stage)} 0%, ${cardLeftColor(app.stage)}90 100%)`,
          }}
        />
      )}

      <div style={{ paddingLeft: 12 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <button
            type="button"
            onClick={onOpen}
            style={{
              minWidth: 0,
              flex: 1,
              fontSize: 16,
              fontWeight: 700,
              color: CAREER_TEXT,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
              lineHeight: 1.25,
              outline: "none",
            }}
          >
            {title}
          </button>

          <span className={statusPillClass(app.stage)} style={{ flexShrink: 0 }}>
            {stageLabel(app)}
          </span>
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 14,
            fontWeight: 700,
            color: CAREER_MUTED,
            lineHeight: 1.4,
          }}
        >
          {company}
        </div>

        <div style={{ marginTop: 12 }}>
          <EmployerTrustBadge variant="compact" accentColor="#f59e0b" />
        </div>

        {sub && (
          <div
            style={{
              marginTop: 12,
              display: "inline-flex",
              maxWidth: "100%",
              padding: "6px 12px",
              borderRadius: "var(--wm-radius-button)",
              background: "rgba(248,250,252,0.8)",
              border: "1px solid rgba(0,0,0,0.05)",
              color: CAREER_MUTED,
              fontSize: 12,
              fontWeight: 800,
              lineHeight: 1.3,
            }}
          >
            {sub}
          </div>
        )}

        <CareerInterviewProgress app={app} totalRounds={totalRounds} />

        <CareerApplicationInterviewSection
          app={app}
          onAcceptInterview={onAcceptInterview}
          onDeclineInterview={onDeclineInterview}
        />

        {explanation && (
          <CareerApplicationStatusTracker
            app={app}
            title={explanation.title}
            body={explanation.body}
          />
        )}

        <CareerOfferDetails
          app={app}
          onAcceptOffer={onAcceptOffer}
          onDeclineOffer={onDeclineOffer}
        />

        <CareerApplicationFooter
          appliedAt={app.appliedAt}
          canWithdraw={canWithdraw}
          withdrawOnlineBlocked={withdrawOnlineBlocked}
          onWithdraw={onWithdraw}
          onOpen={onOpen}
          formatDateTime={fmtDateTime}
        />
      </div>
    </article>
  );
}
