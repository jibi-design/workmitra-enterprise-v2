// App: Job Mitra / WorkMitra_Enterprise_v2
// File: LocationDepartmentSection.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\company\components\LocationDepartmentSection.tsx

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { IconLocation } from "../helpers/settingsIcons";
import { companyConfigStorage } from "../storage/companyConfig.storage";
import { hrManagementStorage } from "../../hrManagement/storage/hrManagement.storage";
import { EditableLocationList } from "./locationDepartment/EditableLocationList";

const BORDER_COLOR = "#d1d5db";

export function LocationDepartmentSection() {
  const [autoDetectMsg, setAutoDetectMsg] = useState("");

  const subscribe = useCallback(
    (callback: () => void) => companyConfigStorage.subscribe(callback),
    [],
  );

  const getSnapshot = useCallback(
    () => JSON.stringify({ l: companyConfigStorage.getLocations() }),
    [],
  );

  const raw = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const { l: locations } = useMemo(() => {
    try {
      const parsed = JSON.parse(raw) as { l?: string[] };
      return { l: Array.isArray(parsed.l) ? parsed.l : [] };
    } catch {
      return { l: [] };
    }
  }, [raw]);

  function handleAutoDetect() {
    const records = hrManagementStorage.getAll();
    const result = companyConfigStorage.autoDetectFromHR(records);

    if (result.locationsAdded === 0) {
      setAutoDetectMsg("No new locations found in employee records.");
    } else {
      setAutoDetectMsg(
        `Added ${result.locationsAdded} location${result.locationsAdded > 1 ? "s" : ""} from employee records!`,
      );
    }

    setTimeout(() => setAutoDetectMsg(""), 3000);
  }

  return (
    <div
      style={{
        padding: 16,
        background: "var(--wm-er-card, #fff)",
        borderRadius: "var(--wm-radius-chip)",
        border: `1px solid ${BORDER_COLOR}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--wm-radius-10)",
              background: "rgba(3, 105, 161, 0.08)",
              border: "1px solid rgba(3, 105, 161, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0369a1",
              flexShrink: 0,
            }}
          >
            <IconLocation />
          </div>

          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
              Work Locations
            </div>

            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 1 }}>
              Manage your work sites and locations
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAutoDetect}
          style={{
            padding: "7px 12px",
            fontSize: 11,
            fontWeight: 700,
            color: "#0369a1",
            background: "rgba(3, 105, 161, 0.06)",
            border: "1px solid rgba(3, 105, 161, 0.15)",
            borderRadius: "var(--wm-radius-8)",
            cursor: "pointer",
          }}
        >
          Auto-Detect
        </button>
      </div>

      {autoDetectMsg && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: "var(--wm-radius-8)",
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            fontSize: 12,
            fontWeight: 700,
            color: "#15803d",
          }}
        >
          {autoDetectMsg}
        </div>
      )}

      <EditableLocationList
        title="Locations"
        subtitle="Work sites where your employees are assigned"
        items={locations}
        onAdd={(name) => companyConfigStorage.addLocation(name)}
        onRemove={(name) => companyConfigStorage.removeLocation(name)}
        onRename={(oldName, newName) => companyConfigStorage.renameLocation(oldName, newName)}
        placeholder="Enter location name"
      />
    </div>
  );
}
