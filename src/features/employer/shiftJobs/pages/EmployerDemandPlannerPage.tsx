// src/features/employer/shiftJobs/pages/EmployerDemandPlannerPage.tsx
//
// Shift Demand Planner — 3-step wizard.
// Step 1: Plan details. Step 2: Fill calendar. Step 3: Review + Submit.
// Submit → auto-creates one shift post per day slot.
// After submit → Fill Status Dashboard per day.

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { employerShiftStorage } from "../storage/employerShift.storage";
import { demandPlannerStorage, generateDates } from "../storage/demandPlannerStorage";
import type { DaySlot } from "../storage/demandPlannerStorage";
import { getAutoFillData } from "../helpers/shiftCreateHelpers";
import { DemandPlannerStep1 } from "../components/DemandPlannerStep1";
import type { Step1Data } from "../components/DemandPlannerStep1";
import { DemandPlannerStep2 } from "../components/DemandPlannerStep2";
import { DemandPlannerStep3 } from "../components/DemandPlannerStep3";
import { NoticeModal } from "../../../../shared/components/NoticeModal";
import type { NoticeData } from "../../../../shared/components/NoticeModal";

/* ------------------------------------------------ */
/* Fill status helpers                              */
/* ------------------------------------------------ */
type FillStatus = "filled" | "filling" | "needs_attention" | "posted";

function getFillStatus(confirmed: number, workers: number): FillStatus {
  if (workers === 0) return "posted";
  if (confirmed >= workers) return "filled";
  if (confirmed > 0) return "filling";
  return "needs_attention";
}

const STATUS_CONFIG: Record<FillStatus, { icon: string; label: string; color: string; bg: string }> = {
  filled:           { icon: "✅", label: "Filled",          color: "#15803d", bg: "rgba(22,163,74,0.08)"  },
  filling:          { icon: "🟡", label: "Filling",         color: "#92400e", bg: "rgba(217,119,6,0.08)"  },
  needs_attention:  { icon: "🔴", label: "Needs attention", color: "#dc2626", bg: "rgba(220,38,38,0.08)"  },
  posted:           { icon: "⚪", label: "Posted",          color: "#64748b", bg: "rgba(148,163,184,0.08)" },
};

/* ------------------------------------------------ */
/* Fill Status Dashboard                            */
/* ------------------------------------------------ */
type SlotResult = {
  date: string;
  postId: string;
  workers: number;
  confirmed: number;
  status: FillStatus;
};

