/**
 * Job Mitra | GodModePanel.tsx
 * DEV-ONLY floating QA panel. import.meta.env.DEV is statically replaced
 * with `false` by Vite in production — Rollup dead-code-eliminates the
 * entire inner component, so this costs zero bytes in production builds.
 *
 * Mounted in main.tsx as a sibling to <App />.
 */

import { useEffect, useState } from "react";
import { roleStorage } from "../app/storage/roleStorage";
import { usePulseStore } from "../features/pulse/pulseStore";
import { requestSplashReplay } from "../shared/components/SplashScreen";
import {
  applyQaBulkCandidateSeed,
  assumeQaBulkWorkerProfile,
} from "../features/shared/shift/qaBulkCandidates.seed";
import {
  applyQaMultiEmployerSeed,
  assumeQaMultiEmployer,
  QA_MULTI_EMPLOYER_COUNT,
} from "../features/shared/shift/qaMultiEmployer.seed";
import { applyUltraHeavySuiteSeed } from "../features/shared/shift/qaUltraHeavySuite.seed";
import { applyVisualStressSeed } from "../features/shared/shift/qaVisualStress.seed";
import { AVAILABILITY_DEBUG_FLAG } from "../features/shared/shift/availabilitySyncDebug";
import { applyReadyLocalPostApplySeed } from "./readyLocalPostApply.seed";

/* ------------------------------------------------ */
/* Public shell — hard production guard             */
/* ------------------------------------------------ */
export function GodModePanel() {
  if (!import.meta.env.DEV) return null;
  try {
    if (window.localStorage.getItem("wm_god_mode") !== "1") return null;
  } catch {
    return null;
  }
  return <GodModePanelInner />;
}

