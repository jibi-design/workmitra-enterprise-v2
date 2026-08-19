// App name: Job Mitra | ShiftCreateFormHeader.tsx — DomainHero (Wave 2)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { MitraLabsIdLabel } from "../../../../shared/components/brand/MitraLabsIdLabel";

type Props = {
  isTemplate: boolean;
  groupPreview: string;
  employerMlId?: string;
};

export function ShiftCreateFormHeader({ isTemplate, groupPreview, employerMlId = "" }: Props) {
  return (
    <>
      <DomainHero
        variant="shift"
        audience="employer"
        icon={<CreateHeroIcon />}
        title={isTemplate ? "New shift from template" : "Create new shift"}
        subtitle={
          isTemplate
            ? "Review the template details before publishing."
            : "Build a clear shift post before workers see it."
        }
        description="Add the role, worker count, schedule, pay, location, and requirements. You will review the post before it goes live."
        trailing={isTemplate ? <span className="wm-domainHeroBadge">Template</span> : undefined}
      />

      {isTemplate ? (
        <div
          className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-shift-surface-glass--compact"
          role="status"
          style={{
            color: "var(--wm-er-accent-shift, #16a34a)",
            fontSize: 12,
            fontWeight: 800,
            lineHeight: 1.45,
          }}
        >
          Template pre-filled. Review the date, pay, worker count, and requirements before
          publishing.
        </div>
      ) : null}

      {employerMlId.trim().length > 0 ? (
        <div
          className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-shift-surface-glass--compact"
          style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
        >
          <div
            aria-hidden="true"
            style={{
              width: 26,
              height: 26,
              borderRadius: "var(--wm-radius-10)",
              background: "rgba(22,163,74,0.1)",
              color: "var(--wm-er-accent-shift, #16a34a)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 2 4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3Zm0 2.18 6 2.25V11c0 4.39-2.75 8.45-6 9.84C8.75 19.45 6 15.39 6 11V6.43l6-2.25Zm-1 11.23 6-6L15.59 8 11 12.59 8.91 10.5 7.5 11.91 11 15.41Z"
              />
            </svg>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
              Your <MitraLabsIdLabel /> will be visible to applicants.
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: 12,
                fontWeight: 950,
                color: "var(--wm-er-text)",
                letterSpacing: 0.2,
                wordBreak: "break-word",
              }}
            >
              {employerMlId}
            </div>
          </div>
        </div>
      ) : null}

      <div className="wm-shift-surface-glass wm-shift-surface-glass--shift">
        <div
          style={{
            fontSize: 10,
            fontWeight: 900,
            color: "var(--wm-er-muted)",
            textTransform: "uppercase",
            letterSpacing: 0.6,
          }}
        >
          Group name preview
        </div>

        <div
          style={{
            marginTop: 5,
            fontSize: 15,
            fontWeight: 950,
            color: "var(--wm-er-accent-shift, #16a34a)",
            lineHeight: 1.35,
          }}
        >
          {groupPreview}
        </div>

        <div style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          This name is used later if confirmed workers are assigned to a shift group.
        </div>
      </div>
    </>
  );
}

function CreateHeroIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7Zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.58 8 8-3.59 8-8 8Z"
      />
    </svg>
  );
}