function FillStatusDashboard({
  planName,
  results,
  onViewPosts,
}: {
  planName: string;
  results: SlotResult[];
  onViewPosts: () => void;
}) {
  const filledCount = results.filter((r) => r.status === "filled").length;
  const total       = results.length;

  return (
    <div>
      {/* Summary */}
      <div style={{
        padding: "14px 16px", borderRadius: 14,
        background: "rgba(22,163,74,0.06)",
        border: "1px solid rgba(22,163,74,0.2)",
        marginBottom: 14,
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#15803d", marginBottom: 4 }}>
          Plan submitted successfully!
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)" }}>
          {total} shift{total !== 1 ? "s" : ""} created for <strong>{planName}</strong>.
          Workers can now see and apply.
        </div>
        <div style={{
          marginTop: 10, height: 6, borderRadius: 999,
          background: "var(--wm-er-divider, #e5e7eb)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: 999,
            width: `${total > 0 ? (filledCount / total) * 100 : 0}%`,
            background: "#16a34a", transition: "width 0.3s ease",
          }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 11, color: "var(--wm-er-muted)" }}>
          {filledCount}/{total} days filled
        </div>
      </div>

      {/* Per-day status */}
      <div style={{ display: "grid", gap: 8 }}>
        {results.map((r) => {
          const cfg = STATUS_CONFIG[r.status];
          const dateLabel = new Date(r.date + "T00:00:00").toLocaleDateString(
            undefined, { weekday: "short", month: "short", day: "numeric" },
          );
          return (
            <div
              key={r.postId}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", borderRadius: 10,
                background: cfg.bg, border: `1px solid ${cfg.color}22`,
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{cfg.icon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                    {dateLabel}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 1 }}>
                    {r.confirmed}/{r.workers} confirmed
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                background: `${cfg.color}18`, color: cfg.color,
                border: `1px solid ${cfg.color}30`,
                whiteSpace: "nowrap", flexShrink: 0,
              }}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action */}
      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={onViewPosts}
          style={{
            width: "100%", padding: "12px 0", borderRadius: 12, border: "none",
            background: "var(--wm-er-accent-shift, #16a34a)",
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          View All Posts
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------ */
/* Progress indicator                               */
/* ------------------------------------------------ */
function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = ["Plan Details", "Fill Calendar", "Review"];
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 20 }}>
      {steps.map((label, idx) => {
        const n    = idx + 1;
        const done = n < step;
        const curr = n === step;
        return (
          <div key={label} style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", position: "relative",
          }}>
            {idx > 0 && (
              <div style={{
                position: "absolute", top: 14, left: 0, right: "50%", height: 2,
                background: done || curr
                  ? "var(--wm-er-accent-shift, #16a34a)"
                  : "var(--wm-er-border)",
              }} />
            )}
            {idx < 2 && (
              <div style={{
                position: "absolute", top: 14, left: "50%", right: 0, height: 2,
                background: done
                  ? "var(--wm-er-accent-shift, #16a34a)"
                  : "var(--wm-er-border)",
              }} />
            )}
            <div style={{
              width: 28, height: 28, borderRadius: "50%", zIndex: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700,
              background: done
                ? "var(--wm-er-accent-shift, #16a34a)"
                : curr ? "rgba(22,163,74,0.15)" : "var(--wm-er-surface)",
              border: `2px solid ${curr || done ? "var(--wm-er-accent-shift, #16a34a)" : "var(--wm-er-border)"}`,
              color: done ? "#fff" : curr ? "var(--wm-er-accent-shift, #16a34a)" : "var(--wm-er-muted)",
            }}>
              {done ? "\u2713" : n}
            </div>
            <div style={{
              marginTop: 4, fontSize: 10,
              fontWeight: curr ? 700 : 600,
              color: curr ? "var(--wm-er-accent-shift)" : "var(--wm-er-muted)",
              textAlign: "center",
            }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------ */
/* Component                                        */
/* ------------------------------------------------ */
export function EmployerDemandPlannerPage() {
  const nav      = useNavigate();
  const autoFill = useMemo(() => getAutoFillData(), []);

  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [isSubmitting, setSubmitting] = useState(false);
  const [notice, setNotice]           = useState<NoticeData | null>(null);
  const [step1Errors, setStep1Errors] = useState<string[]>([]);

  /* After submit — fill status */
  const [submitResults, setSubmitResults] = useState<SlotResult[] | null>(null);

  const [step1, setStep1] = useState<Step1Data>({
    name:         "",
    companyName:  autoFill.companyName,
    locationName: autoFill.locationCity,
    category:     autoFill.industryType || "Construction",
    experience:   "helper",
    startDate:    "",
    endDate:      "",
    workingDays:  [1, 2, 3, 4, 5],
    description:  "",
  });

  const [slots, setSlots] = useState<DaySlot[]>([]);

  /* ---- Step 1 → 2 ---- */
  function handleStep1Next() {
    const errs: string[] = [];
    if (step1.name.trim().length < 2)         errs.push("Plan name is required.");
    if (step1.locationName.trim().length < 2) errs.push("Work location is required.");
    if (!step1.startDate)                      errs.push("Start date is required.");
    if (!step1.endDate)                        errs.push("End date is required.");
    if (step1.endDate < step1.startDate)       errs.push("End date must be after start date.");
    if (step1.workingDays.length === 0)        errs.push("Select at least one working day.");

    if (errs.length > 0) { setStep1Errors(errs); return; }
    setStep1Errors([]);

    const dates = generateDates(step1.startDate, step1.endDate, step1.workingDays);
    if (dates.length === 0) {
      setStep1Errors(["No working days found in the selected date range. Check your dates and working days."]);
      return;
    }
    if (dates.length > 90) {
      setStep1Errors(["Maximum 90 days per plan. Please reduce the date range."]);
      return;
    }

    const existingMap = new Map(slots.map((s) => [s.date, s]));
    const newSlots: DaySlot[] = dates.map((date) =>
      existingMap.get(date) ?? { date, workers: 0, payPerDay: 0 },
    );
    setSlots(newSlots);
    setStep(2);
  }

  /* ---- Submit ---- */
  function handleSubmit() {
    setSubmitting(true);
    try {
      const planId = demandPlannerStorage.create({
        name:         step1.name.trim(),
        companyName:  step1.companyName.trim(),
        locationName: step1.locationName.trim(),
        category:     step1.category,
        experience:   step1.experience,
        startDate:    step1.startDate,
        endDate:      step1.endDate,
        workingDays:  step1.workingDays,
        slots,
        description:  step1.description.trim(),
      });

      const postIds: Record<string, string> = {};
      const results: SlotResult[] = [];

      for (const slot of slots) {
        const postId = employerShiftStorage.createPost({
          companyName:       step1.companyName.trim() || "Company",
          jobName:           step1.name.trim(),
          category:          slot.category ?? step1.category,
          experience:        step1.experience,
          payPerDay:         slot.payPerDay,
          locationName:      step1.locationName.trim(),
          distanceKm:        0,
          startAt:           new Date(slot.date + "T00:00:00").getTime(),
          endAt:             new Date(slot.date + "T23:59:59").getTime(),
          description:       step1.description.trim(),
          shiftTiming:       "",
          mapsLink:          "",
          isHiddenFromSearch: false,
          mustHave:          [],
          goodToHave:        [],
          vacancies:         slot.workers,
          waitingBuffer:     2,
          jobType:           "one-time",
          settings: { backupSlots: 2, autoPromoteBackup: true, notifyBackup: true },
        });
        postIds[slot.date] = postId;

        /* Initial fill status — just created, confirmed = 0 */
        results.push({
          date:      slot.date,
          postId,
          workers:   slot.workers,
          confirmed: 0,
          status:    getFillStatus(0, slot.workers),
        });
      }

      demandPlannerStorage.submit(planId, postIds);

      /* Show fill status dashboard instead of navigating */
      setSubmitResults(results);
    } catch {
      setNotice({ title: "Error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <NoticeModal notice={notice} onClose={() => setNotice(null)} />

      {/* Header */}
      <div className="wm-pageHead">
        <div>
          <div className="wm-pageTitle">Demand Planner</div>
          <div className="wm-pageSub">Plan your workforce for the week or month</div>
        </div>
        {!submitResults && (
          <button
            className="wm-outlineBtn"
            type="button"
            onClick={() => nav(ROUTE_PATHS.employerShiftHome)}
            style={{ fontSize: 12 }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Fill Status Dashboard — shown after submit */}
      {submitResults ? (
        <div className="wm-er-card" style={{ marginTop: 14 }}>
          <FillStatusDashboard
            planName={step1.name.trim()}
            results={submitResults}
            onViewPosts={() => nav(ROUTE_PATHS.employerShiftPosts)}
          />
        </div>
      ) : (
        <>
          {/* Step indicator */}
          <div style={{ marginTop: 14 }}>
            <StepIndicator step={step} />
          </div>

          {/* Step content */}
          <div className="wm-er-card" style={{ marginTop: 0 }}>
            {step === 1 && (
              <DemandPlannerStep1
                data={step1}
                onChange={setStep1}
                onNext={handleStep1Next}
                errors={step1Errors}
              />
            )}
            {step === 2 && (
              <DemandPlannerStep2
                slots={slots}
                defaultPay={0}
                onSlotsChange={setSlots}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <DemandPlannerStep3
                step1={step1}
                slots={slots}
                isSubmitting={isSubmitting}
                onSubmit={handleSubmit}
                onBack={() => setStep(2)}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}