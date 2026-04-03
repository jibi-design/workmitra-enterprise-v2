// src/features/employer/company/components/CompanyConfigSection.tsx
// Company Settings / Customization UI.
// Working days, holidays, shift timings, weekends, leave year.
// Session 7: purple buttons, universal placeholders, 1.5px borders.

import { useState, useEffect } from "react";
import {
  companyConfigStorage,
  DAY_LABELS,
  MONTH_OPTIONS,
  type CompanyConfig,
  type WorkingDaysPreset,
  type WeekDay,
} from "../storage/companyConfig.storage";
import { ConfirmModal } from "../../../../shared/components/ConfirmModal";
import type { ConfirmData } from "../../../../shared/components/ConfirmModal";

/* ------------------------------------------------ */
/* Constants                                        */
/* ------------------------------------------------ */
const PURPLE = "#7c3aed";
const FOCUS_COLOR = "var(--wm-er-accent-hr)";
const BORDER_COLOR = "#d1d5db";

/* ------------------------------------------------ */
/* Styles                                           */
/* ------------------------------------------------ */
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  fontWeight: 600,
  color: "#1e293b",
  border: `1.5px solid ${BORDER_COLOR}`,
  borderRadius: 8,
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  transition: "border-color 0.15s ease",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 800,
  color: "var(--wm-er-text)",
  display: "block",
  marginBottom: 4,
};

const sectionTitle: React.CSSProperties = {
  fontWeight: 900,
  fontSize: 13,
  color: "var(--wm-er-text)",
  marginBottom: 4,
};

const sectionHint: React.CSSProperties = {
  fontSize: 12,
  color: "var(--wm-er-muted)",
  lineHeight: 1.5,
  marginBottom: 12,
  paddingBottom: 10,
  borderBottom: `1px solid ${BORDER_COLOR}`,
};

const purpleBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 700,
  border: "none",
  background: PURPLE,
  color: "#fff",
  cursor: "pointer",
};

const purpleBtnDisabledStyle: React.CSSProperties = {
  ...purpleBtnStyle,
  opacity: 0.5,
  cursor: "default",
};

/* ------------------------------------------------ */
/* Focus helpers                                    */
/* ------------------------------------------------ */
function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = FOCUS_COLOR;
}

function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = BORDER_COLOR;
}

/* ------------------------------------------------ */
/* Hook                                             */
/* ------------------------------------------------ */
function useCompanyConfig(): CompanyConfig {
  const [config, setConfig] = useState<CompanyConfig>(() => companyConfigStorage.get());

  useEffect(() => {
    const refresh = () => setConfig(companyConfigStorage.get());
    refresh();
    return companyConfigStorage.subscribe(refresh);
  }, []);

  return config;
}

