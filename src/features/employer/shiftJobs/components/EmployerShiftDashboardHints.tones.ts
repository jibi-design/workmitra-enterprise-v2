/** Job Mitra | EmployerShiftDashboardHints.tones.ts */

export type HintTone = "success" | "warning" | "info";

export function getDashboardHintToneStyle(tone: HintTone): {
  readonly title: string;
  readonly text: string;
  readonly background: string;
  readonly border: string;
  readonly button: string;
} {
  if (tone === "success") {
    return {
      title: "#166534",
      text: "#166534",
      background: "rgba(22,163,74,0.06)",
      border: "1px solid rgba(22,163,74,0.14)",
      button: "#16a34a",
    };
  }

  if (tone === "warning") {
    return {
      title: "#92400e",
      text: "#92400e",
      background: "rgba(255,251,235,0.88)",
      border: "1px solid rgba(217,119,6,0.18)",
      button: "#b45309",
    };
  }

  return {
    title: "#1d4ed8",
    text: "#1e3a8a",
    background: "rgba(239,246,255,0.86)",
    border: "1px solid rgba(29,78,216,0.14)",
    button: "#1d4ed8",
  };
}
