// App: Job Mitra / WorkMitra_Enterprise_v2
// File: careerWorkspaceDisplayHelpers.ts
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\careerJobs\helpers\careerWorkspaceDisplayHelpers.ts

import type { CSSProperties } from "react";

export type BadgeTone = "career" | "neutral" | "warn" | "bad";

export function fmtDateTime(ts: number): string {
  try {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function statusTone(s: string): BadgeTone {
  if (s === "terminated") return "bad";
  if (s === "completed") return "neutral";
  if (s === "notice" || s === "resigned") return "warn";
  return "career";
}

export function statusLabel(s: string): string {
  if (s === "onboarding") return "Career Workspace";
  if (s === "active") return "Career Workspace";
  if (s === "completed") return "Completed";
  if (s === "terminated") return "Terminated";
  return s;
}

export function isRatableStatus(s: string): boolean {
  return s === "completed" || s === "terminated";
}

export function toneBadgeStyle(tone: BadgeTone): CSSProperties {
  if (tone === "career") {
    return {
      border: "1px solid rgba(29,78,216,0.18)",
      background: "rgba(29,78,216,0.08)",
      color: "#1e3a8a",
    };
  }

  if (tone === "warn") {
    return {
      border: "1px solid rgba(217,119,6,0.30)",
      background: "rgba(217,119,6,0.10)",
      color: "#92400e",
    };
  }

  if (tone === "bad") {
    return {
      border: "1px solid rgba(220,38,38,0.30)",
      background: "rgba(220,38,38,0.10)",
      color: "#991b1b",
    };
  }

  return {
    border: "1px solid rgba(29,78,216,0.12)",
    background: "rgba(29,78,216,0.04)",
    color: "var(--wm-career-muted, #6b7280)",
  };
}

export function explanationBorder(tone: BadgeTone): string {
  if (tone === "career") return "rgba(29,78,216,0.16)";
  if (tone === "warn") return "rgba(217,119,6,0.18)";
  if (tone === "bad") return "rgba(220,38,38,0.18)";
  return "var(--wm-career-border, rgba(15,23,42,0.10))";
}

export function explanationBg(tone: BadgeTone): string {
  if (tone === "career") return "rgba(29,78,216,0.045)";
  if (tone === "warn") return "rgba(217,119,6,0.04)";
  if (tone === "bad") return "rgba(220,38,38,0.04)";
  return "transparent";
}

export function statusExplanation(status: string): {
  title: string;
  body: string;
  tone: BadgeTone;
} | null {
  if (status === "onboarding" || status === "active") {
    return {
      title: "Career workspace",
      body: "This is your Career Jobs workspace. Employer updates, employment status, resignation actions, and work history updates will appear here.",
      tone: "career",
    };
  }

  if (status === "completed") {
    return {
      title: "Completed",
      body: "This position has been completed. The workspace is now read-only.",
      tone: "neutral",
    };
  }

  if (status === "terminated") {
    return {
      title: "Terminated",
      body: "This position has been terminated. The workspace is now read-only.",
      tone: "bad",
    };
  }

  return null;
}

export function updateKindLabel(kind: string): string {
  if (kind === "broadcast") return "ANNOUNCEMENT";
  if (kind === "direct") return "DIRECT";
  return "SYSTEM";
}

export function updateKindTone(kind: string): BadgeTone {
  if (kind === "direct") return "career";
  return "neutral";
}

export function updateRowBorder(kind: string): string {
  if (kind === "broadcast") return "1px solid rgba(29,78,216,0.12)";
  if (kind === "direct") return "1px solid rgba(29,78,216,0.22)";
  return "1px solid var(--wm-career-border, rgba(15,23,42,0.10))";
}

export function updateRowBg(kind: string): string {
  if (kind === "broadcast") return "rgba(29,78,216,0.04)";
  if (kind === "direct") return "rgba(29,78,216,0.06)";
  return "rgba(17,24,39,0.02)";
}
