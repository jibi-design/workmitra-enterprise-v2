// App: Job Mitra / WorkMitra_Enterprise_v2
// File: EmployeeWorkforceAnnounceDetailContent.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\workforceOps\components\EmployeeWorkforceAnnounceDetailContent.tsx

import type { WorkforceAnnouncement } from "../../../../shared/domains/workforce/types/workforceTypes";
import { IconBack } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER, AMBER_BG } from "../../../../shared/domains/workforce/ui/workforceStyles";

type Props = {
  announcement: WorkforceAnnouncement;
  categoryMap: Map<string, string>;
  totalVacancy: number;
  hasConflict: boolean;
  applied: boolean;
  selectedShifts: string[];
  errors: string[];
  onBack: () => void;
  onToggleShift: (shiftId: string) => void;
  onApply: () => void;
};

export function EmployeeWorkforceAnnounceDetailContent({
  announcement,
  categoryMap,
  totalVacancy,
  hasConflict,
  applied,
  selectedShifts,
  errors,
  onBack,
  onToggleShift,
  onApply,
}: Props) {
  return (
    <div style={{ padding: "0 16px" }}>
      <div className="wm-pageHead" style={{ gap: 12 }}>
        <button
          type="button"
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: AMBER,
            padding: 4,
            borderRadius: 6,
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <IconBack />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="wm-pageTitle"
            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {announcement.title}
          </div>
          <div className="wm-pageSub">Announcement Details</div>
        </div>
      </div>

      <div className="wm-er-card" style={{ marginTop: 14 }}>
        <div style={{ display: "grid", gap: 6 }}>
          <div style={{ fontSize: 13 }}>
            <strong>Work Date:</strong>{" "}
            {new Date(announcement.date + "T00:00:00").toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>

          {announcement.time && (
            <div style={{ fontSize: 13 }}>
              <strong>Reporting Time:</strong> {announcement.time}
            </div>
          )}

          {announcement.location && (
            <div style={{ fontSize: 13 }}>
              <strong>Location:</strong> {announcement.location}
            </div>
          )}

          <div style={{ fontSize: 13 }}>
            <strong>Vacancies:</strong> {totalVacancy}
          </div>

          {announcement.description && (
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
              {announcement.description}
            </div>
          )}
        </div>

        <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
          {announcement.targetCategories.map((catId) => (
            <span
              key={catId}
              style={{
                padding: "2px 8px",
                borderRadius: 999,
                background: AMBER_BG,
                color: AMBER,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {categoryMap.get(catId) ?? catId}
            </span>
          ))}
        </div>
      </div>

      {hasConflict && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            background: "rgba(217,119,6,0.08)",
            border: "1px solid rgba(217,119,6,0.2)",
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: "var(--wm-warning)" }}>
            Date Conflict Warning
          </div>
          <div style={{ fontSize: 11, color: "var(--wm-er-text)", marginTop: 2 }}>
            You already have a confirmed assignment on {announcement.date}. You can still apply, but
            the employer will see the conflict.
          </div>
        </div>
      )}

      {applied ? (
        <div
          className="wm-er-card"
          style={{ marginTop: 14, border: "1px solid var(--wm-success)" }}
        >
          <div style={{ textAlign: "center", padding: 16 }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--wm-success)" }}>
              Applied Successfully
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
              The employer will review your application. You'll be notified of the result.
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="wm-er-card" style={{ marginTop: 14 }}>
            <div
              style={{ fontSize: 14, fontWeight: 900, color: "var(--wm-er-text)", marginBottom: 6 }}
            >
              Select Your Available Shifts
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 10 }}>
              Choose the shifts you can work. You can select multiple.
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {announcement.shifts.map((shift) => {
                const isSelected = selectedShifts.includes(shift.id);

                return (
                  <button
                    key={shift.id}
                    type="button"
                    onClick={() => onToggleShift(shift.id)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: "var(--wm-radius-10)",
                      border: isSelected ? `2px solid ${AMBER}` : "1px solid var(--wm-er-border)",
                      background: isSelected ? AMBER_BG : "var(--wm-er-card)",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>
                        {shift.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--wm-er-muted)" }}>
                        {shift.startTime} — {shift.endTime}
                      </div>
                    </div>

                    <div
                      style={{ fontSize: 18, color: isSelected ? AMBER : "var(--wm-er-border)" }}
                    >
                      {isSelected ? "✓" : "○"}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedShifts.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: AMBER, fontWeight: 700 }}>
                {selectedShifts.length} shift{selectedShifts.length !== 1 ? "s" : ""} selected
              </div>
            )}
          </div>

          {errors.length > 0 && (
            <div
              style={{
                marginTop: 10,
                padding: 10,
                borderRadius: 8,
                background: "rgba(220,38,38,0.06)",
              }}
            >
              {errors.map((error, index) => (
                <div key={index} style={{ fontSize: 12, color: "var(--wm-error)" }}>
                  {error}
                </div>
              ))}
            </div>
          )}

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onApply}
            disabled={selectedShifts.length === 0}
            style={{
              width: "100%",
              marginTop: 14,
              background: selectedShifts.length > 0 ? AMBER : "var(--wm-er-muted)",
              fontSize: 15,
              fontWeight: 900,
              padding: "14px",
            }}
          >
            I'm Available
          </button>
        </>
      )}

      <div style={{ height: 24 }} />
    </div>
  );
}
