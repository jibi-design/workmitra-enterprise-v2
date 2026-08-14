/** Job Mitra | compactPendingBannerLine.ts | Full next-action copy, wrap on small screens */

export function compactPendingBannerLine(title: string, detail?: string): string {
  if (!detail?.trim()) return title;
  return `${title} · ${detail.trim()}`;
}
