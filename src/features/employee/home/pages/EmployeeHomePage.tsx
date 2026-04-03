// src/features/employee/home/pages/EmployeeHomePage.tsx
// Session 15: Workforce tile removed, 2-col tiles, zero=grey (values + icons),
// vault props via page, careerOffered prop, CSS vars only, useCallback handlers.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { useEmployeeHRRecords } from "../../employment/helpers/employeeHRSubscription";
import { OfferResponseCard } from "../../employment/components/OfferResponseCard";
import { employeeProfileStorage } from "../../profile/storage/employeeProfile.storage";
import { readDemo, n, formatNumber } from "../helpers/employeeHomeHelpers";
import { IconCalendar, IconMegaphone } from "../components/employeeHomeIcons";
import {
  ShiftJobsCard,
  CareerJobsCard,
  WorkVaultCard,
  InsightsCard,
} from "../components/EmployeeHomeCards";
import { ProfileNudgeCard } from "../components/ProfileNudgeCard";
import { OnboardingOverlay } from "../../../../shared/components/OnboardingOverlay";
import { EMPLOYEE_SLIDES, ONBOARDING_KEY } from "../../../../shared/components/onboardingConstants";

/* ---- Style tokens (zero vs active) ---- */
const ZERO_VALUE = { color: "var(--wm-zero-text, #94a3b8)", fontWeight: 500 } as const;



