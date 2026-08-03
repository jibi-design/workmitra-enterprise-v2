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
    <div className="wm-homeStack">
      <header className="wm-homeHero wm-homeHero--employee wm-homeCardEnter">
        <div className="wm-homeHero__orb wm-homeHero__orb--employee" aria-hidden="true" />
        <div className="wm-homeHero__content">
          <div className="wm-homeHero__subtitle" style={{ color: "rgba(255,255,255,0.8)" }}>
            {greeting},
          </div>
          <h1 className="wm-homeHero__title wm-typeHero">{userName}</h1>
          <div className="wm-homeHero__badge">{statusBadge}</div>
        </div>
        <div className="wm-homeHero__avatar wm-homeHero__avatar--employeeLive" aria-hidden="true">
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
          <div className="wm-homeQuickTile__value wm-homeQuickTile__value--shift">
            {upcomingShiftDisplay}
          </div>
          <div>
            <div className="wm-homeQuickTile__label wm-homeQuickTile__label--strong">Shifts</div>
            <div className="wm-homeQuickTile__label">Upcoming</div>
          </div>
        </button>

        <button
          type="button"
          className="wm-homeQuickTile wm-press-card wm-homeCardEnter wm-homeCardEnter--2"
          onClick={onBroadcastTile}
          aria-label={`${shiftBroadcastUnreadDisplay} broadcast alerts`}
        >
          <div className="wm-homeQuickTile__value wm-homeQuickTile__value--alerts">
            {shiftBroadcastUnreadDisplay}
          </div>
          <div>
            <div className="wm-homeQuickTile__label wm-homeQuickTile__label--strong">Alerts</div>
            <div className="wm-homeQuickTile__label">Broadcasts</div>
          </div>
        </button>
      </div>
    </div>
  );
}
