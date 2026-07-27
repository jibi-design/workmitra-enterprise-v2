export function IconBell() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 0 0-5-6.71V3a2 2 0 0 0-4 0v1.29A7 7 0 0 0 5 11v5l-2 2v1h20v-1l-2-2Z"
      />
    </svg>
  );
}

export function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 11H7.83l5.58-5.59L12 4l-8 8l8 8l1.41-1.41L7.83 13H20v-2Z" />
    </svg>
  );
}

type EmployerTopbarProps = {
  shouldShowBack: boolean;
  isHome: boolean;
  unread: number;
  initials: string;
  topbarScrolled: boolean;
  isPlannerSubdomain: boolean;
  onBack: () => void;
  onHome: () => void;
  onOpenNotifications: () => void;
  onOpenSheet: () => void;
};

export function EmployerTopbar({
  shouldShowBack,
  isHome,
  unread,
  initials,
  topbarScrolled,
  isPlannerSubdomain,
  onBack,
  onHome,
  onOpenNotifications,
  onOpenSheet,
}: EmployerTopbarProps) {
  return (
    <div
      className={`wm-topbar wm-er-topbar${isPlannerSubdomain ? " wm-er-topbarPlanner" : ""}${topbarScrolled ? " wm-topbarScrolled" : ""}`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: shouldShowBack ? 10 : 0,
          minWidth: 0,
          flex: "1 1 auto",
        }}
      >
        <button
          className="wm-iconbtn"
          type="button"
          aria-label="Back"
          title="Back"
          aria-hidden={!shouldShowBack}
          disabled={!shouldShowBack}
          tabIndex={shouldShowBack ? 0 : -1}
          onClick={shouldShowBack ? onBack : undefined}
          style={{
            flex: shouldShowBack ? "0 0 40px" : "0 0 0px",
            width: shouldShowBack ? 40 : 0,
            minWidth: shouldShowBack ? 40 : 0,
            height: 40,
            padding: shouldShowBack ? undefined : 0,
            opacity: shouldShowBack ? 1 : 0,
            visibility: shouldShowBack ? "visible" : "hidden",
            pointerEvents: shouldShowBack ? "auto" : "none",
            borderColor: shouldShowBack ? undefined : "transparent",
            background: shouldShowBack ? undefined : "transparent",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <IconBack />
        </button>

        <div
          className="wm-title"
          style={{
            marginLeft: isHome ? 0 : 4,
            cursor: isHome ? "default" : "pointer",
            minWidth: 0,
            flex: "1 1 auto",
            overflow: "hidden",
          }}
          onClick={isHome ? undefined : onHome}
          onKeyDown={
            isHome
              ? undefined
              : (event) => {
                  if (event.key === "Enter") onHome();
                }
          }
          role={isHome ? undefined : "button"}
          tabIndex={isHome ? undefined : 0}
        >
          <h1>Job Mitra</h1>
          <p>Smart hiring starts with the right tools.</p>
        </div>
      </div>

      <div className="wm-topbarActions" aria-label="Top actions">
        <button
          className="wm-iconbtn wm-iconbtnBadgeWrap"
          type="button"
          aria-label="Notifications"
          title="Notifications"
          onClick={onOpenNotifications}
          style={{ color: "var(--wm-notification-accent, #0891b2)" }}
        >
          <div style={{ position: "relative", display: "inline-flex" }}>
            <IconBell />
            {unread > 0 ? (
              <span
                key={unread}
                className="wm-bellBadge wm-bellBadgeBounce"
                aria-label={`${unread} unread`}
              >
                {unread > 99 ? "99+" : unread}
              </span>
            ) : null}
          </div>
        </button>

        <button
          type="button"
          className="wm-avatarBtn"
          aria-label="Open account menu"
          title="Account menu"
          onClick={onOpenSheet}
        >
          {initials}
        </button>
      </div>
    </div>
  );
}
