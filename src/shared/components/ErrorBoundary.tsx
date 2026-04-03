// src/shared/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from "react";

/* ------------------------------------------------ */
/* Types                                            */
/* ------------------------------------------------ */
interface ErrorBoundaryProps {
  /** Optional fallback UI. If not provided, default recovery card is shown. */
  fallback?: ReactNode;
  /** Where the "Go Home" button navigates. Defaults to "/" */
  homePath?: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/* ------------------------------------------------ */
/* Error Boundary (Class component — required by React) */
/* ------------------------------------------------ */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Phase-0: console log only. Production: send to error tracking service.
    console.error("[WorkMitra ErrorBoundary]", error, info.componentStack);
  }

  private handleGoHome = (): void => {
    const path = this.props.homePath ?? "/";
    this.setState({ hasError: false, error: null });
    window.location.hash = `#${path}`;
  };

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Custom fallback provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    // Default recovery card — enterprise styled, Play Store safe (no browser alerts)
    return (
      <div
        role="alert"
        aria-live="assertive"
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 400,
            background: "#fff",
            border: "1px solid var(--wm-er-border, #e5e7eb)",
            borderRadius: "var(--wm-radius-14, 14px)",
            padding: 24,
            textAlign: "center",
          }}
        >
          {/* Icon */}
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 16px",
              borderRadius: 12,
              background: "rgba(220, 38, 38, 0.08)",
              border: "1px solid rgba(220, 38, 38, 0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="rgba(220, 38, 38, 0.85)"
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"
              />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "var(--wm-er-text, #111827)",
              marginBottom: 8,
            }}
          >
            Something went wrong
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 13,
              color: "var(--wm-er-muted, #6b7280)",
              lineHeight: 1.5,
              marginBottom: 20,
            }}
          >
            An unexpected error occurred. You can try again or return to the home screen.
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={this.handleRetry}
              style={{
                height: 40,
                borderRadius: "var(--wm-radius-14, 14px)",
                border: "1px solid var(--wm-er-border, #e5e7eb)",
                background: "#fff",
                padding: "0 16px",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                color: "var(--wm-er-text, #111827)",
              }}
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={this.handleGoHome}
              style={{
                height: 40,
                borderRadius: "var(--wm-radius-14, 14px)",
                border: 0,
                background: "var(--wm-brand-600, #1d4ed8)",
                padding: "0 16px",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                color: "#fff",
              }}
            >
              Go Home
            </button>
          </div>

          {/* Error detail (dev only — collapsed) */}
          {this.state.error && (
            <details
              style={{
                marginTop: 16,
                textAlign: "left",
                fontSize: 11,
                color: "var(--wm-er-muted, #6b7280)",
              }}
            >
              <summary style={{ cursor: "pointer", fontWeight: 700 }}>
                Error details
              </summary>
              <pre
                style={{
                  marginTop: 8,
                  padding: 10,
                  background: "#f9fafb",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  overflow: "auto",
                  maxHeight: 120,
                  fontSize: 11,
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {this.state.error.message}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
