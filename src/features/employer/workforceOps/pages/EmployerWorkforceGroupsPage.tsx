// EmployerWorkforceGroupsPage.tsx — facade

import { useEffect, useMemo, useSyncExternalStore, useState, useCallback } from "react";
import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { workforceService } from "../services/workforceService";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";
import {
  getWorkforceGroupsSnapshot,
  subscribeWorkforceGroups,
} from "./EmployerWorkforceGroupsPage.helpers";
import { WorkforceGroupList, WorkforceGroupsHowItWorks } from "./EmployerWorkforceGroupsPage.parts";

type Props = {
  onBack: () => void;
  onOpenGroup: (groupId: string) => void;
};

export function EmployerWorkforceGroupsPage({ onBack, onOpenGroup }: Props) {
  const data = useSyncExternalStore(
    subscribeWorkforceGroups,
    getWorkforceGroupsSnapshot,
    getWorkforceGroupsSnapshot,
  );
  const [tab, setTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    void workforceService.hydrateGroups();
  }, []);

  const filtered = useMemo(() => data.groups.filter((g) => g.status === tab), [data.groups, tab]);

  const activeCount = useMemo(
    () => data.groups.filter((g) => g.status === "active").length,
    [data.groups],
  );
  const completedCount = useMemo(
    () => data.groups.filter((g) => g.status === "completed").length,
    [data.groups],
  );

  const handleOpen = useCallback(
    (groupId: string) => {
      onOpenGroup(groupId);
    },
    [onOpenGroup],
  );

  return (
    <div className="wm-er-vWorkforce">
      <DomainHero
        variant="workforce"
        audience="employer"
        icon={
          <button type="button" className="wm-domainHeroIconBtn" onClick={onBack} aria-label="Back">
            <IconBack />
          </button>
        }
        title="Work Groups"
        subtitle={`${data.groups.length} group${data.groups.length !== 1 ? "s" : ""}`}
        description="Active and completed workforce groups for your staff."
      />

      <div
        style={{
          marginTop: 14,
          display: "flex",
          gap: 0,
          borderRadius: "var(--wm-radius-10)",
          overflow: "hidden",
          border: "1px solid var(--wm-er-border)",
        }}
      >
        {[
          { key: "active" as const, label: "Active", count: activeCount },
          { key: "completed" as const, label: "Completed", count: completedCount },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              background: tab === t.key ? AMBER : "var(--wm-er-card)",
              color: tab === t.key ? "#fff" : "var(--wm-er-text)",
              fontSize: 13,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      <WorkforceGroupList
        groups={filtered}
        memberCounts={data.memberCounts}
        tab={tab}
        onOpenGroup={handleOpen}
      />

      {data.groups.length === 0 && <WorkforceGroupsHowItWorks />}
    </div>
  );
}
