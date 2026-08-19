/** Job Mitra | ErrorBoundary.tsx | C:\projects\WorkMitra_Enterprise_v2\src\shared\components\ErrorBoundary.tsx */

import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

const CHUNK_RELOAD_KEY = "wm:chunk-reload-attempted";

function isDynamicImportError(error: Error | null): boolean {
  if (!error) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("importing a module script failed") ||
    message.includes("error loading dynamically imported module")
  );
}

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  homePath?: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    void import("../observability/monitor").then(({ captureException }) => {
      captureException(error, {
        kind: "react_error_boundary",
        componentStack: info.componentStack ?? undefined,
      });
    });
  }

  private handleGoHome = (): void => {
    sessionStorage.removeItem(CHUNK_RELOAD_KEY);
    const msg = (this.state.error?.message ?? "").toLowerCase();
    // Escape hatch: role-shell crashes (shift/storage install) → landing.
    // Otherwise prefer the shell homePath so Go Home stays in-context.
    const useLanding =
      msg.includes("shift") ||
      msg.includes("storage") ||
      msg.includes("install") ||
      msg.includes("cannot access");
    const path = useLanding ? "/" : (this.props.homePath ?? "/");
    const hash = path.startsWith("/") ? path : `/${path}`;
    window.location.replace(`${window.location.origin}${window.location.pathname}#${hash}`);
  };

  private handleRetry = (): void => {
    if (isDynamicImportError(this.state.error)) {
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      window.location.reload();
      return;
    }

    // Soft remount often rethrows the same error — hard reload for a clean tree.
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <div className="wm-errorFallback" role="alert" aria-live="assertive">
        <div className="wm-errorFallback__card">
          <div className="wm-errorFallback__icon" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
              />
            </svg>
          </div>

          <div className="wm-errorFallback__title">This screen didn’t load</div>
          <div className="wm-errorFallback__body">
            Refresh the page, or go home and open it again.
          </div>

          <div className="wm-errorFallback__actions">
            <button type="button" className="wm-outlineBtn" onClick={this.handleRetry}>
              Try Again
            </button>
            <button type="button" className="wm-primarybtn" onClick={this.handleGoHome}>
              Go Home
            </button>
          </div>

          {this.state.error && import.meta.env.DEV ? (
            <details className="wm-errorFallback__details">
              <summary>Error details</summary>
              <pre className="wm-errorFallback__pre" data-testid="error-boundary-message">
                {this.state.error.message}
              </pre>
            </details>
          ) : null}
        </div>
      </div>
    );
  }
}

/** Remounts on route change so one screen crash cannot poison the shell. */
export function RouteErrorBoundary(props: {
  readonly homePath: string;
  readonly children: ReactNode;
}) {
  const loc = useLocation();
  return (
    <ErrorBoundary key={`${loc.pathname}${loc.search}`} homePath={props.homePath}>
      {props.children}
    </ErrorBoundary>
  );
}
