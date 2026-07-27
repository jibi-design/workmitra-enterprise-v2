// App name: Job Mitra
// File name: CareerPipelineTabs.tsx

export type { CareerTab } from "./CareerPipelineTabs.helpers";
export { PRIMARY_TABS, SECONDARY_TABS } from "./CareerPipelineTabs.helpers";

import { PRIMARY_TABS, SECONDARY_TABS } from "./CareerPipelineTabs.helpers";
import type { CareerPipelineTabsProps } from "./CareerPipelineTabs.helpers";
import { PipelineCard } from "./CareerPipelineTabs.parts";
import {
  CAREER_BLUE_DEEP,
  CAREER_MUTED,
  EYEBROW_STYLE,
  SECTION_STYLE,
  SUBTITLE_STYLE,
  TAB_INTERACTIONS,
  TITLE_STYLE,
} from "./CareerPipelineTabs.styles";

export function CareerPipelineTabs({ activeTab, counts, onTabChange }: CareerPipelineTabsProps) {
  const laterPipelineCount = counts.interview + counts.offered + counts.hired;

  return (
    <section className="wm-premium-widget" style={SECTION_STYLE}>
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
          <div style={EYEBROW_STYLE}>Working pipeline</div>
          <div style={TITLE_STYLE}>Candidate Command Center</div>
          <div style={SUBTITLE_STYLE}>
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
            borderRadius: "var(--wm-radius-8)",
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
              borderRadius: "var(--wm-radius-8)",
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
