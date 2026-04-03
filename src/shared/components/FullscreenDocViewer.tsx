// src/shared/components/FullscreenDocViewer.tsx

import { useState } from "react";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
type DocViewerProps = {
  name: string;
  fileType: "image" | "pdf";
  base64Data: string;
  subtitle?: string;
  onClose: () => void;
};

/* ------------------------------------------------ */
/* Zoom Steps                                       */
/* ------------------------------------------------ */
const ZOOM_STEPS = [100, 125, 150, 175, 200, 250, 300, 400];

function nextZoom(current: number): number {
  for (const step of ZOOM_STEPS) {
    if (step > current) return step;
  }
  return current;
}

function prevZoom(current: number): number {
  for (let i = ZOOM_STEPS.length - 1; i >= 0; i--) {
    if (ZOOM_STEPS[i] < current) return ZOOM_STEPS[i];
  }
  return current;
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function FullscreenDocViewer({
  name,
  fileType,
  base64Data,
  subtitle,
  onClose,
}: DocViewerProps) {
  const [zoomPct, setZoomPct] = useState(ZOOM_STEPS[0]);

  const canZoomOut = zoomPct > ZOOM_STEPS[0];
  const canZoomIn = zoomPct < ZOOM_STEPS[ZOOM_STEPS.length - 1];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(15, 23, 42, 0.95)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top Bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.06)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink: 0,
        }}
      >
        {/* Back button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
            cursor: "pointer",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
          aria-label="Close viewer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z" />
          </svg>
        </button>

        {/* Title */}
        <div style={{ minWidth: 0, flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontWeight: 800,
              fontSize: 14,
              color: "#fff",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
          {subtitle && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Spacer to balance back button */}
        <div style={{ width: 40, flexShrink: 0 }} />
      </div>

      {/* ── Content Area ── */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {fileType === "image" ? (
          <img
            src={base64Data}
            alt={name}
            style={{
              maxWidth: zoomPct <= 100 ? "100%" : "none",
              width: zoomPct <= 100 ? "auto" : `${zoomPct}vw`,
              maxHeight: zoomPct <= 100 ? "calc(100vh - 160px)" : "none",
              borderRadius: 8,
              transition: "width 0.2s ease, max-height 0.2s ease",
              userSelect: "none",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
            draggable={false}
          />
        ) : (
          <iframe
            src={base64Data}
            title={name}
            style={{
              width: "100%",
              height: "calc(100vh - 160px)",
              border: "none",
              borderRadius: 8,
              background: "#fff",
              boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
            }}
          />
        )}
      </div>

      {/* ── Bottom Toolbar — Floating Pill ── */}
      {fileType === "image" && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "16px 16px 24px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 8px",
              borderRadius: 16,
              background: "rgba(255,255,255,0.10)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            {/* Zoom Out */}
            <button
              type="button"
              onClick={() => setZoomPct(prevZoom(zoomPct))}
              disabled={!canZoomOut}
              aria-label="Zoom out"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "none",
                background: canZoomOut ? "rgba(255,255,255,0.08)" : "transparent",
                color: canZoomOut ? "#fff" : "rgba(255,255,255,0.2)",
                fontSize: 22,
                fontWeight: 700,
                cursor: canZoomOut ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              −
            </button>

            {/* Fit / Reset */}
            <button
              type="button"
              onClick={() => setZoomPct(ZOOM_STEPS[0])}
              style={{
                height: 44,
                padding: "0 16px",
                borderRadius: 12,
                border: "none",
                background: zoomPct === ZOOM_STEPS[0] ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                cursor: "pointer",
                minWidth: 72,
                textAlign: "center",
                letterSpacing: 0.5,
              }}
            >
              {zoomPct}%
            </button>

            {/* Zoom In */}
            <button
              type="button"
              onClick={() => setZoomPct(nextZoom(zoomPct))}
              disabled={!canZoomIn}
              aria-label="Zoom in"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "none",
                background: canZoomIn ? "rgba(255,255,255,0.08)" : "transparent",
                color: canZoomIn ? "#fff" : "rgba(255,255,255,0.2)",
                fontSize: 22,
                fontWeight: 700,
                cursor: canZoomIn ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}