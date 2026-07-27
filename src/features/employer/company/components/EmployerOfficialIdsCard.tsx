/** Mitra Executive — plain-English official IDs card (employer profile, private). */

import { ID_FORMAT_HINT } from "../../../../shared/identity/constants/idConstants";

const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "rgba(124,58,237,0.08)";

const EXECUTIVE_SHELL = {
  marginTop: 12,
  padding: 18,
  borderRadius: "var(--wm-radius-employer-card)",
  background:
    "linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(250,245,255,0.9) 52%, rgba(255,255,255,0.88) 100%)",
  border: "1px solid rgba(255,255,255,0.4)",
  boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
  overflow: "hidden",
  position: "relative",
} as const;

type IdPillProps = {
  readonly title: string;
  readonly badge: string;
  readonly badgeTone: "private" | "public";
  readonly description: string;
  readonly idValue: string | undefined;
  readonly onCopy: () => void;
  readonly accent: string;
};

function IdPill({ title, badge, badgeTone, description, idValue, onCopy, accent }: IdPillProps) {
  const hasId = Boolean(idValue);
  const badgeStyles =
    badgeTone === "private"
      ? { background: "rgba(3,105,161,0.1)", color: "#0369a1" }
      : { background: PURPLE_LIGHT, color: PURPLE };

  return (
    <div
      style={{
        padding: 14,
        borderRadius: "var(--wm-radius-chip)",
        background: "rgba(255,255,255,0.72)",
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a" }}>{title}</div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            padding: "3px 9px",
            borderRadius: "var(--wm-radius-pill)",
            letterSpacing: 0.3,
            ...badgeStyles,
          }}
        >
          {badge}
        </span>
      </div>

      <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
        {description}
      </div>

      {hasId ? (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: 1.6,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              wordBreak: "break-word",
              lineHeight: 1.3,
              flex: 1,
              minWidth: 0,
            }}
          >
            {idValue}
          </div>
          <button
            type="button"
            onClick={onCopy}
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              borderRadius: "var(--wm-radius-10)",
              border: `1px solid ${accent}40`,
              background: `${accent}10`,
              color: accent,
              fontSize: 11,
              fontWeight: 900,
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Copy
          </button>
        </div>
      ) : (
        <div style={{ marginTop: 10, fontSize: 12, color: "#94a3b8", fontWeight: 600 }}>
          Save your business profile to generate this ID.
        </div>
      )}
    </div>
  );
}

export type EmployerOfficialIdsCardProps = {
  readonly personalAccountId: string | undefined;
  readonly publicBusinessId: string | undefined;
  readonly onCopyPersonal: () => void;
  readonly onCopyPublic: () => void;
};

export function EmployerOfficialIdsCard({
  personalAccountId,
  publicBusinessId,
  onCopyPersonal,
  onCopyPublic,
}: EmployerOfficialIdsCardProps) {
  const hasAnyId = Boolean(personalAccountId || publicBusinessId);

  return (
    <section style={EXECUTIVE_SHELL} data-testid="employer-official-ids-card">
      <div
        style={{
          position: "absolute",
          top: -44,
          right: -44,
          width: 128,
          height: 128,
          borderRadius: "50%",
          background: "rgba(124,58,237,0.06)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            color: PURPLE,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          Your account
        </div>
        <h2
          style={{
            marginTop: 4,
            fontSize: 18,
            fontWeight: 950,
            color: "#0f172a",
            lineHeight: 1.25,
          }}
        >
          Your Official Mitra IDs
        </h2>
        <p
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "var(--wm-er-muted)",
            lineHeight: 1.55,
            fontWeight: 500,
          }}
        >
          Only you can see this card. Use your public business ID when workers look up your company.
        </p>

        {hasAnyId ? (
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            <IdPill
              title="Personal Account ID"
              badge="Private"
              badgeTone="private"
              description="For your settings, security, and billing — not shown on job posts."
              idValue={personalAccountId}
              onCopy={onCopyPersonal}
              accent="#0369a1"
            />
            <IdPill
              title="Public Business ID"
              badge="Public"
              badgeTone="public"
              description="Visible to workers on job posts and when they review your business."
              idValue={publicBusinessId}
              onCopy={onCopyPublic}
              accent={PURPLE}
            />
          </div>
        ) : (
          <div
            style={{
              marginTop: 14,
              padding: 14,
              borderRadius: "var(--wm-radius-chip)",
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(245,158,11,0.22)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 900, color: "#b45309" }}>
              IDs not created yet
            </div>
            <div
              style={{ marginTop: 6, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.55 }}
            >
              Add your name and company name, then save your business profile.
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#92400e", fontWeight: 800 }}>
              Format: {ID_FORMAT_HINT}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
