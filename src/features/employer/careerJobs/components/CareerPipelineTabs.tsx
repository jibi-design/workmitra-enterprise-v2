// App name: Job Mitra
// File name: CareerPipelineTabs.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\careerJobs\components\CareerPipelineTabs.tsx

export type CareerTab =
  "applied" | "backup" | "shortlisted" | "interview" | "offered" | "hired" | "rejected";

const PRIMARY_TABS: readonly CareerTab[] = ["applied", "backup", "shortlisted"] as const;
const SECONDARY_TABS: readonly CareerTab[] = ["interview", "offered", "hired", "rejected"] as const;

const TAB_LABELS: Record<CareerTab, string> = {
  applied: "Applied",
  backup: "Backup",
  shortlisted: "Shortlist",
  interview: "Interview",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};
const TAB_HELPERS: Record<CareerTab, string> = {
  applied: "New queue",
  backup: "Reserve list",
  shortlisted: "Next action",
  interview: "Rounds",
  offered: "Offers",
  hired: "Hired",
  rejected: "Closed",
};
const TAB_ICONS: Record<CareerTab, string> = {
  applied: "📥",
  backup: "📦",
  shortlisted: "⭐",
  interview: "💬",
  offered: "🤝",
  hired: "🎉",
  rejected: "❌",
};

type Props = {
  activeTab: CareerTab;
  counts: Record<CareerTab, number>;
  onTabChange: (tab: CareerTab) => void;
};

const CAREER_BLUE = "var(--wm-er-accent-career, #2563eb)";
const CAREER_BLUE_DEEP = "#1e3a8a";
const CAREER_TEXT = "var(--wm-er-text, #0f172a)";
const CAREER_MUTED = "var(--wm-er-muted, #64748b)";
const CAREER_AMBER = "#d97706";
const CAREER_AMBER_DEEP = "#92400e";

const TAB_INTERACTIONS = `
  .wm-pipeline-btn {
    transition: all 0.3s var(--wm-motion-spring) !important;
  }
  .wm-pipeline-btn:hover {
    transform: translateX(4px) !important;
  }
  .wm-pipeline-btn:active {
    transform: scale(0.98) !important;
  }
  
  @keyframes activePulseNode {
    0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.3); }
    70% { box-shadow: 0 0 0 8px rgba(37, 99, 235, 0); }
    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
  }
  .wm-node-pulse {
    animation: activePulseNode 2s infinite;
  }
`;

