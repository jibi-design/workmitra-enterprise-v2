// src/features/employer/hrManagement/components/StaffAvailabilityCreateModal.tsx
//
// Create Staff Availability Request modal (Root Map Section 7.4.13).
// Mode toggle: Simple (Quick Request) / Batch (Priority Batches).
// Form: title, description, date, time, location, required count, employee selection.

import { useState, useMemo, useCallback } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import { hrManagementStorage } from "../storage/hrManagement.storage";
import { staffAvailabilityStorage } from "../storage/staffAvailability.storage";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import type {
  AvailabilityMode,
  AvailabilityFormEmployee,
  AvailabilityFormBatch,
  StaffAvailabilityFormData,
} from "../types/staffAvailability.types";
import {
  MODE_CONFIG,
  MIN_REQUIRED_COUNT,
  MAX_REQUIRED_COUNT,
} from "../helpers/staffAvailabilityConstants";
import { StaffAvailabilityEmployeePicker } from "./StaffAvailabilityEmployeePicker";

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 13,
  border: "1px solid var(--wm-er-border, #e5e7eb)",
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  color: "var(--wm-er-text)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function StaffAvailabilityCreateModal({ open, onClose, onSuccess }: Props) {
  // Form state
  const [mode, setMode] = useState<AvailabilityMode>("simple");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateNeeded, setDateNeeded] = useState("");
  const [timeNeeded, setTimeNeeded] = useState("");
  const [location, setLocation] = useState("");
  const [requiredCount, setRequiredCount] = useState(1);

  // Employee selection
  const employees = useMemo<HRCandidateRecord[]>(
    () => (open ? hrManagementStorage.getAll().filter((r) => r.status === "active") : []),
    [open],
  );
  const [selectedEmployees, setSelectedEmployees] = useState<AvailabilityFormEmployee[]>([]);
  const [batches, setBatches] = useState<AvailabilityFormBatch[]>([]);

  // Reset form
  const resetForm = useCallback(() => {
    setMode("simple");
    setTitle("");
    setDescription("");
    setDateNeeded("");
    setTimeNeeded("");
    setLocation("");
    setRequiredCount(1);
    setSelectedEmployees([]);
    setBatches([]);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Clear selections when mode changes
  const handleModeChange = (newMode: AvailabilityMode) => {
    setMode(newMode);
    setSelectedEmployees([]);
    setBatches([]);
  };

  // Validation
  const totalSelected =
    mode === "simple"
      ? selectedEmployees.length
      : batches.reduce((sum, b) => sum + b.employees.length, 0);

  const canSubmit =
    title.trim().length > 0 &&
    dateNeeded.length > 0 &&
    timeNeeded.trim().length > 0 &&
    totalSelected > 0 &&
    requiredCount >= MIN_REQUIRED_COUNT &&
    requiredCount <= MAX_REQUIRED_COUNT &&
    totalSelected >= requiredCount;

  // Submit
  const handleSubmit = () => {
    if (!canSubmit) return;

    const form: StaffAvailabilityFormData = {
      title,
      description,
      dateNeeded,
      timeNeeded,
      location,
      mode,
      requiredCount,
      selectedEmployees: mode === "simple" ? selectedEmployees : [],
      batches: mode === "batch" ? batches : [],
    };

    staffAvailabilityStorage.createRequest(form);
    onSuccess();
    handleClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={handleClose} ariaLabel="Create Availability Request" maxWidth={520}>
      <div style={{ padding: 20, maxHeight: "85vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>
          Request Staff Availability
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2, marginBottom: 16 }}>
          Ask specific employees if they are available for a shift or task.
        </div>

        {/* Mode Toggle */}
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Request Type</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {(Object.keys(MODE_CONFIG) as AvailabilityMode[]).map((key) => {
              const cfg = MODE_CONFIG[key];
              const isActive = mode === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleModeChange(key)}
                  style={{
                    padding: "10px 12px",
                    textAlign: "left",
                    border: isActive
                      ? "2px solid var(--wm-er-accent-console, #0369a1)"
                      : "1px solid var(--wm-er-border, #e5e7eb)",
                    borderRadius: 10,
                    background: isActive ? "rgba(3, 105, 161, 0.04)" : "#fff",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{cfg.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: "var(--wm-er-text)" }}>
                    {cfg.label}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--wm-er-muted)", marginTop: 2, lineHeight: 1.4 }}>
                    {cfg.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Saturday Extra Shift, Emergency Cover"
            style={inputStyle}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details about the work, expectations, etc..."
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* Date + Time + Location */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Date Needed *</label>
            <input
              type="date"
              value={dateNeeded}
              onChange={(e) => setDateNeeded(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Time *</label>
            <input
              type="text"
              value={timeNeeded}
              onChange={(e) => setTimeNeeded(e.target.value)}
              placeholder="e.g. 9:00 AM - 5:00 PM"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Location / Site</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Site B, Main Office"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>People Needed *</label>
            <input
              type="number"
              value={requiredCount}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= MIN_REQUIRED_COUNT && val <= MAX_REQUIRED_COUNT) {
                  setRequiredCount(val);
                }
              }}
              min={MIN_REQUIRED_COUNT}
              max={MAX_REQUIRED_COUNT}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Employee Picker */}
        <div style={{
          padding: "14px 12px",
          borderRadius: 10,
          border: "1px solid var(--wm-er-border, #e5e7eb)",
          background: "#fafafa",
          marginBottom: 16,
        }}>
          <StaffAvailabilityEmployeePicker
            employees={employees}
            mode={mode}
            selectedEmployees={selectedEmployees}
            onSelectedChange={setSelectedEmployees}
            batches={batches}
            onBatchesChange={setBatches}
          />
        </div>

        {/* Validation Hint */}
        {totalSelected > 0 && totalSelected < requiredCount && (
          <div style={{
            marginBottom: 12,
            padding: "8px 12px",
            borderRadius: 8,
            background: "#fffbeb",
            border: "1px solid #fde68a",
            fontSize: 12,
            fontWeight: 700,
            color: "#d97706",
          }}>
            You need at least {requiredCount} employee{requiredCount > 1 ? "s" : ""} selected,
            but only {totalSelected} selected. Add more employees.
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="wm-primarybtn"
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{ opacity: canSubmit ? 1 : 0.5 }}
          >
            Send Request
          </button>
        </div>
      </div>
    </CenterModal>
  );
}
