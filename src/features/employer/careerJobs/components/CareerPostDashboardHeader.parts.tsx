// App name: Job Mitra | CareerPostDashboardHeader.parts.tsx — actions + meta (full Career)

import type { CareerJobPost } from "../types/careerTypes";
import {
  CAREER_TEXT,
  formatJobType,
  formatSalary,
  formatWorkMode,
  HEADER_INTERACTIONS,
} from "./CareerPostDashboardHeader.styles";

function InfoPill({ icon, label }: { icon: string; label: string }) {
  return (
    <span
      style={{
        padding: "8px 12px",
        borderRadius: "var(--wm-radius-button)",
        background: "rgba(255,255,255,0.9)",
        border: "1px solid rgba(0,0,0,0.06)",
        color: CAREER_TEXT,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1.2,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
      }}
    >
      <span style={{ fontSize: 13 }} aria-hidden="true">
        {icon}
      </span>
      {label}
    </span>
  );
}

function CommandButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: "primary" | "neutral" | "danger";
  onClick: () => void;
}) {
  const className =
    variant === "primary"
      ? "wm-primarybtn"
      : variant === "danger"
        ? "wm-dangerBtn"
        : "wm-outlineBtn";

  return (
    <button type="button" onClick={onClick} className={className} aria-label={label}>
      {label}
    </button>
  );
}

type HeaderActionsProps = {
  post: CareerJobPost;
  onPause: () => void;
  onResume: () => void;
  onClose: () => void;
  onRepost: () => void;
};

export function CareerPostDashboardHeaderActions({
  post,
  onPause,
  onResume,
  onClose,
  onRepost,
}: HeaderActionsProps) {
  return (
    <div className="wm-hero-actions" style={{ marginTop: "var(--wm-stack-gap)" }}>
      <style>{HEADER_INTERACTIONS}</style>
      {post.status === "active" ? (
        <CommandButton label="Pause Applications" variant="neutral" onClick={onPause} />
      ) : null}
      {post.status === "paused" ? (
        <CommandButton label="Resume Receiving" variant="primary" onClick={onResume} />
      ) : null}
      {post.status === "closed" || post.status === "filled" ? (
        <CommandButton label="Create Similar Job" variant="primary" onClick={onRepost} />
      ) : null}
      {post.status !== "closed" && post.status !== "filled" ? (
        <CommandButton label="Close Job Post" variant="danger" onClick={onClose} />
      ) : null}
    </div>
  );
}

export function CareerPostDashboardMetaPills({ post }: { post: CareerJobPost }) {
  const workSummary = `${formatJobType(post.jobType)} / ${formatWorkMode(post.workMode)}`;

  return (
    <div className="wm-info-pill-container" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <InfoPill icon="💼" label={workSummary} />
      <InfoPill icon="💰" label={formatSalary(post)} />
    </div>
  );
}
