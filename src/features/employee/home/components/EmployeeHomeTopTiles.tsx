/** Job Mitra | EmployeeHomeTopTiles.tsx | Glass Digital ID + frosted quick tiles */

type Props = {
  userName: string;
  upcomingShiftDisplay: string;
  shiftBroadcastUnreadDisplay: string;
  onShiftTile: () => void;
  onBroadcastTile: () => void;
};

function resolveStatusBadge(upcomingShiftDisplay: string): string {
  const digits = upcomingShiftDisplay.replace(/[^\d]/g, "");
  const count = digits ? Number.parseInt(digits, 10) : 0;

  if (Number.isFinite(count) && count > 0) {
    return `${upcomingShiftDisplay} shift${count === 1 ? "" : "s"} this week`;
  }

  return "Active";
}

export function EmployeeHomeTopTiles({
  userName,
  upcomingShiftDisplay,
  shiftBroadcastUnreadDisplay,
  onShiftTile,
  onBroadcastTile,
}: Props) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const statusBadge = resolveStatusBadge(upcomingShiftDisplay);
  const initial = userName.trim().charAt(0).toUpperCase() || "U";

  return (
    <div className="wm-homePage" style={{ gap: 16 }}>
      <header className="wm-homeHero wm-homeHero--employee wm-homeCardEnter">
        <div className="wm-homeHero__orb wm-homeHero__orb--employee" aria-hidden="true" />
        <div className="wm-homeHero__content">
          <div
            className="wm-homeHero__subtitle"
            style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}
          >
            {greeting},
          </div>
          <h1 className="wm-homeHero__title wm-typeHero" style={{ marginTop: 4 }}>
            {userName}
          </h1>
          <div
            style={{
              marginTop: 12,
              display: "inline-block",
              padding: "4px 10px",
              background: "rgba(255, 255, 255, 0.15)",
              borderRadius: 100,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            {statusBadge}
          </div>
        </div>
        <div
          className="wm-homeHero__avatar"
          style={{
            borderColor: "rgba(22, 163, 74, 0.45)",
            boxShadow: "0 0 0 3px rgba(22, 163, 74, 0.22), 0 0 14px rgba(22, 163, 74, 0.28)",
            background: "rgba(255,255,255,0.2)",
          }}
          aria-hidden="true"
        >
          {initial}
        </div>
      </header>

      <div className="wm-homeQuickTiles">
        <button
          type="button"
          className="wm-homeQuickTile wm-press-card wm-homeCardEnter wm-homeCardEnter--1"
          onClick={onShiftTile}
          aria-label={`${upcomingShiftDisplay} upcoming shifts`}
        >
          <div
            className="wm-homeQuickTile__value"
            style={{ color: "var(--wm-shift-accent, #2563EB)" }}
          >
            {upcomingShiftDisplay}
          </div>
          <div>
            <div
              className="wm-homeQuickTile__label"
              style={{ color: "var(--wm-neutral-900)", fontWeight: 700 }}
            >
              Shifts
            </div>
            <div className="wm-homeQuickTile__label">Upcoming</div>
          </div>
        </button>

        <button
          type="button"
          className="wm-homeQuickTile wm-press-card wm-homeCardEnter wm-homeCardEnter--2"
          onClick={onBroadcastTile}
          aria-label={`${shiftBroadcastUnreadDisplay} broadcast alerts`}
        >
          <div
            className="wm-homeQuickTile__value"
            style={{ color: "var(--wm-shift-accent, #27AE60)" }}
          >
            {shiftBroadcastUnreadDisplay}
          </div>
          <div>
            <div
              className="wm-homeQuickTile__label"
              style={{ color: "var(--wm-neutral-900)", fontWeight: 700 }}
            >
              Alerts
            </div>
            <div className="wm-homeQuickTile__label">Broadcasts</div>
          </div>
        </button>
      </div>
    </div>
  );
}