/* ------------------------------------------------ */
/* Sub-Components                                   */
/* ------------------------------------------------ */
const ALL_DAYS: WeekDay[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function WorkingDaysCard({ config }: { config: CompanyConfig }) {
  const handlePresetChange = (preset: WorkingDaysPreset) => {
    companyConfigStorage.setWorkingDays(preset);
  };

  const handleCustomToggle = (day: WeekDay) => {
    const current = config.customWorkingDays;
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    companyConfigStorage.setWorkingDays("custom", updated);
  };

  const presets: { value: WorkingDaysPreset; label: string }[] = [
    { value: "mon_fri", label: "Monday to Friday" },
    { value: "mon_sat", label: "Monday to Saturday" },
    { value: "custom", label: "Custom" },
  ];

  return (
    <div>
      <div style={sectionTitle}>Working Days</div>
      <div style={sectionHint}>
        Select which days your company operates. Days not selected will be automatically
        marked as &ldquo;Off&rdquo; in attendance for all employees. You won&rsquo;t need
        to mark weekends manually anymore.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {presets.map((p) => {
          const isSelected = config.workingDaysPreset === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => handlePresetChange(p.value)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                border: isSelected
                  ? `2px solid ${PURPLE}`
                  : `1.5px solid ${BORDER_COLOR}`,
                borderRadius: 8,
                background: isSelected ? "var(--wm-er-accent-hr-light)" : "#fff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: isSelected ? 800 : 600,
                color: "var(--wm-er-text)",
                textAlign: "left",
                width: "100%",
              }}
            >
              <span style={{
                width: 18, height: 18, borderRadius: "50%",
                border: `2px solid ${isSelected ? PURPLE : BORDER_COLOR}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {isSelected && (
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: PURPLE }} />
                )}
              </span>
              {p.label}
            </button>
          );
        })}
      </div>

      {config.workingDaysPreset === "custom" && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginBottom: 6 }}>
            Tap to select your working days:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ALL_DAYS.map((day) => {
              const isActive = config.customWorkingDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleCustomToggle(day)}
                  style={{
                    padding: "7px 14px",
                    border: isActive ? "2px solid #15803d" : `1.5px solid ${BORDER_COLOR}`,
                    borderRadius: 8,
                    background: isActive ? "#dcfce7" : "#fff",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? "#15803d" : "var(--wm-er-muted)",
                  }}
                >
                  {DAY_LABELS[day]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {config.weekendDays.length > 0 && (
        <div style={{
          marginTop: 10,
          padding: "8px 12px",
          borderRadius: 6,
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          fontSize: 12,
          color: "#0369a1",
        }}>
          Weekends (auto Off): {config.weekendDays.map((d) => DAY_LABELS[d]).join(", ")}
        </div>
      )}
    </div>
  );
}

function ShiftTimingsCard({ config }: { config: CompanyConfig }) {
  const [start, setStart] = useState(config.shiftStartTime);
  const [end, setEnd] = useState(config.shiftEndTime);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    companyConfigStorage.setShiftTimings(start, end);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasChanges = start !== config.shiftStartTime || end !== config.shiftEndTime;

  return (
    <div>
      <div style={sectionTitle}>Default Shift Timings</div>
      <div style={sectionHint}>
        Set your company&rsquo;s standard work hours. When you mark attendance, the sign in
        and sign out times will be pre-filled with these values. You can always change the
        time for individual employees if needed.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Start Time</label>
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <label style={labelStyle}>End Time</label>
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>
      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges}
          style={hasChanges ? purpleBtnStyle : purpleBtnDisabledStyle}
        >
          Save Timings
        </button>
        {saved && (
          <span style={{ fontSize: 12, color: "#15803d", fontWeight: 700 }}>Saved!</span>
        )}
      </div>
    </div>
  );
}

function HolidaysCard({ config }: { config: CompanyConfig }) {
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<ConfirmData | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newDate || !newName.trim()) return;
    const added = companyConfigStorage.addHoliday(newDate, newName);
    if (added) {
      setNewDate("");
      setNewName("");
    }
  };

  const handleDeleteRequest = (id: string, name: string) => {
    setPendingDeleteId(id);
    setDeleteConfirm({
      title: "Remove Holiday",
      message: `Remove "${name}" from company holidays?`,
      tone: "warn",
      confirmLabel: "Remove",
      cancelLabel: "Keep",
    });
  };

  const handleDeleteConfirm = () => {
    if (pendingDeleteId) companyConfigStorage.removeHoliday(pendingDeleteId);
    setPendingDeleteId(null);
    setDeleteConfirm(null);
  };

  const formatDate = (dateKey: string) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const canAdd = Boolean(newDate && newName.trim());

  return (
    <div>
      <div style={sectionTitle}>Company Holidays</div>
      <div style={sectionHint}>
        Add your company&rsquo;s public holidays and special off days here. These dates
        will be automatically marked as &ldquo;Off&rdquo; in attendance for all employees.
        No need to mark each employee separately.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
        <div>
          <label style={labelStyle}>Holiday Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter holiday name"
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(); } }}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        disabled={!canAdd}
        style={{ marginTop: 8, ...(canAdd ? purpleBtnStyle : purpleBtnDisabledStyle) }}
      >
        + Add Holiday
      </button>

      {config.holidays.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {config.holidays.map((h) => (
            <div
              key={h.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                background: "#f9fafb",
                borderRadius: 6,
                border: `1px solid ${BORDER_COLOR}`,
              }}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--wm-er-text)" }}>{h.name}</span>
                <span style={{ fontSize: 12, color: "var(--wm-er-muted)", marginLeft: 8 }}>{formatDate(h.date)}</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteRequest(h.id, h.name)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 14, color: "#dc2626", padding: "0 4px",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {config.holidays.length === 0 && (
        <div style={{ marginTop: 10, fontSize: 12, color: "var(--wm-er-muted)" }}>
          No holidays added yet. Add your company holidays so they appear automatically in attendance.
        </div>
      )}

      <ConfirmModal
        confirm={deleteConfirm}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setPendingDeleteId(null); setDeleteConfirm(null); }}
      />
    </div>
  );
}

function LeaveYearCard({ config }: { config: CompanyConfig }) {
  const handleChange = (month: number) => {
    companyConfigStorage.setLeaveYearStart(month);
  };

  return (
    <div>
      <div style={sectionTitle}>Leave Year Start</div>
      <div style={sectionHint}>
        When does your company&rsquo;s leave year begin? Most companies start in January,
        but some use April or other months. This helps calculate leave balances correctly
        for your employees.
      </div>
      <select
        value={config.leaveYearStartMonth}
        onChange={(e) => handleChange(Number(e.target.value))}
        style={{ ...inputStyle, cursor: "pointer" }}
        onFocus={handleFocus as unknown as React.FocusEventHandler<HTMLSelectElement>}
        onBlur={handleBlur as unknown as React.FocusEventHandler<HTMLSelectElement>}
      >
        {MONTH_OPTIONS.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------ */
/* Main Component                                   */
/* ------------------------------------------------ */
export function CompanyConfigSection() {
  const config = useCompanyConfig();

  return (
    <div style={{
      padding: 16,
      background: "#fff",
      borderRadius: 12,
      border: `1px solid ${BORDER_COLOR}`,
      display: "flex",
      flexDirection: "column",
      gap: 24,
    }}>
      {/* Header */}
      <div>
        <div style={{ fontWeight: 900, fontSize: 15, color: "var(--wm-er-text)" }}>
          Company Settings
        </div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, lineHeight: 1.5 }}>
          Set up your company&rsquo;s work schedule once. WorkMitra will use these settings
          to automatically mark weekends and holidays as &ldquo;Off&rdquo; in attendance,
          pre-fill shift timings, and calculate leave correctly for all your employees.
        </div>
      </div>

      <WorkingDaysCard config={config} />
      <ShiftTimingsCard config={config} />
      <HolidaysCard config={config} />
      <LeaveYearCard config={config} />
    </div>
  );
}