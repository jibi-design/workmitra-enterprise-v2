/**
 * Defense Layer 2 — pluggable monitoring sink (console + optional Sentry).
 */

import * as Sentry from "@sentry/node";
import { isProduction } from "../modules/auth/env.js";
import { sanitizeForLog, sanitizeString } from "./sanitize.js";

export type MonitorLevel = "fatal" | "error" | "warning" | "info";

export type MonitorContext = Record<string, unknown>;

export interface MonitoringSink {
  captureException(error: unknown, context?: MonitorContext): void;
  captureMessage(message: string, level?: MonitorLevel, context?: MonitorContext): void;
}

class ConsoleSink implements MonitoringSink {
  captureException(error: unknown, context?: MonitorContext): void {
    const safe = sanitizeForLog({ error, context });
    console.error("[wm-monitor:exception]", safe);
  }

  captureMessage(message: string, level: MonitorLevel = "info", context?: MonitorContext): void {
    const safeMsg = sanitizeString(message);
    const safeCtx = context ? sanitizeForLog(context) : undefined;
    const line = `[wm-monitor:${level}] ${safeMsg}`;
    if (level === "fatal" || level === "error") {
      console.error(line, safeCtx ?? "");
    } else if (level === "warning") {
      console.warn(line, safeCtx ?? "");
    } else {
      console.info(line, safeCtx ?? "");
    }
  }
}

class SentrySink implements MonitoringSink {
  captureException(error: unknown, context?: MonitorContext): void {
    const safeCtx = context ? (sanitizeForLog(context) as Record<string, unknown>) : undefined;
    Sentry.withScope((scope) => {
      if (safeCtx) {
        scope.setExtras(safeCtx);
      }
      Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
    });
  }

  captureMessage(message: string, level: MonitorLevel = "info", context?: MonitorContext): void {
    const safeCtx = context ? (sanitizeForLog(context) as Record<string, unknown>) : undefined;
    Sentry.withScope((scope) => {
      if (safeCtx) {
        scope.setExtras(safeCtx);
      }
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
        // never throw from monitoring
      }
    }
  }

  captureMessage(message: string, level?: MonitorLevel, context?: MonitorContext): void {
    for (const s of this.sinks) {
      try {
        s.captureMessage(message, level, context);
      } catch {
        // never throw from monitoring
      }
    }
  }
}

let sink: MonitoringSink = new ConsoleSink();
let initialized = false;

/**
 * Init monitoring once at process boot.
 * Sentry activates only when SENTRY_DSN is set.
 */
export function initServerMonitor(): void {
  if (initialized) return;
  initialized = true;

  const sinks: MonitoringSink[] = [new ConsoleSink()];
  const dsn = process.env.SENTRY_DSN?.trim();

  if (dsn) {
    Sentry.init({
      dsn,
      environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV ?? "development",
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? (isProduction() ? 0.1 : 0)),
      beforeSend(event) {
        // Extra belt: scrub event payloads
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
    console.log("[Job Mitra API] Sentry monitoring enabled.");
  } else {
    console.log("[Job Mitra API] Sentry DSN unset — console monitoring only.");
  }

  sink = new FanoutSink(sinks);

  process.on("unhandledRejection", (reason) => {
    sink.captureException(reason, { kind: "unhandledRejection" });
  });

  process.on("uncaughtException", (error) => {
    sink.captureException(error, { kind: "uncaughtException" });
    // Fail closed after reporting — solo-ops safety
    if (isProduction()) {
      console.error("[FATAL] uncaughtException — process will exit");
      void Sentry.close(2000).finally(() => process.exit(1));
    }
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

/** Test hook */
export function __setMonitorSinkForTests(next: MonitoringSink): void {
  sink = next;
  initialized = true;
}
