// App: Job Mitra / WorkMitra_Enterprise_v2
// File: PlannerGrowthSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workVault\components\profileSections\PlannerGrowthSection.tsx

import { StatusBadge } from "../../../../../shared/components/enterprise/StatusBadge";
import { formatDate } from "../../helpers/vaultHomeHelpers";
import type { VaultPlannerGrowthData } from "../../types/vaultProfileTypes";
import { SectionCard } from "./VaultProfileSharedUi";

function scoreLabel(value: number | null): string {
  if (value === null) return "Not enough data";
  return `${value}%`;
}

function MetricTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "planner" | "shift" | "career";
}) {
  return (
    <div className="wm-vault-metric-tile">
      <StatusBadge label={label} tone="neutral" accent={accent} />
      <div className="wm-vault-metric-tile__value">{value}</div>
    </div>
  );
}

export function PlannerGrowthSection({ data }: { data: VaultPlannerGrowthData }) {
  const ratingLabel =
    data.plannerRatingAverage === null
      ? "No Gig Project ratings yet"
      : `${data.plannerRatingAverage.toFixed(1)} / 5 · ${data.plannerRatingCount} rating${
          data.plannerRatingCount === 1 ? "" : "s"
        }`;

  return (
    <div className="wm-vault-planner-growth" data-testid="vault-planner-growth">
      <div className="wm-vault-planner-growth__metrics">
        <MetricTile
          label="Schedule availability"
          value={scoreLabel(data.availabilityScore)}
          accent="planner"
        />
        <MetricTile
          label="Reliability"
          value={scoreLabel(data.reliabilityScore)}
          accent="planner"
        />
        <MetricTile label="Gig Project rating" value={ratingLabel} accent="planner" />
      </div>

      <SectionCard>
        <div className="wm-vault-planner-growth__summary">
          <StatusBadge
            label={`${data.totalEpochs} epoch${data.totalEpochs === 1 ? "" : "s"}`}
            tone="active"
            accent="planner"
          />
          <StatusBadge
            label={`${data.finalizedEpochs} finalized`}
            tone="neutral"
            accent="planner"
          />
          <StatusBadge
            label={`${data.totalPlans} plan${data.totalPlans === 1 ? "" : "s"}`}
            tone="pending"
            accent="planner"
          />
        </div>

        {data.epochs.length === 0 ? (
          <div className="wm-vault-empty-inline">
            No Gig Project epochs yet. Completing Planner assignments builds this timeline.
          </div>
        ) : (
          <div className="wm-vault-planner-growth__timeline">
            {data.epochs.map((epoch) => (
              <div
                key={epoch.id}
                className="wm-vault-planner-epoch"
                data-testid="vault-planner-epoch"
              >
                <div className="wm-vault-planner-epoch__top">
                  <div style={{ minWidth: 0 }}>
                    <div className="wm-vault-planner-epoch__title">{epoch.planName}</div>
                    <div className="wm-vault-planner-epoch__meta">
                      {epoch.companyName} · Epoch {epoch.epochIndex + 1}
                    </div>
                    <div className="wm-vault-planner-epoch__dates">
                      {formatDate(epoch.epochStart)} – {formatDate(epoch.epochEnd)}
                    </div>
                  </div>
                  <StatusBadge
                    label={epoch.vaultFinalized ? "Finalized" : "Active"}
                    tone={epoch.vaultFinalized ? "neutral" : "active"}
                    accent="planner"
                  />
                </div>

                <div className="wm-vault-planner-epoch__stats">
                  <span>
                    {epoch.daysCompleted}/{epoch.daysScheduled} days
                  </span>
                  <span>Avail {epoch.attendanceRate}%</span>
                  <span>Rel {epoch.reliabilityScore}%</span>
                  {epoch.rating !== null ? <span>{epoch.rating}/5</span> : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
