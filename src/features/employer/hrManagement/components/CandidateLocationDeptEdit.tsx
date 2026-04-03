// src/features/employer/hrManagement/components/CandidateLocationDeptEdit.tsx
//
// Inline-editable department + location fields for HR Candidate Detail (Root Map 7.4.16).
// Dropdown populated from Company Settings managed lists.
// Employee can have: single department, multiple locations.

import { useState, useMemo } from "react";
import { companyConfigStorage } from "../../company/storage/companyConfig.storage";
import { myStaffStorage } from "../../myStaff/storage/myStaff.storage";
import { hrManagementStorage } from "../storage/hrManagement.storage";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  hrCandidateId: string;
  currentDepartment: string;
  currentLocation: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function CandidateLocationDeptEdit({ hrCandidateId, currentDepartment, currentLocation }: Props) {
  const [editing, setEditing] = useState(false);
  const [department, setDepartment] = useState(currentDepartment);
  const [location, setLocation] = useState(currentLocation);
  const [successMsg, setSuccessMsg] = useState("");

   const managedDepartments = useMemo(() => myStaffStorage.getCategories().map((c) => c.name), []);
  const managedLocations = useMemo(() => companyConfigStorage.getLocations(), []);

  // Parse current locations (comma-separated for multi-location)
  const currentLocations = useMemo(
    () => currentLocation.split(",").map((l) => l.trim()).filter(Boolean),
    [currentLocation],
  );

  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    () => new Set(currentLocations),
  );

  const handleStartEdit = () => {
    setDepartment(currentDepartment);
    setSelectedLocations(new Set(currentLocations));
    setEditing(true);
  };

  const toggleLocation = (loc: string) => {
    setSelectedLocations((prev) => {
      const next = new Set(prev);
      if (next.has(loc)) next.delete(loc);
      else next.add(loc);
      return next;
    });
  };

  const handleSave = () => {
    const newLocation = Array.from(selectedLocations).sort().join(", ");
    hrManagementStorage.update(hrCandidateId, {
      department: department.trim(),
      location: newLocation,
    });
    setEditing(false);
    setSuccessMsg("Updated successfully!");
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const handleCancel = () => {
    setDepartment(currentDepartment);
    setSelectedLocations(new Set(currentLocations));
    setEditing(false);
  };

  // No managed lists yet — show hint
  const noLists = managedDepartments.length === 0 && managedLocations.length === 0;

  if (!editing) {
    return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {/* Department Display */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)", marginBottom: 3 }}>Department</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)" }}>
              {currentDepartment || "—"}
            </div>
          </div>
          {/* Location Display */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--wm-er-muted)", marginBottom: 3 }}>Location</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--wm-er-text)" }}>
              {currentLocation || "—"}
            </div>
          </div>
        </div>

        {/* Edit Button */}
        <button
          type="button"
          onClick={handleStartEdit}
          style={{
            marginTop: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            color: "#0369a1",
            padding: 0,
          }}
        >
          Edit Department / Location
        </button>

        {successMsg && (
          <div style={{
            marginTop: 6, fontSize: 11, fontWeight: 700, color: "#15803d",
          }}>
            {successMsg}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: "12px 14px",
      borderRadius: 10,
      border: "1px solid #bfdbfe",
      background: "#f0f9ff",
    }}>
      {/* Department Dropdown */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 4 }}>
          Department
        </div>
        {managedDepartments.length > 0 ? (
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{
              width: "100%", padding: "8px 10px", fontSize: 13,
              border: "1px solid var(--wm-er-border, #e5e7eb)",
              borderRadius: 8, background: "#fff", color: "var(--wm-er-text)",
              boxSizing: "border-box",
            }}
          >
            <option value="">— Select Department —</option>
            {managedDepartments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Technical, Helper"
            style={{
              width: "100%", padding: "8px 10px", fontSize: 13,
              border: "1px solid var(--wm-er-border, #e5e7eb)",
              borderRadius: 8, background: "#fff", color: "var(--wm-er-text)",
              boxSizing: "border-box",
            }}
          />
        )}
      </div>

      {/* Location Multi-select */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: "var(--wm-er-text)", marginBottom: 4 }}>
          Locations {selectedLocations.size > 0 && `(${selectedLocations.size} selected)`}
        </div>
        {managedLocations.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {managedLocations.map((loc) => {
              const isSelected = selectedLocations.has(loc);
              return (
                <button
                  key={loc}
                  type="button"
                  onClick={() => toggleLocation(loc)}
                  style={{
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: isSelected ? 800 : 600,
                    color: isSelected ? "#fff" : "var(--wm-er-text)",
                    background: isSelected ? "#0369a1" : "#f3f4f6",
                    border: isSelected ? "1px solid #0369a1" : "1px solid var(--wm-er-border, #e5e7eb)",
                    borderRadius: 6,
                    cursor: "pointer",
                  }}
                >
                  {loc}
                </button>
              );
            })}
          </div>
        ) : (
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Main Office, Site A"
            style={{
              width: "100%", padding: "8px 10px", fontSize: 13,
              border: "1px solid var(--wm-er-border, #e5e7eb)",
              borderRadius: 8, background: "#fff", color: "var(--wm-er-text)",
              boxSizing: "border-box",
            }}
          />
        )}
      </div>

      {/* Hint if no managed lists */}
      {noLists && (
        <div style={{
          marginBottom: 10, fontSize: 11, color: "#d97706", fontWeight: 600, lineHeight: 1.4,
        }}>
          Tip: Add locations and departments in Company Settings for dropdown selection.
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: "7px 14px", fontSize: 12, fontWeight: 700,
            color: "#fff", background: "#0369a1",
            border: "none", borderRadius: 8, cursor: "pointer",
          }}
        >
          Save
        </button>
        <button className="wm-outlineBtn" type="button" onClick={handleCancel} style={{ fontSize: 12 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
