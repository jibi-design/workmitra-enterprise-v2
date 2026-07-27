export type AnalysisBucketTone = "strong" | "backup" | "neutral";

export function getBucketBackground(tone: AnalysisBucketTone): string {
  if (tone === "strong") return "rgba(239,246,255,0.94)";
  if (tone === "backup") return "rgba(255,251,235,0.92)";
  return "rgba(248,250,252,0.92)";
}

export function getBucketBorder(tone: AnalysisBucketTone): string {
  if (tone === "strong") return "1px solid rgba(29,78,216,0.13)";
  if (tone === "backup") return "1px solid rgba(217,119,6,0.16)";
  return "1px solid rgba(148,163,184,0.14)";
}

export function getCandidateBorder(tone: AnalysisBucketTone, selected: boolean): string {
  if (tone === "backup") return "1px solid rgba(217,119,6,0.20)";
  if (selected) return "1px solid rgba(29,78,216,0.24)";
  return "1px solid rgba(148,163,184,0.12)";
}

export function getCandidateBackground(tone: AnalysisBucketTone, selected: boolean): string {
  if (tone === "backup") return "rgba(255,255,255,0.86)";
  if (selected) return "rgba(29,78,216,0.075)";
  return "rgba(255,255,255,0.84)";
}
