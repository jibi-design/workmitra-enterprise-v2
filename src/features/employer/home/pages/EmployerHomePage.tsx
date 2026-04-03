// src/features/employer/home/pages/EmployerHomePage.tsx
// Session 15: 2-col tiles, zero=grey values, CSS-driven green icons,
// useCallback handlers, vault stats prop, broadcast modal clean.

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { checkAndSendRatingReminders } from "../../helpers/ratingNudgeNotificationService";
import { getDashboardSnapshot, subscribeDashboard } from "../helpers/employerHomeDashboard";
import { employerSettingsStorage } from "../../company/storage/employerSettings.storage";
import { IconTileShift, IconBroadcast } from "../components/employerHomeIcons";
import {
  ShiftJobsCard,
  CareerJobsCard,
} from "../components/EmployerHomePrimaryCards";
import {
  RatingHintCard,
  WorkVaultCard,
  InsightsCard,
} from "../components/EmployerHomeSecondaryCards";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import { EMPLOYER_SLIDES, ONBOARDING_KEY } from "../../../../shared/components/onboardingConstants";

/* ---- Style tokens ---- */
const ZERO_VALUE_STYLE = {
  color: "var(--wm-zero-text, #9ca3af)",
} as const;

/* ------------------------------------------------ */
/* Main Page                                        */
/* ------------------------------------------------ */
export function EmployerHomePage() {
  const nav = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
  });
  const data = useSyncExternalStore(subscribeDashboard, getDashboardSnapshot, getDashboardSnapshot);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeFading, setWelcomeFading] = useState(false);

  const isFirstTime = useMemo(() => !data.shiftPostsExist, [data.shiftPostsExist]);
  const companyDisplayName = useMemo(() => {
    const profile = employerSettingsStorage.get();
    return profile.companyName || profile.fullName || "";
  }, []);

  useEffect(() => { checkAndSendRatingReminders(); }, []);

  useEffect(() => {
    if (!isFirstTime) return;
    const fadeTimer = setTimeout(() => setWelcomeFading(true), 10000);
    const removeTimer = setTimeout(() => setShowWelcome(false), 10500);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [isFirstTime]);

  /* ---- Handlers ---- */
  const handleShiftTile = useCallback(() => {
    nav(ROUTE_PATHS.employerShiftHome);
  }, [nav]);

  const handleShiftTileKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") nav(ROUTE_PATHS.employerShiftHome);
  }, [nav]);

  const handleBroadcastTile = useCallback(() => {
    setShowBroadcastModal(true);
  }, []);

  const handleBroadcastTileKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") setShowBroadcastModal(true);
  }, []);

  const handleCloseBroadcastModal = useCallback(() => {
    setShowBroadcastModal(false);
  }, []);

  const handleShiftBroadcast = useCallback(() => {
    setShowBroadcastModal(false);
    nav(ROUTE_PATHS.employerShiftWorkspaces);
  }, [nav]);

  return (
    <div>
      {/* ---- Top Tiles (2-column) ---- */}
      <div className="wm-er-tiles wm-er-dashTiles">
        <div
          className="wm-er-tile"
          role="button"
          tabIndex={0}
          style={{ cursor: "pointer" }}
          onClick={handleShiftTile}
          onKeyDown={handleShiftTileKey}
        >
          <div className="wm-er-tileTop">
            <div className="wm-er-tileLabel">Upcoming Shifts</div>
            <div className="wm-er-tileIcon">
              <IconTileShift />
            </div>
          </div>
          <div
            className="wm-er-tileValue"
            style={data.pendingShifts === 0 ? ZERO_VALUE_STYLE : undefined}
          >
            {data.pendingShifts}
          </div>
        </div>

        <div
          className="wm-er-tile"
          role="button"
          tabIndex={0}
          style={{ cursor: "pointer" }}
          onClick={handleBroadcastTile}
          onKeyDown={handleBroadcastTileKey}
        >
          <div className="wm-er-tileTop">
            <div className="wm-er-tileLabel">Broadcast Messages</div>
            <div className="wm-er-tileIcon">
              <IconBroadcast />
            </div>
          </div>
          <div
            className="wm-er-tileValue"
            style={data.broadcastMessages === 0 ? ZERO_VALUE_STYLE : undefined}
          >
            {data.broadcastMessages}
          </div>
        </div>
      </div>

      {/* ---- Broadcast Modal ---- */}
      <CenterModal
        open={showBroadcastModal}
        onBackdropClose={handleCloseBroadcastModal}
        ariaLabel="Choose broadcast type"
        maxWidth={400}
      >
        <div style={{ padding: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--wm-er-text)" }}>
            Broadcast Messages
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-er-muted)", lineHeight: 1.5 }}>
            Choose the broadcast stream you want to open.
          </div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              type="button"
              onClick={handleShiftBroadcast}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: 10,
                border: "1px solid var(--wm-shift-border, rgba(22,163,74,0.2))",
                background: "var(--wm-shift-wash, rgba(22,163,74,0.06))",
                color: "var(--wm-shift-accent, #16a34a)",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              Shift Jobs Broadcasts
            </button>
          </div>
        </div>
      </CenterModal>

      {/* ---- Welcome Card ---- */}
      {isFirstTime && showWelcome && (
        <div
          style={{
            marginTop: 12,
            borderRadius: 12,
            padding: 16,
            textAlign: "center",
            background: "var(--wm-success-wash, #f0fdf4)",
            border: "1px solid var(--wm-success-border, #86efac)",
            opacity: welcomeFading ? 0 : 1,
            transition: "opacity 0.5s ease-out",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--wm-success-dark, #15803d)" }}>
            {companyDisplayName ? `Welcome, ${companyDisplayName}!` : "Welcome!"} 👋
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-text-muted, #6b7280)", lineHeight: 1.5 }}>
            Everything you need to manage your team is right here. Set up your company, build your team, and get started.
          </div>
        </div>
      )}

      {/* ---- Cards ---- */}
      <div style={{ marginTop: 12 }}>
        <ShiftJobsCard data={data} />
        <CareerJobsCard data={data} />
        {/* Phase 2 — HR, Console, Workforce hidden at launch */}
        <RatingHintCard />
        <WorkVaultCard />
        <InsightsCard data={data} />
      </div>

      {/* Onboarding — first launch only */}
      {showOnboarding && (
        <OnboardingOverlay
          slides={EMPLOYER_SLIDES}
          ctaLabel="Post Your First Job &#8594;"
          onComplete={() => { setShowOnboarding(false); nav(ROUTE_PATHS.employerShiftCreate); }}
        />
      )}
    </div>
  );
}