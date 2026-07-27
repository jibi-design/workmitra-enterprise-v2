import type { CareerTab } from "./CareerPipelineTabs.helpers";
import { TAB_HELPERS, TAB_ICONS, TAB_LABELS } from "./CareerPipelineTabs.helpers";
import {
  CAREER_AMBER,
  CAREER_AMBER_DEEP,
  CAREER_BLUE,
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  CAREER_TEXT,
  getCardBackground,
  getCardBorder,
  getCardShadow,
  getCountBackground,
  getCountBorder,
  getCountColor,
} from "./CareerPipelineTabs.styles";

export function PipelineCard({
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
          borderRadius: "var(--wm-radius-chip)",
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
            borderRadius: "var(--wm-radius-button)",
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
