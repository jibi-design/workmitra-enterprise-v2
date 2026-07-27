/** Route guard Loading / Access Denied primitives (RBAC Wave 3 P2). */

type LoadingProps = {
  overlay?: boolean;
  label?: string;
};

export function RouteGuardLoading({ overlay = false, label = "Loading session" }: LoadingProps) {
  return (
    <div
      className={`wm-route-guard-loading${overlay ? " wm-route-guard-loading--overlay" : ""}`}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div className="wm-route-guard-spinner" aria-hidden="true" />
    </div>
  );
}

type DeniedProps = {
  title?: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function RouteGuardDenied({
  title = "Access denied",
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: DeniedProps) {
  return (
    <div className="wm-route-guard-denied" role="alert">
      <h1 className="wm-route-guard-denied__title">{title}</h1>
      <p className="wm-route-guard-denied__body">{message}</p>
      <div className="wm-route-guard-denied__actions">
        <button type="button" className="wm-primarybtn" onClick={onPrimary}>
          {primaryLabel}
        </button>
        {secondaryLabel && onSecondary ? (
          <button type="button" className="wm-outlineBtn" onClick={onSecondary}>
            {secondaryLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
