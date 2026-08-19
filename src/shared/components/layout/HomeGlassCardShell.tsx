/** HomeGlassCardShell — unified frosted card chrome for home domain tiles */

import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

type HomeGlassCardShellProps = {
  readonly title: string;
  readonly subtitle?: string;
  readonly icon?: ReactNode;
  readonly trailing?: ReactNode;
  readonly onClick?: () => void;
  /** Use a div host when trailing embeds nested buttons (valid HTML). */
  readonly asDiv?: boolean;
  readonly audience?: "employee" | "employer";
  readonly tone?: "glass" | "dark";
  /** Column stack: icon+title row → children → subtitle → trailing. */
  readonly stack?: boolean;
  /** Persistent selected / current-route chrome (border + domain glow). */
  readonly active?: boolean;
  readonly iconStyle?: CSSProperties;
  readonly className?: string;
  readonly ariaLabel?: string;
  readonly children?: ReactNode;
};

function runOnEnterOrSpace(event: KeyboardEvent<HTMLElement>, action: () => void): void {
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  action();
}

export function HomeGlassCardShell({
  title,
  subtitle,
  icon,
  trailing,
  onClick,
  asDiv = false,
  audience = "employee",
  tone = "glass",
  stack = false,
  active = false,
  iconStyle,
  className,
  ariaLabel,
  children,
}: HomeGlassCardShellProps) {
  const classes = [
    "wm-homeGlassCard",
    "wm-press-card",
    audience === "employer" ? "wm-homeGlassCard--employer" : "",
    tone === "dark" ? "wm-homeGlassCard--dark" : "",
    stack ? "wm-homeGlassCard--stack" : "",
    active ? "is-active" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const iconNode = icon ? (
    <div className="wm-homeGlassCard__icon" style={iconStyle}>
      {icon}
    </div>
  ) : null;
  const titleNode = <div className="wm-homeGlassCard__title wm-typeCardTitle">{title}</div>;

  const content = stack ? (
    <>
      <div className="wm-homeGlassCard__head">
        {iconNode}
        {titleNode}
      </div>
      {children}
      {subtitle ? <div className="wm-homeGlassCard__subtitle">{subtitle}</div> : null}
      {trailing ? <div className="wm-homeGlassCard__trailing">{trailing}</div> : null}
    </>
  ) : (
    <>
      {iconNode}
      <div className="wm-homeGlassCard__copy">
        {titleNode}
        {subtitle ? <div className="wm-homeGlassCard__subtitle">{subtitle}</div> : null}
        {children}
      </div>
      {trailing ? <div className="wm-homeGlassCard__trailing">{trailing}</div> : null}
    </>
  );

  const currentAttrs = active
    ? ({ "aria-current": "page" as const })
    : ({} as Record<string, never>);

  if (onClick && asDiv) {
    return (
      <div
        role="button"
        tabIndex={0}
        className={classes}
        onClick={onClick}
        onKeyDown={(event) => runOnEnterOrSpace(event, onClick)}
        aria-label={ariaLabel ?? title}
        {...currentAttrs}
      >
        {content}
      </div>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-label={ariaLabel ?? title}
        {...currentAttrs}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={classes} aria-label={ariaLabel} {...currentAttrs}>
      {content}
    </div>
  );
}

export type { HomeGlassCardShellProps };