export function CareerPipelineTabs({ activeTab, counts, onTabChange }: Props) {
  const laterPipelineCount = counts.interview + counts.offered + counts.hired;

  return (
    <section
      className="wm-premium-widget"
      style={{
        padding: 28,
        borderRadius: 28,
        border: "1px solid rgba(255, 255, 255, 0.9)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(248,250,252,0.8))",
        boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255,255,255,1)",
        backdropFilter: "blur(24px)",
      }}
    >
      <style>{TAB_INTERACTIONS}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
          marginBottom: 24,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 12px",
              borderRadius: 12,
              background: "rgba(37,99,235,0.08)",
              border: "1px solid rgba(37,99,235,0.12)",
              color: CAREER_BLUE_DEEP,
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Working pipeline
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 18,
              fontWeight: 900,
              color: CAREER_TEXT,
              lineHeight: 1.2,
              letterSpacing: "-0.3px",
            }}
          >
            Candidate Command Center
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              fontWeight: 700,
              color: CAREER_MUTED,
              lineHeight: 1.5,
            }}
          >
            Manage the active hiring queue through the pipeline stages.
          </div>
        </div>
      </div>

      <div style={{ position: "relative", paddingLeft: 20 }}>
        <div
          style={{
            position: "absolute",
            left: 35,
            top: 16,
            bottom: 16,
            width: 3,
            background:
              "linear-gradient(to bottom, rgba(37,99,235,0.3) 0%, rgba(226,232,240,1) 50%, rgba(226,232,240,0.5) 100%)",
            borderRadius: 2,
            zIndex: 0,
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 16,
            position: "relative",
            zIndex: 1,
          }}
        >
          {PRIMARY_TABS.map((tab) => (
            <PipelineCard
              key={tab}
              tab={tab}
              activeTab={activeTab}
              count={counts[tab]}
              primary
              onTabChange={onTabChange}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          paddingTop: 20,
          borderTop: "1px dashed rgba(0,0,0,0.1)",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: CAREER_MUTED,
              textTransform: "uppercase",
              letterSpacing: 0.8,
            }}
          >
            Later pipeline stages
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              color: CAREER_BLUE_DEEP,
              background: "rgba(37,99,235,0.08)",
              padding: "4px 10px",
              borderRadius: 8,
            }}
          >
            {laterPipelineCount} active
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {SECONDARY_TABS.map((tab) => (
            <PipelineCard
              key={tab}
              tab={tab}
              activeTab={activeTab}
              count={counts[tab]}
              primary={false}
              onTabChange={onTabChange}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PipelineCard({
  tab,
  activeTab,
  count,
  primary,
  onTabChange,
}: {
  tab: CareerTab;
  activeTab: CareerTab;
  count: number;
  primary: boolean;
  onTabChange: (tab: CareerTab) => void;
}) {
  const isActive = activeTab === tab;
  const hasCount = count > 0;
  const isBackup = tab === "backup";
  const accent = isBackup ? CAREER_AMBER : CAREER_BLUE;
  const deep = isBackup ? CAREER_AMBER_DEEP : CAREER_BLUE_DEEP;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {primary && (
        <div
          className={isActive ? "wm-node-pulse" : ""}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: isActive ? accent : "#ffffff",
            border: `3px solid ${isActive ? accent : "#e2e8f0"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            transition: "all var(--wm-motion-base) var(--wm-motion-spring)",
            boxShadow: isActive
              ? `0 4px 12px ${isBackup ? "rgba(217,119,6,0.3)" : "rgba(37,99,235,0.3)"}`
              : "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          {isActive ? (
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffffff" }} />
          ) : (
            <div style={{ fontSize: 13 }}>{TAB_ICONS[tab]}</div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => onTabChange(tab)}
        className="wm-pipeline-btn"
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          minWidth: 0,
          minHeight: primary ? 64 : 56,
          padding: primary ? "14px 16px" : "12px 14px",
          borderRadius: 16,
          border: getCardBorder(isActive, isBackup, hasCount, primary),
          background: getCardBackground(isActive, isBackup, hasCount, primary),
          color: isActive || hasCount ? deep : CAREER_TEXT,
          cursor: "pointer",
          boxShadow: getCardShadow(isActive, isBackup, primary),
          textAlign: "left",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {!primary && <span style={{ fontSize: 14 }}>{TAB_ICONS[tab]}</span>}
            <div
              style={{
                fontSize: primary ? 14 : 13,
                fontWeight: isActive || hasCount ? 900 : 800,
                lineHeight: 1.2,
                color: isActive || hasCount ? deep : CAREER_TEXT,
              }}
            >
              {TAB_LABELS[tab]}
            </div>
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: primary ? 12 : 11,
              fontWeight: 700,
              color: isActive || hasCount ? "rgba(51,65,85,0.8)" : CAREER_MUTED,
              lineHeight: 1.3,
            }}
          >
            {TAB_HELPERS[tab]}
          </div>
        </div>

        <span
          style={{
            minWidth: primary ? 32 : 28,
            height: primary ? 32 : 28,
            padding: "0 10px",
            borderRadius: 12,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: getCountBackground(isActive, isBackup, hasCount),
            color: getCountColor(isActive, isBackup, hasCount),
            border: getCountBorder(isActive, isBackup, hasCount),
            fontSize: primary ? 14 : 13,
            fontWeight: 900,
            lineHeight: 1,
            boxShadow:
              isActive && hasCount
                ? `0 8px 16px ${isBackup ? "rgba(217,119,6,0.2)" : "rgba(37,99,235,0.2)"}`
                : "none",
          }}
        >
          {count}
        </span>
      </button>
    </div>
  );
}

function getCardBorder(
  isActive: boolean,
  isBackup: boolean,
  hasCount: boolean,
  primary: boolean,
): string {
  if (isActive && isBackup) return "1px solid rgba(217,119,6,0.5)";
  if (isActive) return "1px solid rgba(37,99,235,0.5)";
  if (primary && hasCount && isBackup) return "1px solid rgba(217,119,6,0.25)";
  if (primary && hasCount) return "1px solid rgba(37,99,235,0.25)";
  return "1px solid rgba(0,0,0,0.06)";
}

function getCardBackground(
  isActive: boolean,
  isBackup: boolean,
  hasCount: boolean,
  primary: boolean,
): string {
  if (isActive && isBackup)
    return "linear-gradient(135deg, rgba(254,243,199,0.95), rgba(255,255,255,1))";
  if (isActive) return "linear-gradient(135deg, rgba(239,246,255,0.95), rgba(255,255,255,1))";
  if (primary && hasCount && isBackup) return "rgba(255,251,235,0.9)";
  if (primary && hasCount) return "rgba(248,250,252,0.9)";
  return "rgba(255,255,255,0.7)";
}

function getCardShadow(isActive: boolean, isBackup: boolean, primary: boolean): string {
  if (!isActive) return "0 4px 12px rgba(0,0,0,0.02)";
  if (isBackup)
    return primary ? "0 12px 24px rgba(217,119,6,0.1)" : "0 8px 16px rgba(217,119,6,0.08)";
  return primary ? "0 12px 24px rgba(37,99,235,0.1)" : "0 8px 16px rgba(37,99,235,0.08)";
}

function getCountBackground(isActive: boolean, isBackup: boolean, hasCount: boolean): string {
  if (hasCount && isActive)
    return isBackup
      ? "linear-gradient(135deg, #d97706, #b45309)"
      : "linear-gradient(135deg, #2563eb, #1d4ed8)";
  if (hasCount && isBackup) return "rgba(217,119,6,0.15)";
  if (hasCount) return "rgba(37,99,235,0.15)";
  return "rgba(15,23,42,0.04)";
}

function getCountColor(isActive: boolean, isBackup: boolean, hasCount: boolean): string {
  if (hasCount && isActive) return "#fff";
  if (hasCount && isBackup) return CAREER_AMBER_DEEP;
  if (hasCount) return CAREER_BLUE_DEEP;
  return "rgba(15,23,42,0.4)";
}

function getCountBorder(isActive: boolean, isBackup: boolean, hasCount: boolean): string {
  if (hasCount && isActive) return "1px solid transparent";
  if (hasCount && isBackup) return "1px solid rgba(217,119,6,0.2)";
  if (hasCount) return "1px solid rgba(37,99,235,0.2)";
  return "1px solid rgba(0,0,0,0.04)";
}
