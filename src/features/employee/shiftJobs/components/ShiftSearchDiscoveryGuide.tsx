// App name: Job Mitra
// File name: ShiftSearchDiscoveryGuide.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\shiftJobs\components\ShiftSearchDiscoveryGuide.tsx

import type { CSSProperties } from "react";

type ShiftSearchDiscoveryGuideProps = {
  city?: string;
  hasSkills?: boolean;
  isProfileReady?: boolean;
  onOpenProfile?: () => void;
};

const SHIFT_GREEN = "#16a34a";
const SHIFT_GREEN_SOFT = "rgba(22, 163, 74, 0.1)";
const SHIFT_GREEN_BORDER = "rgba(22, 163, 74, 0.2)";

const CARD_STYLE: CSSProperties = {
  marginTop: 12,
  padding: 14,
  borderRadius: "var(--wm-radius-employee-card)",
  border: `1px solid ${SHIFT_GREEN_BORDER}`,
  background: "linear-gradient(180deg, rgba(240,253,244,0.82), rgba(255,255,255,0.98))",
  boxShadow: "0 10px 24px rgba(22, 163, 74, 0.08)",
};

const TITLE_STYLE: CSSProperties = {
  display: "inline-block",
  minWidth: 112,
  fontSize: 14,
  fontWeight: 950,
  color: "var(--wm-er-text)",
  lineHeight: 1.3,
  whiteSpace: "nowrap",
  wordBreak: "normal",
  overflowWrap: "normal",
  flexShrink: 0,
};

export function ShiftSearchDiscoveryGuide({
  city = "",
  hasSkills = false,
  isProfileReady = false,
  onOpenProfile,
}: ShiftSearchDiscoveryGuideProps) {
  const cityDisplay = getSafeCityDisplay(city);
  const hasSafeCity = cityDisplay !== "Not set";
  const profileReadyDisplay = hasSafeCity && hasSkills && isProfileReady;

  return (
    <section style={CARD_STYLE}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={TITLE_STYLE}>Work location</div>

          <div style={{ marginTop: 5, fontSize: 12, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            Shift results use your current city and profile details to improve matching.
          </div>
        </div>

        <span
          style={{
            padding: "5px 9px",
            borderRadius: "var(--wm-radius-pill)",
            background: profileReadyDisplay ? SHIFT_GREEN_SOFT : "rgba(217,119,6,0.08)",
            border: profileReadyDisplay
              ? `1px solid ${SHIFT_GREEN_BORDER}`
              : "1px solid rgba(217,119,6,0.18)",
            color: profileReadyDisplay ? SHIFT_GREEN : "#92400e",
            fontSize: 10,
            fontWeight: 950,
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {profileReadyDisplay ? "Ready" : "Needs update"}
        </span>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <MiniStatus label="Current city" value={cityDisplay} ready={hasSafeCity} />
        <MiniStatus label="Skills" value={hasSkills ? "Added" : "Not set"} ready={hasSkills} />
      </div>

      {!profileReadyDisplay && (
        <div
          style={{
            marginTop: 12,
            padding: "9px 11px",
            borderRadius: "var(--wm-radius-chip)",
            background: "rgba(255,251,235,0.72)",
            border: "1px solid rgba(217,119,6,0.18)",
            fontSize: 12,
            color: "#92400e",
            fontWeight: 750,
            lineHeight: 1.45,
          }}
        >
          Add your city and skills to improve shift discovery. Shifts available for you.
        </div>
      )}

      <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end" }}>
        <button
          className={profileReadyDisplay ? "wm-outlineBtn" : "wm-primarybtn"}
          type="button"
          onClick={onOpenProfile}
          disabled={!onOpenProfile}
          style={{
            fontSize: 12,
            opacity: onOpenProfile ? 1 : 0.7,
            cursor: onOpenProfile ? "pointer" : "default",
          }}
        >
          {hasSafeCity ? "Change Location" : "Set Location"}
        </button>
      </div>
    </section>
  );
}

function MiniStatus({ label, value, ready }: { label: string; value: string; ready: boolean }) {
  return (
    <div
      style={{
        padding: "8px 9px",
        borderRadius: "var(--wm-radius-button)",
        background: "rgba(255,255,255,0.78)",
        border: "1px solid rgba(226,232,240,0.9)",
        minWidth: 0,
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
        {label}
      </div>

      <div
        style={{
          marginTop: 3,
          fontSize: 11,
          fontWeight: 900,
          color: ready ? SHIFT_GREEN : "#92400e",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function getSafeCityDisplay(city: string): string {
  const cleaned = city.trim();
  if (!cleaned) return "Not set";
  if (isUnsafeDemoText(cleaned)) return "Not set";
  return cleaned;
}

function isUnsafeDemoText(value: string): boolean {
  const compact = value.replace(/[^a-z0-9]/gi, "").toLowerCase();

  if (!compact) return true;

  const blockedValues = new Set([
    "bnm",
    "krrrrn",
    "qwe",
    "hjk",
    "hkjyf",
    "hkjyfu",
    "test",
    "demo",
    "sample",
  ]);

  if (blockedValues.has(compact)) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{3,}$/i.test(compact)) return true;
  if (/([a-z])\1{3,}/i.test(compact)) return true;

  return false;
}
