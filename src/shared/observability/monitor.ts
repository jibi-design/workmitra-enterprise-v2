/**
 * Defense Layer 2 — frontend pluggable monitor (console + optional Sentry).
 */

import * as Sentry from "@sentry/react";
import { sanitizeForLog, sanitizeString } from "./sanitize";

export type MonitorLevel = "fatal" | "error" | "warning" | "info";

export type MonitorContext = Record<string, unknown>;

export interface MonitoringSink {
  captureException(error: unknown, context?: MonitorContext): void;
  captureMessage(message: string, level?: MonitorLevel, context?: MonitorContext): void;
}

class ConsoleSink implements MonitoringSink {
  captureException(error: unknown, context?: MonitorContext): void {
    console.error("[wm-monitor:exception]", sanitizeForLog({ error, context }));
  }

  captureMessage(message: string, level: MonitorLevel = "info", context?: MonitorContext): void {
    const line = `[wm-monitor:${level}] ${sanitizeString(message)}`;
    const safeCtx = context ? sanitizeForLog(context) : undefined;
    if (level === "fatal" || level === "error") console.error(line, safeCtx ?? "");
    else if (level === "warning") console.warn(line, safeCtx ?? "");
    else console.info(line, safeCtx ?? "");
  }
}

class SentrySink implements MonitoringSink {
  captureException(error: unknown, context?: MonitorContext): void {
    const safeCtx = context ? (sanitizeForLog(context) as Record<string, unknown>) : undefined;
    Sentry.withScope((scope) => {
      if (safeCtx) scope.setExtras(safeCtx);
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
    });
  }

  captureMessage(message: string, level: MonitorLevel = "info", context?: MonitorContext): void {
    const safeCtx = context ? (sanitizeForLog(context) as Record<string, unknown>) : undefined;
    Sentry.withScope((scope) => {
      if (safeCtx) scope.setExtras(safeCtx);
      Sentry.captureMessage(sanitizeString(message), level);
    });
  }
}

class FanoutSink implements MonitoringSink {
  private readonly sinks: MonitoringSink[];

  constructor(sinks: MonitoringSink[]) {
    this.sinks = sinks;
  }

  captureException(error: unknown, context?: MonitorContext): void {
    for (const s of this.sinks) {
      try {
        s.captureException(error, context);
      } catch {
        /* ignore */
      }
    }
  }

  captureMessage(message: string, level?: MonitorLevel, context?: MonitorContext): void {
    for (const s of this.sinks) {
      try {
        s.captureMessage(message, level, context);
      } catch {
        /* ignore */
      }
    }
  }
}

let sink: MonitoringSink = new ConsoleSink();
let initialized = false;

export function initClientMonitor(): void {
  if (initialized) return;
  initialized = true;

  const sinks: MonitoringSink[] = [new ConsoleSink()];
  const dsn = String(import.meta.env.VITE_SENTRY_DSN ?? "").trim();

  if (dsn) {
    Sentry.init({
      dsn,
      environment: String(import.meta.env.MODE ?? "development"),
      tracesSampleRate: Number(import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE ?? 0),
      beforeSend(event) {
        if (event.message) event.message = sanitizeString(event.message);
        if (event.exception?.values) {
          for (const ex of event.exception.values) {
            if (ex.value) ex.value = sanitizeString(ex.value);
          }
        }
        if (event.extra) {
          event.extra = sanitizeForLog(event.extra) as Record<string, unknown>;
        }
        return event;
      },
    });
    sinks.push(new SentrySink());
  }

  sink = new FanoutSink(sinks);

  window.addEventListener("error", (ev) => {
    sink.captureException(ev.error ?? ev.message, {
      kind: "window.onerror",
      filename: ev.filename,
    });
  });

  window.addEventListener("unhandledrejection", (ev) => {
    sink.captureException(ev.reason, { kind: "unhandledrejection" });
  });
}

export function captureException(error: unknown, context?: MonitorContext): void {
  sink.captureException(error, context);
}

export function captureMessage(
  message: string,
  level: MonitorLevel = "info",
  context?: MonitorContext,
): void {
  sink.captureMessage(message, level, context);
}
