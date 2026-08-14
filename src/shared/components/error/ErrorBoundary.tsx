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
          <div className="wm-errorFallback" role="alert">
            <div className="wm-errorFallback__card">
              <h2 className="wm-errorFallback__title">This screen didn’t load</h2>
              <p className="wm-errorFallback__body">
                Refresh the page and we’ll try to open it again.
              </p>
              <div className="wm-errorFallback__actions">
                <button
                  type="button"
                  className="wm-primarybtn"
                  onClick={() => window.location.reload()}
                >
                  Refresh App
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