/* ------------------------------------------------ */
/* Inner panel — only reaches here in DEV           */
/* ------------------------------------------------ */
function isLandingRolePickRoute(): boolean {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const path = (raw.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  return path === "/" || path === "/role-pick";
}

function GodModePanelInner() {
  const [open, setOpen] = useState(false);
  const [log, setLog] = useState<string | null>(null);
  const [assumeEmpIndex, setAssumeEmpIndex] = useState("50");
  const [routeTick, setRouteTick] = useState(0);

  useEffect(() => {
    // Keep live UI clean — QA overlays are opt-in via localStorage only.
    try {
      window.localStorage.removeItem(AVAILABILITY_DEBUG_FLAG);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const api = { apply: applyReadyLocalPostApplySeed };
    (window as Window & { wmReadyLocalPostApply?: typeof api }).wmReadyLocalPostApply = api;
    return () => {
      delete (window as Window & { wmReadyLocalPostApply?: typeof api }).wmReadyLocalPostApply;
    };
  }, []);

  useEffect(() => {
    const bump = () => setRouteTick((n) => n + 1);
    bump();
    window.addEventListener("hashchange", bump);
    window.addEventListener("popstate", bump);
    return () => {
      window.removeEventListener("hashchange", bump);
      window.removeEventListener("popstate", bump);
    };
  }, []);

  const hideOnLanding = isLandingRolePickRoute();
  // Close panel if we land back on role-pick (defer setState — avoid sync effect render).
  useEffect(() => {
    if (!hideOnLanding) return;
    const t = window.setTimeout(() => setOpen(false), 0);
    return () => window.clearTimeout(t);
  }, [hideOnLanding, routeTick]);

  function flash(msg: string) {
    setLog(msg);
    window.setTimeout(() => setLog(null), 2800);
  }

  function handleReadyLocalPostApply() {
    const result = applyReadyLocalPostApplySeed();
    flash(
      result.publishAllowed
        ? `✅ Publish unlocked — ${result.employerCompany} / worker ${result.employeeName}`
        : `⚠️ Seeded but publish blocked: ${result.publishReason ?? "unknown"}`,
    );
  }

  function handleWipe() {
    localStorage.clear();
    flash("🗑 Local storage wiped. Reloading…");
    window.setTimeout(() => window.location.reload(), 600);
  }

  function handleMockPulse() {
    const { hasActiveChain, clearAll } = usePulseStore.getState();
    if (hasActiveChain()) {
      clearAll();
      flash("🔴 Active pulse cleared.");
      return;
    }

    // Prefer full event bridge (chain + trail) so home LED survives until destination confirm.
    const triggered = window.wmPulseDev?.trigger("SHIFT_APPLICATION_SUBMITTED") ?? [];
    if (triggered.length > 0) {
      flash("⚡ Mock pulse fired [SHIFT_APPLICATION_SUBMITTED]. Home → My Posts hops live.");
      return;
    }

    usePulseStore.getState().triggerPulseFlow("new_shift_application", "dev-mock-001");
    flash("⚡ Mock pulse fired [new_shift_application]. Check Shift card breathing light.");
  }

  function handleToggleRole() {
    const current = roleStorage.get();
    const next = current === "employee" ? "employer" : "employee";
    roleStorage.set(next);
    flash(`🔄 Role switched → ${next}. Page will redirect.`);
  }

  function handleReplayIntro() {
    requestSplashReplay();
    flash("✨ Replaying PRODUCTION LOCK intro (5.0s)…");
  }

  function handleSeed50Candidates() {
    const result = applyQaBulkCandidateSeed(100);
    flash(
      `🧪 Seeded ${result.favoriteCount} favorites / pool=${result.poolCount}. #25=${result.worker25} #50=${result.worker50}`,
    );
    window.setTimeout(() => {
      if (!location.hash.includes("/employer/shift")) {
        location.hash = "#/employer/shift/favorites";
      } else {
        location.reload();
      }
    }, 400);
  }

  function handleSeedMultiEmployers() {
    const result = applyQaMultiEmployerSeed(QA_MULTI_EMPLOYER_COUNT);
    flash(`🏢 Seeded ${result.employerCount} employers. Samples: ${result.sampleIds.join(", ")}`);
    window.setTimeout(() => {
      location.hash = "#/employer/shift/favorites";
      location.reload();
    }, 500);
  }

  function handleUltraHeavySuite() {
    const result = applyUltraHeavySuiteSeed();
    flash(
      `🚀 UltraHeavy: emp=${result.employers} cand=${result.candidates} minFav=${result.minFavoritesPerEmployer} vault=${result.vaultEntries} apps=${result.confirmedApps}`,
    );
    window.setTimeout(() => {
      location.hash = "#/employer/shift/favorites";
      location.reload();
    }, 600);
  }

  function handleVisualStressSuite() {
    const result = applyVisualStressSeed();
    flash(
      `🎬 VisualStress: emp=${result.employers}×${result.appsPerEmployer}=${result.totalApplications} apps · vaultWorkers=${result.vaultWorkersTouched} · pulses=${result.pulseEventsQueued}`,
    );
    window.setTimeout(() => {
      location.hash = `#/employer/shift/post/${result.samplePostId}`;
      location.reload();
    }, 700);
  }

  function handleAssumeEmployer(index1Based: number) {
    roleStorage.set("employer");
    const result = assumeQaMultiEmployer(index1Based);
    flash(`🏢 Assumed ${result.employerId} (${result.companyName}) · favs=${result.favoriteCount}`);
    window.setTimeout(() => {
      location.hash = "#/employer/shift/favorites";
      location.reload();
    }, 400);
  }

  function handleAssumeEmployerFromInput() {
    const n = Number.parseInt(assumeEmpIndex, 10);
    if (!Number.isFinite(n) || n < 1 || n > QA_MULTI_EMPLOYER_COUNT) {
      flash(`⚠ Enter employer index 1–${QA_MULTI_EMPLOYER_COUNT}`);
      return;
    }
    handleAssumeEmployer(n);
  }

  function handleAssumeWorker25() {
    roleStorage.set("employee");
    const result = assumeQaBulkWorkerProfile(25);
    flash(`🪪 Sealed employee → ${result.workerMlId}. Opening invite post…`);
    window.setTimeout(() => {
      location.hash = `#/employee/shift/post/qa_bulk_stress_post_1`;
      location.reload();
    }, 400);
  }

  if (hideOnLanding) return null;

  return (
    <div className="wm-dev-audit-sandbox" data-audit-sandbox="dev" data-wm-audit-ignore="true">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="God Mode Dev Panel"
        title="God Mode Dev Panel"
        className="wm-dev-audit-sandbox__fab"
        data-wm-god-mode-fab="true"
        style={{
          position: "fixed",
          /* Dock bottom-left above floating bottom nav — never covers top headers/actions */
          top: "auto",
          bottom: "calc(6.25rem + env(safe-area-inset-bottom, 0px))",
          left: 12,
          right: "auto",
          zIndex: 40,
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: open ? "#1e293b" : "rgba(30,41,59,0.55)",
          border: "1.5px solid rgba(148,163,184,0.28)",
          color: "#94a3b8",
          fontSize: 16,
          opacity: open ? 1 : 0.72,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 10px rgba(0,0,0,0.28)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          transition: "background 0.15s ease, transform 0.15s ease, opacity 0.15s ease",
          transform: open ? "rotate(45deg)" : "rotate(0deg)",
        }}
      >
        ⚡
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            top: "auto",
            bottom: "calc(8.75rem + env(safe-area-inset-bottom, 0px))",
            left: 12,
            right: "auto",
            zIndex: 41,
            width: 260,
            borderRadius: 16,
            background: "rgba(15,23,42,0.95)",
            border: "1px solid rgba(148,163,184,0.15)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.55)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            padding: "14px 0 10px",
            overflow: "hidden",
            maxHeight: "55vh",
            overflowY: "auto",
          }}
          role="dialog"
          aria-label="God Mode Dev Panel"
        >
          <div
            style={{
              padding: "0 16px 12px",
              borderBottom: "1px solid rgba(148,163,184,0.12)",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#64748b",
                letterSpacing: 1.2,
                textTransform: "uppercase",
              }}
            >
              ⚡ God Mode
            </div>
            <div style={{ fontSize: 10, color: "#334155", marginTop: 2 }}>
              DEV ONLY — hidden in production
            </div>
          </div>

          <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 4 }}>
            <PanelButton
              label="Ready: Post + Apply test"
              icon="✅"
              color="#059669"
              onClick={handleReadyLocalPostApply}
            />
            <PanelButton
              label="Wipe Storage & Reload"
              icon="🗑"
              color="#ef4444"
              onClick={handleWipe}
            />
            <PanelButton
              label="Toggle Mock Pulse"
              icon="💡"
              color="#6366f1"
              onClick={handleMockPulse}
            />
            <PanelButton label="Toggle Role" icon="🔄" color="#0ea5e9" onClick={handleToggleRole} />
            <PanelButton
              label="Replay Cinematic Intro"
              icon="✨"
              color="#0891b2"
              onClick={handleReplayIntro}
            />
            <PanelButton
              label="Seed 100 QA Candidates"
              icon="🧪"
              color="#16a34a"
              onClick={handleSeed50Candidates}
            />
            <PanelButton
              label="Seed Multi-Employers (105)"
              icon="🏢"
              color="#059669"
              onClick={handleSeedMultiEmployers}
            />
            <PanelButton
              label="Ultra-Heavy Full Suite"
              icon="🚀"
              color="#dc2626"
              onClick={handleUltraHeavySuite}
            />
            <PanelButton
              label="Visual Stress 10k+ Apps"
              icon="🎬"
              color="#b91c1c"
              onClick={handleVisualStressSuite}
            />
            <PanelButton
              label="Assume Employer #1"
              icon="1️⃣"
              color="#7c3aed"
              onClick={() => handleAssumeEmployer(1)}
            />
            <PanelButton
              label="Assume Employer #50"
              icon="5️⃣"
              color="#7c3aed"
              onClick={() => handleAssumeEmployer(50)}
            />
            <PanelButton
              label="Assume Employer #100"
              icon="💯"
              color="#7c3aed"
              onClick={() => handleAssumeEmployer(100)}
            />

            <div
              style={{
                display: "flex",
                gap: 6,
                alignItems: "center",
                padding: "6px 4px 2px",
              }}
            >
              <input
                type="number"
                min={1}
                max={QA_MULTI_EMPLOYER_COUNT}
                value={assumeEmpIndex}
                onChange={(e) => setAssumeEmpIndex(e.target.value)}
                aria-label="Assume employer index"
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(148,163,184,0.25)",
                  background: "rgba(15,23,42,0.8)",
                  color: "#e2e8f0",
                  padding: "0 8px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
              <button
                type="button"
                onClick={handleAssumeEmployerFromInput}
                style={{
                  height: 32,
                  padding: "0 10px",
                  borderRadius: 8,
                  border: "none",
                  background: "#7c3aed",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Assume Emp #
              </button>
            </div>

            <PanelButton
              label="Assume QA Worker #25"
              icon="🪪"
              color="#f59e0b"
              onClick={handleAssumeWorker25}
            />
          </div>

          {log && (
            <div
              style={{
                margin: "10px 10px 0",
                padding: "8px 12px",
                borderRadius: 8,
                background: "rgba(148,163,184,0.08)",
                fontSize: 11,
                color: "#94a3b8",
                lineHeight: 1.4,
                fontWeight: 600,
              }}
            >
              {log}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type PanelButtonProps = {
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
};

function PanelButton({ label, icon, color, onClick }: PanelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "9px 10px",
        borderRadius: 10,
        border: "none",
        background: "rgba(148,163,184,0.06)",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: `${color}18`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#cbd5e1",
          lineHeight: 1.3,
        }}
      >
        {label}
      </span>
    </button>
  );
}
