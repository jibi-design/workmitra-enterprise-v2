/** Job Mitra | EnterpriseSkeleton.tsx | Domain-matched shimmer skeleton */

import type { EnterpriseDomainAccent } from "./enterprise.types";

export type EnterpriseSkeletonProps = {
  count?: number;
  domain?: EnterpriseDomainAccent;
  testId?: string;
};

export function EnterpriseSkeleton({
  count = 3,
  domain = "shift",
  testId,
}: EnterpriseSkeletonProps) {
  const cards = Array.from({ length: Math.max(1, count) }, (_, i) => i);

  return (
    <div
      className="wm-ent-skeleton"
      aria-hidden="true"
      data-testid={testId ?? "wm-ent-skeleton"}
      data-domain={domain}
    >
      {cards.map((i) => (
        <div key={i} className="wm-ent-skeleton__card">
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              className="wm-ent-shimmer"
              style={{ width: 44, height: 44, borderRadius: "50%" }}
            />
            <div style={{ flex: 1, display: "grid", gap: 8 }}>
              <div className="wm-ent-shimmer" style={{ height: 14, width: "72%" }} />
              <div className="wm-ent-shimmer" style={{ height: 11, width: "48%" }} />
            </div>
          </div>
          <div className="wm-ent-shimmer" style={{ height: 11, width: "88%" }} />
          <div className="wm-ent-shimmer" style={{ height: 44, width: "100%", borderRadius: 14 }} />
        </div>
      ))}
    </div>
  );
}
