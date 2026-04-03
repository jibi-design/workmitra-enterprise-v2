// src/shared/components/OnboardingOverlay.tsx
//
// First-time onboarding overlay — action-oriented slides.
// Shows once per role. Skip on all slides except last.
// CTA on last slide navigates to first action.

import { useState } from "react";
import type { OnboardingSlide } from "./onboardingConstants";
import { ONBOARDING_KEY } from "./onboardingConstants";

/* ------------------------------------------------ */
/* Icons                                            */
/* ------------------------------------------------ */
const ICONS: Record<OnboardingSlide["icon"], React.ReactNode> = {
  welcome: (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2ZM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8Zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5Zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11Zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5Z" />
    </svg>
  ),
  profile: (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </svg>
  ),
  wmid: (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4Zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8Z" />
    </svg>
  ),
  ready: (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17Z" />
    </svg>
  ),
  company: (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 7V3H2v18h20V7H12ZM6 19H4v-2h2v2Zm0-4H4v-2h2v2Zm0-4H4V9h2v2Zm0-4H4V5h2v2Zm4 12H8v-2h2v2Zm0-4H8v-2h2v2Zm0-4H8V9h2v2Zm0-4H8V5h2v2Zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10Zm-2-8h-2v2h2v-2Zm0 4h-2v2h2v-2Z" />
    </svg>
  ),
  postjob: (
    <svg width="48" height="48" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M14 6V4h-4v2h4ZM4 8v11h16V8H4Zm16-2c1.11 0 2 .89 2 2v11c0 1.11-.89 2-2 2H4c-1.11 0-2-.89-2-2l.01-11c0-1.11.88-2 1.99-2h4V4c0-1.11.89-2 2-2h4c1.11 0 2 .89 2 2v2h4Z" />
    </svg>
  ),
};

/* ------------------------------------------------ */
/* Props                                            */
/* ------------------------------------------------ */
type Props = {
  slides: readonly OnboardingSlide[];
  ctaLabel: string;
  onComplete: () => void;
};

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function OnboardingOverlay({ slides, ctaLabel, onComplete }: Props) {
  const [index, setIndex] = useState(0);

  const isLast = index === slides.length - 1;
  const slide = slides[index];

  function finish() {
    try { localStorage.setItem(ONBOARDING_KEY, "1"); } catch { /* safe */ }
    onComplete();
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2000,
      background: "#fff",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 20px",
    }}>
      {/* Skip — all slides except last */}
      {!isLast && (
        <button type="button" onClick={finish} style={{
          position: "absolute", top: 16, right: 16,
          background: "none", border: "none", cursor: "pointer",
          fontSize: 13, fontWeight: 600, color: "var(--wm-er-muted, #6b7280)",
          padding: "6px 12px",
        }}>
          Skip
        </button>
      )}

      {/* Icon */}
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(29,78,216,0.08)", color: "var(--wm-brand-600, #1d4ed8)",
        marginBottom: 24,
      }}>
        {ICONS[slide.icon]}
      </div>

      {/* Title */}
      <div style={{
        fontSize: 20, fontWeight: 700, color: "var(--wm-er-text, #111827)",
        textAlign: "center", lineHeight: 1.3,
      }}>
        {slide.title}
      </div>

      {/* Message */}
      <div style={{
        marginTop: 12, fontSize: 14, color: "var(--wm-er-muted, #6b7280)",
        textAlign: "center", lineHeight: 1.6, maxWidth: 300,
      }}>
        {slide.message}
      </div>

      {/* Dots */}
      <div style={{ marginTop: 32, display: "flex", gap: 8 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === index ? 20 : 8, height: 8, borderRadius: 999,
            background: i === index ? "var(--wm-brand-600, #1d4ed8)" : "rgba(29,78,216,0.15)",
            transition: "width 0.2s, background 0.2s",
          }} />
        ))}
      </div>

      {/* Action button */}
      <div style={{ marginTop: 32, width: "100%", maxWidth: 300 }}>
        {isLast ? (
          <button type="button" onClick={finish} style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: "var(--wm-brand-600, #1d4ed8)", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            {ctaLabel}
          </button>
        ) : (
          <button type="button" onClick={() => setIndex((i) => i + 1)} style={{
            width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
            background: "var(--wm-brand-600, #1d4ed8)", color: "#fff",
            fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            Next
          </button>
        )}
      </div>
    </div>
  );
}