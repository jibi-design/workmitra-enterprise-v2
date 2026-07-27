/** Job Mitra | ActiveShiftWorkspacesStrip.tsx | Live workspace strip — glass + pressable */

import { useMemo, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "../../../../app/router/routePaths";
import { EnterpriseEmpty } from "../../../../shared/components/enterprise";
import {
  formatWorkspaceDateRange,
  getWorkspaceCategoryLabel,
  getWorkspaceStatusLabel,
} from "../helpers/myShiftWorkspaces.helpers";
import { shiftWorkspacesStorage } from "../storage/shiftWorkspaces.storage";
import type { ShiftWorkspace } from "../types/shiftWorkspace.types";

const MAX_CARDS = 3;

function listActiveUpcoming(workspaces: ShiftWorkspace[]): ShiftWorkspace[] {
  return workspaces
    .filter((w) => w.status === "active" || w.status === "upcoming")
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      return a.startAt - b.startAt;
    })
    .slice(0, MAX_CARDS);
}

export function ActiveShiftWorkspacesStrip() {
  const nav = useNavigate();
  const workspaces = useSyncExternalStore(
    (cb) => shiftWorkspacesStorage.subscribe(cb),
    () => shiftWorkspacesStorage.getAll(),
    () => shiftWorkspacesStorage.getAll(),
  );

  const active = useMemo(() => listActiveUpcoming(workspaces), [workspaces]);

  return (
    <section
      className="wm-shift-surface-glass wm-shift-surface-glass--shift wm-ee-vShift wm-animateIn wm-shift-stagger--1"
      data-testid="active-shift-workspaces-strip"
      style={{ padding: "14px 14px 12px" }}
    >
      <div className="wm-pageSub">Active & Upcoming Shifts</div>
      <div className="wm-ee-cardTitle" style={{ fontSize: 15, marginTop: 2 }}>
        Your live workspaces
      </div>

      {active.length === 0 ? (
        <div style={{ marginTop: 12 }}>
          <EnterpriseEmpty
            domain="shift"
            title="No active shifts assigned"
            subtitle="When you are confirmed on a shift, it appears here for one-tap workspace access."
            primaryLabel="Find Shifts"
            onPrimary={() => nav(ROUTE_PATHS.employeeShiftSearch)}
            testId="active-shift-empty"
          />
        </div>
      ) : (
        <div className="wm-shift-activeStripRow">
          {active.map((ws, index) => (
            <button
              key={ws.id}
              type="button"
              className={`wm-shift-card wm-shift-pressable wm-animateIn wm-shift-stagger--${Math.min(index + 1, 3)}`}
              data-testid={`active-shift-card-${ws.id}`}
              onClick={() => nav(ROUTE_PATHS.employeeShiftWorkspace.replace(":workspaceId", ws.id))}
              style={{
                minWidth: 220,
                maxWidth: 260,
                flex: "0 0 auto",
                textAlign: "left",
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: ws.status === "active" ? "#15803d" : "#64748b",
                }}
              >
                {getWorkspaceStatusLabel(ws.status)} · {getWorkspaceCategoryLabel(ws.category)}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 900,
                  color: "var(--wm-er-text)",
                  marginTop: 6,
                  lineHeight: 1.25,
                }}
              >
                {ws.jobName}
              </div>
              <div style={{ fontSize: 12, color: "var(--wm-neutral-500)", marginTop: 4 }}>
                {ws.companyName}
              </div>
              <div style={{ fontSize: 11, color: "var(--wm-neutral-500)", marginTop: 6 }}>
                {ws.locationName}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#15803d", marginTop: 6 }}>
                {formatWorkspaceDateRange(ws.startAt, ws.endAt)}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#15803d", marginTop: 10 }}>
                Open workspace ›
              </div>
            </button>
          ))}
        </div>
      )}

      {active.length > 0 ? (
        <button
          type="button"
          className="wm-outlineBtn wm-shift-pressable"
          style={{ marginTop: 10, fontSize: 12, width: "100%" }}
          onClick={() => nav(ROUTE_PATHS.employeeShiftWorkspaces)}
        >
          View all workspaces
        </button>
      ) : null}
    </section>
  );
}
