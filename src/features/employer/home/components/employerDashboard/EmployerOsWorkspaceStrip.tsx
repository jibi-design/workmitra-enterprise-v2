/** Active workspace counts — Shift and Career stay as separate taps. */

import { useNavigate } from "react-router-dom";
import type { EmployerOsWorkspaceStrip } from "../../helpers/employerDashboard.osOps";

type Props = {
  readonly strip: EmployerOsWorkspaceStrip;
};

export function EmployerOsWorkspaceStrip({ strip }: Props) {
  const nav = useNavigate();

  return (
    <section
      className="wm-erDashWsStrip"
      data-testid="employer-os-workspace-strip"
      aria-label="Active workspaces"
    >
      <div className="wm-erDashWsStrip__kicker">Active workspaces</div>
      <div className="wm-erDashWsStrip__row">
        <button
          type="button"
          className="wm-erDashWsChip wm-erDashWsChip--shift"
          data-testid="employer-os-ws-shift"
          onClick={() => nav(strip.shiftHref)}
        >
          <span className="wm-erDashWsChip__value">{strip.shiftCount}</span>
          <span className="wm-erDashWsChip__label">Shift workspaces</span>
        </button>
        <button
          type="button"
          className="wm-erDashWsChip wm-erDashWsChip--career"
          data-testid="employer-os-ws-career"
          onClick={() => nav(strip.careerHref)}
        >
          <span className="wm-erDashWsChip__value">{strip.careerCount}</span>
          <span className="wm-erDashWsChip__label">Career workspaces</span>
        </button>
      </div>
    </section>
  );
}
