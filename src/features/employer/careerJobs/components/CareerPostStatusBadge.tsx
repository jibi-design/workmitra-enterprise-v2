// App name: Job Mitra
// File name: CareerPostStatusBadge.tsx
// Ultra-Enterprise U1 — StatusBadge adapter

import { StatusBadge, careerPostStatusToBadge } from "../../../../shared/components/enterprise";

type CareerPostStatusBadgeProps = {
  status: string;
};

export function CareerPostStatusBadge({ status }: CareerPostStatusBadgeProps) {
  const mapped = careerPostStatusToBadge(status);
  return <StatusBadge label={mapped.label} tone={mapped.tone} accent="career" />;
}
