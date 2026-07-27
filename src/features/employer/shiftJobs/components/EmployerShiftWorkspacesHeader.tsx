// App name: Job Mitra | EmployerShiftWorkspacesHeader.tsx — DomainHero (Step 3)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { IconGroup } from "./ShiftHomeIcons";
import type { EmployerWorkspaceMode } from "../types/employerShiftWorkspaces.types";

type EmployerShiftWorkspacesHeaderProps = {
  mode: EmployerWorkspaceMode;
  onBack: () => void;
};

export function EmployerShiftWorkspacesHeader({
  mode,
  onBack,
}: EmployerShiftWorkspacesHeaderProps) {
  const isGroups = mode === "groups";

  return (
    <DomainHero
      variant="shift"
      audience="employer"
      icon={<IconGroup />}
      title={isGroups ? "My Work Groups" : "Broadcasts"}
      subtitle={
        isGroups
          ? "Manage confirmed worker groups."
          : "Send group updates to confirmed shift workers."
      }
      description={
        isGroups
          ? "A work group is created after you confirm workers for a shift. Use it to manage updates and worker communication."
          : "Broadcasts are local workspace updates for confirmed workers. Open a group to send a broadcast."
      }
      trailing={
        <button className="wm-outlineBtn wm-shift-pressable" type="button" onClick={onBack}>
          Back
        </button>
      }
    />
  );
}
