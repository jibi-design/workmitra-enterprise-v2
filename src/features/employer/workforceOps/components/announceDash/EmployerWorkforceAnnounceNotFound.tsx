// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployerWorkforceAnnounceNotFound.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\announceDash\EmployerWorkforceAnnounceNotFound.tsx

import { IconBack } from "../../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  onBack: () => void;
};

export function EmployerWorkforceAnnounceNotFound({ onBack }: Props) {
  return (
    <div className="wm-er-vWorkforce">
      <div className="wm-pageHead">
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: AMBER,
            padding: 4,
          }}
        >
          <IconBack />
        </button>

        <div className="wm-pageTitle">Announcement not found</div>
      </div>

      <div className="wm-er-card" style={{ marginTop: 14, padding: 24, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "var(--wm-er-muted)" }}>
          This announcement may have been deleted.
        </div>

        <button
          className="wm-primarybtn"
          type="button"
          onClick={onBack}
          style={{ marginTop: 12, background: AMBER }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
}
