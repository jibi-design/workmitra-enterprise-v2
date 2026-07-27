// App: Job Mitra / WorkMitra_Enterprise_v2
// File: WorkforceAddStaffLookupSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\workforceOps\components\WorkforceAddStaffLookupSection.tsx

import { IconSearch } from "../../../../shared/domains/workforce/ui/workforceIcons";
import { AMBER } from "../../../../shared/domains/workforce/ui/workforceStyles";

export type WorkforceLookupResult = {
  found: boolean;
  fullName: string;
  city: string;
  skills: string[];
};

type Props = {
  uniqueId: string;
  looked: boolean;
  lookupResult: WorkforceLookupResult | null;
  onUniqueIdChange: (value: string) => void;
  onLookup: () => void;
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "var(--wm-er-text)",
  marginBottom: 4,
};

const hintStyle: React.CSSProperties = {
  fontSize: 11,
  color: "var(--wm-er-muted)",
  marginTop: 2,
};

const lookupCardStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: "var(--wm-radius-10)",
  background: "rgba(22, 163, 74, 0.06)",
  border: "1px solid rgba(22, 163, 74, 0.2)",
};

const notFoundCardStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: "var(--wm-radius-10)",
  background: "rgba(220, 38, 38, 0.04)",
  border: "1px solid rgba(220, 38, 38, 0.15)",
};

export function WorkforceAddStaffLookupSection({
  uniqueId,
  looked,
  lookupResult,
  onUniqueIdChange,
  onLookup,
}: Props) {
  return (
    <>
      <div>
        <div style={labelStyle}>Employee Unique ID</div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            className="wm-input"
            placeholder="Enter employee's unique ID"
            value={uniqueId}
            onChange={(event) => onUniqueIdChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onLookup();
            }}
            style={{ flex: 1, fontSize: 13 }}
            autoFocus
          />

          <button
            className="wm-primarybtn"
            type="button"
            onClick={onLookup}
            disabled={!uniqueId.trim()}
            style={{
              background: AMBER,
              fontSize: 12,
              padding: "6px 12px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <IconSearch /> Verify
          </button>
        </div>

        <div style={hintStyle}>
          The employee can find their unique ID in their profile settings.
        </div>
      </div>

      {looked &&
        lookupResult &&
        (lookupResult.found ? (
          <div style={lookupCardStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-success)" }}>
              Employee found
            </div>

            <div
              style={{ fontSize: 14, fontWeight: 800, color: "var(--wm-er-text)", marginTop: 4 }}
            >
              {lookupResult.fullName}
            </div>

            {lookupResult.city && (
              <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
                {lookupResult.city}
              </div>
            )}

            {lookupResult.skills.length > 0 && (
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {lookupResult.skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    style={{
                      padding: "2px 8px",
                      borderRadius: "var(--wm-radius-pill)",
                      background: "rgba(22,163,74,0.1)",
                      color: "var(--wm-success)",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={notFoundCardStyle}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-error)" }}>
              Employee not found
            </div>

            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4 }}>
              No profile found for this ID. You can still add them — their details will update when
              they register.
            </div>
          </div>
        ))}
    </>
  );
}
