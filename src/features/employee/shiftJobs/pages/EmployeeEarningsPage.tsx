// src/features/employee/shiftJobs/pages/EmployeeEarningsPage.tsx
//
// Earnings Tracker — shows worker's confirmed shift earnings.
// Summary tiles, monthly chart, company breakdown, shift list.
// Domain: Shift Green.

import { useSyncExternalStore } from "react";
import { earningsStorage } from "../storage/earningsStorage";
import type { EarningsSummary } from "../storage/earningsStorage";

/* ------------------------------------------------ */
/* Snapshot                                         */
/* ------------------------------------------------ */
let _aRaw: string | null = "__init__";
let _cache: EarningsSummary | null = null;

function getSnapshot(): EarningsSummary {
  const raw = localStorage.getItem("wm_employee_shift_applications_v1");
  if (raw !== _aRaw || !_cache) {
    _aRaw   = raw;
    _cache  = earningsStorage.getSummary();
  }
  return _cache;
}

/* ------------------------------------------------ */
/* Helpers                                          */
/* ------------------------------------------------ */
const GREEN = "#16a34a";



function fmtDateRange(s: number, e: number): string {
  try {
    const sd = new Date(s); const ed = new Date(e);
    if (sd.toDateString() === ed.toDateString())
      return sd.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    return `${sd.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${ed.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  } catch { return ""; }
}

/* ------------------------------------------------ */
/* Bar chart component                              */
/* ------------------------------------------------ */
function MiniBarChart({ data }: { data: { label: string; earned: number }[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.earned), 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 60, marginTop: 8 }}>
      {data.map((d) => {
        const pct = Math.round((d.earned / max) * 100);
        return (
          <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 9, color: "var(--wm-er-muted)", fontWeight: 600, textAlign: "center" }}>
              {d.earned.toLocaleString()}
            </div>
            <div style={{
              width: "100%", borderRadius: "4px 4px 0 0",
              height: `${Math.max(4, pct * 0.44)}px`,
              background: `rgba(22,163,74,${0.4 + pct / 200})`,
              transition: "height 0.3s ease",
            }} />
            <div style={{ fontSize: 9, color: "var(--wm-er-muted)", fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>
              {d.label}
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
export function EmployeeEarningsPage() {
  const summary = useSyncExternalStore(earningsStorage.subscribe, getSnapshot, getSnapshot);

  const isEmpty = summary.totalShifts === 0;

  return (
    <div>
      {/* Header */}
      <div className="wm-pageHead">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(22,163,74,0.08)", color: GREEN,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4Z" />
            </svg>
          </div>
          <div>
            <div className="wm-pageTitle">Earnings Tracker</div>
            <div className="wm-pageSub">Your confirmed shift earnings</div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="wm-ee-card" style={{ marginTop: 14, padding: 28, textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>&#128176;</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--wm-er-text)" }}>No earnings yet</div>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 6, lineHeight: 1.6 }}>
            Your earnings will appear here once you are confirmed for a shift.
          </div>
        </div>
      )}

      {!isEmpty && (
        <>
          {/* Summary tiles */}
          <div className="wm-ee-tiles" style={{ marginTop: 14 }}>
            <div className="wm-ee-tile">
              <div className="wm-ee-tileLabel">Total Earned</div>
              <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: GREEN }}>
                {summary.totalEarned.toLocaleString()}
              </div>
            </div>
            <div className="wm-ee-tile">
              <div className="wm-ee-tileLabel">Shifts</div>
              <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: GREEN }}>
                {summary.totalShifts}
              </div>
            </div>
            <div className="wm-ee-tile">
              <div className="wm-ee-tileLabel">Days Worked</div>
              <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: "var(--wm-er-text)" }}>
                {summary.totalDays}
              </div>
            </div>
          </div>

          <div className="wm-ee-tiles" style={{ marginTop: 8 }}>
            <div className="wm-ee-tile">
              <div className="wm-ee-tileLabel">Avg / Shift</div>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
                {summary.avgPerShift.toLocaleString()}
              </div>
            </div>
            <div className="wm-ee-tile">
              <div className="wm-ee-tileLabel">Avg / Day</div>
              <div style={{ marginTop: 4, fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
                {summary.avgPerDay.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Monthly breakdown */}
          {summary.byMonth.length > 0 && (
            <div className="wm-ee-card" style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 4 }}>
                Monthly Earnings
              </div>
              <MiniBarChart data={summary.byMonth} />
            </div>
          )}

          {/* Weekly breakdown */}
          {summary.byWeek.length > 0 && (
            <div className="wm-ee-card" style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 10 }}>
                Weekly Breakdown
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {summary.byWeek.map((w) => {
                  const pct = Math.round((w.earned / summary.totalEarned) * 100);
                  return (
                    <div key={w.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: "var(--wm-er-text)" }}>Week of {w.label}</span>
                        <span style={{ fontWeight: 700, color: GREEN }}>{w.earned.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: "var(--wm-er-bg)" }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          width: `${pct}%`, background: GREEN,
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                        {w.shifts} shift{w.shifts !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* By company */}
          {summary.byCompany.length > 0 && (
            <div className="wm-ee-card" style={{ marginTop: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 10 }}>
                By Company
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {summary.byCompany.map((c) => {
                  const pct = Math.round((c.earned / summary.totalEarned) * 100);
                  return (
                    <div key={c.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: "var(--wm-er-text)" }}>{c.name}</span>
                        <span style={{ fontWeight: 700, color: GREEN }}>{c.earned.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 6, borderRadius: 999, background: "var(--wm-er-bg)" }}>
                        <div style={{
                          height: "100%", borderRadius: 999,
                          width: `${pct}%`,
                          background: GREEN,
                          transition: "width 0.3s ease",
                        }} />
                      </div>
                      <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                        {c.shifts} shift{c.shifts !== 1 ? "s" : ""} &middot; {pct}% of total
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Shift list */}
          <div style={{ marginTop: 14, marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", marginBottom: 10 }}>
              Confirmed Shifts
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {summary.entries.map((e) => (
                <div key={e.appId} className="wm-ee-card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {e.jobName} &mdash; {e.companyName}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2 }}>
                        {e.locationName} &middot; {fmtDateRange(e.startAt, e.endAt)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>
                        {e.totalEarned.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--wm-er-muted)", marginTop: 2 }}>
                        {e.payPerDay}/day &times; {e.totalDays} day{e.totalDays !== 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}