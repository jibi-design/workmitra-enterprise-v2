/** Job Mitra | ErrorBoundary.tsx | src/shared/components/error/ErrorBoundary.tsx */

import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * ARCHITECTURE NOTE:
 * Graceful fallback UI for unexpected runtime exceptions.
 */

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
    // AUDIT: Removed unused 'error' parameter to satisfy ESLint TS6133
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Uncaught Error Boundary Triggered]:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "50vh",
            }}
          >
            <h2 style={{ color: "#0F172A", margin: "0 0 12px 0" }}>Something went wrong.</h2>
            <p style={{ color: "#64748B", fontSize: 14, maxWidth: 300, margin: "0 0 24px 0" }}>
              The application encountered an unexpected error. Please try refreshing.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "10px 20px",
                background: "#0F172A",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Refresh App
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
