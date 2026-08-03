/** Job Mitra | ErrorBoundary.tsx | src/shared/components/error/ErrorBoundary.tsx */

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    void import("../../observability/monitor").then(({ captureException }) => {
      captureException(error, {
        kind: "react_error_boundary_alt",
        componentStack: errorInfo.componentStack ?? undefined,
      });
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            className="wm-route-guard-denied"
            role="alert"
            style={{ fontFamily: "var(--wm-font-sans, system-ui, sans-serif)" }}
          >
            <h2 className="wm-route-guard-denied__title">Something went wrong.</h2>
            <p className="wm-route-guard-denied__body">
              The application encountered an unexpected error. Please try refreshing.
            </p>
            <div className="wm-route-guard-denied__actions">
              <button
                type="button"
                className="wm-primarybtn"
                onClick={() => window.location.reload()}
              >
                Refresh App
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
