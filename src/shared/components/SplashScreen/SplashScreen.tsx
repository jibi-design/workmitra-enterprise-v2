// Mitra Labs — PRODUCTION LOCK cinematic intro splash (5.0s master sync)

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MitraLabsBrandName } from "../brand/BrandName";
import { triggerSplashCinematicHaptics } from "../../platform/haptics";
import { MitraLabsMarkIcon } from "./MitraLabsMarkIcon";
import {
  markSplashIntroPlayed,
  shouldPlaySplashIntro,
  subscribeSplashReplay,
} from "./splashSession";

/** PRODUCTION LOCK — 5.0s total luxury slow-mo pacing */
const SPLASH_TOTAL_MS = 5000;
const SPLASH_PORTAL_START_MS = 4000;
const SPARKLE_COUNT = 7;

/** Particle dust across extended slow-burn reveal (2.0s – 4.0s) */
const SPARKLE_LAYOUT: ReadonlyArray<{ left: string; top: string; delayMs: number }> = [
  { left: "10%", top: "58%", delayMs: 2100 },
  { left: "22%", top: "48%", delayMs: 2400 },
  { left: "36%", top: "38%", delayMs: 2700 },
  { left: "50%", top: "30%", delayMs: 3000 },
  { left: "62%", top: "22%", delayMs: 3300 },
  { left: "74%", top: "14%", delayMs: 3600 },
  { left: "88%", top: "8%", delayMs: 3900 },
];

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type SplashAnimatorProps = {
  onComplete: () => void;
};

function SplashScreenAnimator({ onComplete }: SplashAnimatorProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const sparkles = useMemo(() => SPARKLE_LAYOUT.slice(0, SPARKLE_COUNT), []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      markSplashIntroPlayed();
      onComplete();
      return;
    }

    const clearHaptics = triggerSplashCinematicHaptics();

    const portalTimer = window.setTimeout(() => {
      overlayRef.current?.classList.add("is-portal-exit");
    }, SPLASH_PORTAL_START_MS);

    const completeTimer = window.setTimeout(() => {
      markSplashIntroPlayed();
      onComplete();
    }, SPLASH_TOTAL_MS);

    return () => {
      clearHaptics();
      window.clearTimeout(portalTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div ref={overlayRef} className="wm-splash-screen" role="presentation" aria-hidden="true">
      <div className="wm-splash-screen__circuitry" aria-hidden="true" />
      <div className="wm-splash-screen__grain" aria-hidden="true" />

      <div className="wm-splash-screen__stage">
        <span
          className="wm-splash-screen__floor-reflection wm-splash-screen__floor-reflection--white"
          aria-hidden="true"
        />
        <span
          className="wm-splash-screen__floor-reflection wm-splash-screen__floor-reflection--teal"
          aria-hidden="true"
        />
        <span className="wm-splash-screen__bloom" aria-hidden="true" />

        <div className="wm-splash-screen__orb">
          <div className="wm-splash-screen__orb-wobble">
            <span className="wm-splash-screen__origin" aria-hidden="true" />

            <div className="wm-splash-screen__brand-stack">
              <div className="wm-splash-screen__logo-shell">
                <MitraLabsMarkIcon size={168} className="wm-splash-mark" />
                <span className="wm-splash-screen__laser-beam" aria-hidden="true" />
                <span className="wm-splash-screen__edge-spark" aria-hidden="true" />
                {sparkles.map((sparkle, index) => (
                  <span
                    key={index}
                    className="wm-splash-screen__sparkle"
                    aria-hidden="true"
                    style={{
                      left: sparkle.left,
                      top: sparkle.top,
                      ["--wm-sparkle-delay" as string]: `${sparkle.delayMs}ms`,
                    }}
                  />
                ))}
              </div>

              <div className="wm-splash-screen__brand-copy">
                <MitraLabsBrandName as="h1" size="lg" className="wm-splash-screen__title" />
                <div className="wm-splash-screen__accent-line" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SplashScreen() {
  const [active, setActive] = useState(() => shouldPlaySplashIntro());
  const [runKey, setRunKey] = useState(0);

  const handleComplete = useCallback(() => {
    setActive(false);
  }, []);

  useEffect(() => {
    return subscribeSplashReplay(() => {
      setRunKey((key) => key + 1);
      setActive(true);
    });
  }, []);

  if (!active) {
    return null;
  }

  return <SplashScreenAnimator key={runKey} onComplete={handleComplete} />;
}
