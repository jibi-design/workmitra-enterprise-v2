// src/features/employee/employment/components/WorkDiaryPunchCard.tsx
//
// Personal Punch In / Punch Out card.
// Root Map: "Start Work" / "End Work" buttons.

import { workDiaryStorage } from "../storage/workDiary.storage";
import { useActivePunch } from "../helpers/workDiaryHooks";

type Props = {
  employmentId: string;
};

export function WorkDiaryPunchCard({ employmentId }: Props) {
  const activePunch = useActivePunch(employmentId);

  const handlePunchIn = () => {
    workDiaryStorage.punchIn(employmentId);
  };

  const handlePunchOut = () => {
    workDiaryStorage.punchOut(employmentId);
  };

  return (
    <div
      className="wm-ee-card"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div>
        <div style={{
          fontWeight: 800,
          fontSize: 13,
          color: "var(--wm-emp-text, var(--wm-er-text))",
        }}>
          {activePunch ? "You are working" : "Not punched in"}
        </div>
        {activePunch && activePunch.punchInTime && (
          <div style={{
            fontSize: 12,
            color: "var(--wm-emp-muted, var(--wm-er-muted))",
            marginTop: 2,
          }}>
            Started at {activePunch.punchInTime}
          </div>
        )}
      </div>

      {activePunch ? (
        <button
          className="wm-primarybtn"
          type="button"
          onClick={handlePunchOut}
          style={{
            fontSize: 13,
            padding: "9px 20px",
            background: "#dc2626",
            whiteSpace: "nowrap",
          }}
        >
          End Work
        </button>
      ) : (
        <button
          className="wm-primarybtn"
          type="button"
          onClick={handlePunchIn}
          style={{
            fontSize: 13,
            padding: "9px 20px",
            whiteSpace: "nowrap",
          }}
        >
          Start Work
        </button>
      )}
    </div>
  );
}