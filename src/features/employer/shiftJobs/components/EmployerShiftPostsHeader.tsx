// App name: Job Mitra
// File name: EmployerShiftPostsHeader.tsx
// My Posts hero — DomainHero aligned with Employer Shift Home (Step 2)

import { DomainHero } from "../../../../shared/components/layout/DomainHero";
import { IconPlus, IconPost } from "./ShiftHomeIcons";

type EmployerShiftPostsHeaderProps = {
  readonly draftCount?: number;
  readonly onTemplates: () => void;
  readonly onCreate: () => void;
};

export function EmployerShiftPostsHeader({
  draftCount = 0,
  onTemplates,
  onCreate,
}: EmployerShiftPostsHeaderProps) {
  const subtitle =
    draftCount > 0
      ? `All your shift posts · ${draftCount} local draft${draftCount > 1 ? "s" : ""} saved`
      : "All your shift posts";

  return (
    <DomainHero
      variant="shift"
      audience="employer"
      icon={<IconPost />}
      title="My Posts"
      subtitle={subtitle}
      description="Review open and active shift posts, templates, and vacancy status from one list."
      trailing={
        <div className="wm-shiftPostsHeaderActions">
          {draftCount > 0 ? (
            <span className="wm-shiftPostsDraftBadge">
              {draftCount} Draft{draftCount > 1 ? "s" : ""}
            </span>
          ) : null}

          <button
            className="wm-outlineBtn wm-shiftPostsTemplatesBtn wm-shift-pressable"
            type="button"
            onClick={onTemplates}
          >
            Templates
          </button>

          <button className="wm-primarybtn wm-shiftPostsCreateBtn" type="button" onClick={onCreate}>
            <IconPlus /> New Shift
          </button>
        </div>
      }
    />
  );
}