/* ---- Vault count helpers (read-only, no side effects) ---- */
function getVaultFolderCount(): number {
  try {
    const raw = localStorage.getItem("wm_employee_vault_folders_v1");
    if (!raw) return 0;
    const arr: unknown = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch { return 0; }
}

function getVaultDocumentCount(): number {
  try {
    const raw = localStorage.getItem("wm_employee_vault_documents_v1");
    if (!raw) return 0;
    const arr: unknown = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch { return 0; }
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployeeHomePage() {
  const nav = useNavigate();

  /* ---- Onboarding (one-time) ---- */
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try { return !localStorage.getItem(ONBOARDING_KEY); } catch { return false; }
  });

  /* ---- Data ---- */
  const demo = useMemo(() => readDemo(), []);
  const flags = useMemo(() => demo.flags ?? {}, [demo]);
  const counts = demo.counts ?? {};

  const showShift = flags.shiftEnabled ?? true;
  const showCareer = flags.careerEnabled ?? true;
  const anyDomain = showShift || showCareer;

  const upcomingShift = n(counts.upcomingShifts7d, 0);
  const shiftBroadcastUnread = n(counts.alerts, 0);

  /* ---- Vault counts (computed in page, passed as props — clean arch) ---- */
  const vaultFolders = useMemo(() => getVaultFolderCount(), []);
  const vaultDocuments = useMemo(() => getVaultDocumentCount(), []);

  /* ---- Welcome banner ---- */
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeFading, setWelcomeFading] = useState(false);

  const userDisplayName = useMemo(() => {
    const profile = employeeProfileStorage.get();
    return profile.fullName || "";
  }, []);

  const isFirstTime = useMemo(
    () => !flags.shiftEnabled && !flags.careerEnabled,
    [flags],
  );

  useEffect(() => {
    if (!isFirstTime) return;
    const fadeTimer = setTimeout(() => setWelcomeFading(true), 10000);
    const removeTimer = setTimeout(() => setShowWelcome(false), 10500);
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); };
  }, [isFirstTime]);

  /* ---- HR records ---- */
  const hrRecords = useEmployeeHRRecords();
  const pendingOffers = hrRecords.filter((r) => r.status === "offered");

  /* ---- Navigation handlers (no inline arrow fns in JSX) ---- */
  const handleShiftTile = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftCenter);
  }, [nav]);

  const handleBroadcastTile = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftWorkspaces);
  }, [nav]);

  const handleFindShifts = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftSearch);
  }, [nav]);

  const handleCareerSearch = useCallback(() => {
    nav(ROUTE_PATHS.employeeCareerSearch);
  }, [nav]);

  const handleViewHistory = useCallback(() => {
    nav(ROUTE_PATHS.employeeShiftEarnings);
  }, [nav]);

  return (
    <div>
      {/* ── Top Tiles (2-column) ── */}
     <div className="wm-ee-tiles wm-ee-dashTiles">
        {/* Upcoming Shifts */}
        <button
          className="wm-ee-tile"
          type="button"
           style={{ cursor: "pointer" }}
          onClick={handleShiftTile}
        >
          <div className="wm-ee-tileTop">
            <div className="wm-ee-tileLabel">Upcoming Shifts</div>
            <span
              className="wm-ee-tileIcon"
              aria-hidden="true"
            >
              <IconCalendar />
            </span>
          </div>
          <div
            className="wm-ee-tileValue"
            style={upcomingShift === 0 ? ZERO_VALUE : undefined}
          >
            {formatNumber(upcomingShift)}
          </div>
        </button>

        {/* Broadcast Messages */}
        <button
          className="wm-ee-tile"
          type="button"
                    style={{ cursor: "pointer" }}
          onClick={handleBroadcastTile}
        >
          <div className="wm-ee-tileTop">
            <div className="wm-ee-tileLabel">Broadcast Messages</div>
            <span
              className="wm-ee-tileIcon"
              aria-hidden="true"
            >
              <IconMegaphone />
            </span>
          </div>
          <div
            className="wm-ee-tileValue"
            style={shiftBroadcastUnread === 0 ? ZERO_VALUE : undefined}
          >
            {formatNumber(shiftBroadcastUnread)}
          </div>
        </button>
      </div>

      {/* ── Welcome Card (first-time only, auto-fade after 10s) ── */}
      {isFirstTime && showWelcome && (
        <div
          className="wm-ee-welcomeCard"
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
            {userDisplayName ? `Welcome, ${userDisplayName}!` : "Welcome!"} 👋
          </div>
          <div style={{ marginTop: 6, fontSize: 13, color: "var(--wm-text-muted, #6b7280)", lineHeight: 1.5 }}>
            Your complete work companion is here. Find jobs, track your work, and stay organized.
          </div>
        </div>
      )}

      {/* ── Profile Nudge ── */}
      <ProfileNudgeCard />

      {/* ── Cards ── */}
      <div style={{ marginTop: 12 }}>
        {/* Get Started — shown only when no domain enabled */}
        {!anyDomain && (
          <section className="wm-ee-card">
            <div style={{ fontWeight: 700, color: "var(--wm-er-text)", fontSize: 16 }}>
              Get started
            </div>
            <div className="wm-ee-helperText">
              Find shifts for daily work, or search career jobs for permanent roles.
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button
                className="wm-primarybtn"
                type="button"
                onClick={handleFindShifts}
                style={{ flex: 1 }}
              >
                Find Shifts
              </button>
              <button
                className="wm-outlineBtn"
                type="button"
                onClick={handleCareerSearch}
                style={{ flex: 1 }}
              >
                Career Jobs
              </button>
            </div>
          </section>
        )}

        {showShift && (
          <ShiftJobsCard
            waitingList={n(counts.applicationsOpen, 0)}
            confirmed={n(counts.shiftAssigned, 0)}
            activeJobs={n(counts.shiftAssigned, 0)}
          />
        )}

        {showCareer && (
          <CareerJobsCard
            careerApplied={n(counts.careerApplied, 0)}
            careerInterviews={n(counts.careerInterviews, 0)}
            careerOffered={0}
          />
        )}

        {pendingOffers.map((offer) => (
          <OfferResponseCard key={offer.id} record={offer} />
        ))}

        <WorkVaultCard
          folderCount={vaultFolders}
          documentCount={vaultDocuments}
        />

        <InsightsCard
          earningsMonth={n(counts.earningsMonth, 0)}
          completedShifts={n(counts.completedShifts, 0)}
          onViewHistory={handleViewHistory}
        />
      </div>

      {/* Onboarding — first launch only */}
      {showOnboarding && (
        <OnboardingOverlay
          slides={EMPLOYEE_SLIDES}
          ctaLabel="Complete My Profile &#8594;"
          onComplete={() => { setShowOnboarding(false); nav(ROUTE_PATHS.employeeProfile); }}
        />
      )}
    </div>
  );
}