import { useCallback, useEffect, useState } from "react";
import { APP_CONFIG } from "../../../../shared/utils/appConfig";

type AnomalyBadge = {
  total: number;
  red: number;
  yellow: number;
  latest: {
    kind: string;
    severity: string;
    detail: string;
    atIso: string;
  } | null;
};

type Props = {
  /** Optional ops bearer for Super-Admin BFF proxy; when absent, shows offline/demo state. */
  opsToken?: string | null;
};

function apiBase(): string {
  const fromEnv = import.meta.env.VITE_API_URL as string | undefined;
  if (fromEnv && fromEnv.trim()) return fromEnv.replace(/\/$/, "");
  if (import.meta.env.DEV) return "http://localhost:3001";
  return APP_CONFIG.api.baseUrl.replace(/\/$/, "");
}

/**
 * Visual anomaly badges for Super-Admin / DEV admin home.
 * Polls GET /v1/jobmitra/ops/anomalies when ops token is available.
 */
export function AdminAnomalyBadgeStrip({ opsToken }: Props) {
  const [badge, setBadge] = useState<AnomalyBadge | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token =
      opsToken ||
      (import.meta.env.VITE_WM_OPS_CONTROL_TOKEN as string | undefined) ||
      "";
    if (!token || token.length < 16) {
      setBadge(null);
      setError(null);
      return;
    }
    try {
      const res = await fetch(`${apiBase()}/v1/jobmitra/ops/anomalies?limit=20`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      if (!res.ok) {
        setError(`anomalies HTTP ${res.status}`);
        return;
      }
      const body = (await res.json()) as { badge?: AnomalyBadge };
      setBadge(body.badge || { total: 0, red: 0, yellow: 0, latest: null });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "unreachable");
    }
  }, [opsToken]);

  useEffect(() => {
    const t = window.setTimeout(() => void refresh(), 0);
    const interval = window.setInterval(() => void refresh(), 30_000);
    return () => {
      window.clearTimeout(t);
      window.clearInterval(interval);
    };
  }, [refresh]);

  if (!badge && !error) {
    return (
      <div className="wm-ad-anomalyStrip wm-ad-anomalyStrip--idle" role="status">
        <span className="wm-ad-anomalyBadge wm-ad-anomalyBadge--idle">Anomaly radar idle</span>
        <span className="wm-ad-anomalyHint">
          Connect ops control to enable live anomaly badges.
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wm-ad-anomalyStrip" role="status">
        <span className="wm-ad-anomalyBadge wm-ad-anomalyBadge--warn">Anomaly feed offline</span>
        <span className="wm-ad-anomalyHint">{error}</span>
      </div>
    );
  }

  const red = badge?.red ?? 0;
  const yellow = badge?.yellow ?? 0;
  const total = badge?.total ?? 0;

  return (
    <div className="wm-ad-anomalyStrip" aria-label="Anomaly detection badges">
      <span
        className={`wm-ad-anomalyBadge ${red > 0 ? "wm-ad-anomalyBadge--red" : "wm-ad-anomalyBadge--ok"}`}
      >
        Red {red}
      </span>
      <span
        className={`wm-ad-anomalyBadge ${yellow > 0 ? "wm-ad-anomalyBadge--yellow" : "wm-ad-anomalyBadge--ok"}`}
      >
        Yellow {yellow}
      </span>
      <span className="wm-ad-anomalyBadge wm-ad-anomalyBadge--neutral">Total {total}</span>
      {badge?.latest ? (
        <span className="wm-ad-anomalyHint" title={badge.latest.detail}>
          Latest: {badge.latest.kind} · {badge.latest.severity}
        </span>
      ) : (
        <span className="wm-ad-anomalyHint">No active anomaly events</span>
      )}
    </div>
  );
}
