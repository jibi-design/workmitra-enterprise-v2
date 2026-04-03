// src/features/employer/hrManagement/components/AppointmentLetterModal.tsx
//
// Employer generates appointment letter for confirmed employee.
// Pre-filled from HR record + offer letter. Employer can edit.

import { useState } from "react";
import { CenterModal } from "../../../../shared/components/CenterModal";
import type { HRCandidateRecord } from "../types/hrManagement.types";
import { letterTemplatesStorage } from "../storage/letterTemplates.storage";
import type { AppointmentLetterData } from "../types/letterTemplates.types";

type Props = {
  open: boolean;
  onClose: () => void;
  record: HRCandidateRecord;
};

function formatDateInput(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

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
  marginBottom: 4,
  display: "block",
};

export function AppointmentLetterModal({ open, onClose, record }: Props) {
  const offer = record.offerLetter;

  const [jobTitle, setJobTitle] = useState(record.jobTitle);
  const [department, setDepartment] = useState(record.department);
  const [location, setLocation] = useState(record.location);
  const [joiningDateStr, setJoiningDateStr] = useState(() =>
    offer?.joiningDate ? formatDateInput(offer.joiningDate) : formatDateInput(Date.now()),
  );
  const [salary, setSalary] = useState(offer?.salaryAmount ?? "");
  const [salaryFrequency, setSalaryFrequency] = useState(offer?.salaryFrequency ?? "monthly");
  const [workSchedule, setWorkSchedule] = useState(offer?.workSchedule ?? "");
  const [reportingTo, setReportingTo] = useState("");
  const [additionalTerms, setAdditionalTerms] = useState(offer?.additionalTerms ?? "");

  const joiningDateTs = new Date(joiningDateStr + "T00:00:00").getTime();
  const isValid = jobTitle.trim().length > 0 && salary.trim().length > 0;

  const handleSend = () => {
    if (!isValid) return;

    const data: AppointmentLetterData = {
      employeeName: record.employeeName,
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      location: location.trim(),
      joiningDate: joiningDateTs,
      salary: salary.trim(),
      salaryFrequency,
      workSchedule: workSchedule.trim(),
      reportingTo: reportingTo.trim(),
      additionalTerms: additionalTerms.trim(),
    };

    letterTemplatesStorage.createLetter({
      hrCandidateId: record.id,
      employeeUniqueId: record.employeeUniqueId,
      employeeName: record.employeeName,
      kind: "appointment",
      letterData: { kind: "appointment", data },
    });

    onClose();
  };

  return (
    <CenterModal open={open} onBackdropClose={onClose} ariaLabel="Generate Appointment Letter" maxWidth={480}>
      <div style={{ padding: 20 }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: "var(--wm-er-text)" }}>Appointment Letter</div>
        <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 4, marginBottom: 14 }}>
          Generate an appointment letter for {record.employeeName}. Fields are pre-filled from the offer letter.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>Job Title *</label>
            <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Department</label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Joining Date</label>
            <input type="date" value={joiningDateStr} onChange={(e) => setJoiningDateStr(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Salary *</label>
              <input type="text" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="e.g. 3500" style={inputStyle} />
            </div>
            <div style={{ flex: "0 0 120px" }}>
              <label style={labelStyle}>Frequency</label>
              <select value={salaryFrequency} onChange={(e) => setSalaryFrequency(e.target.value as "monthly" | "weekly" | "hourly" | "annual")} style={inputStyle}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="hourly">Hourly</option>
                <option value="annual">Annual</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Work Schedule</label>
            <input type="text" value={workSchedule} onChange={(e) => setWorkSchedule(e.target.value)} placeholder="e.g. Mon-Fri, 9 AM - 5 PM" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Reporting To</label>
            <input type="text" value={reportingTo} onChange={(e) => setReportingTo(e.target.value)} placeholder="e.g. Operations Manager" style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Additional Terms</label>
            <textarea value={additionalTerms} onChange={(e) => setAdditionalTerms(e.target.value)} rows={3} placeholder="Any additional terms or conditions..." style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        </div>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>Cancel</button>
          <button className="wm-primarybtn" type="button" disabled={!isValid} onClick={handleSend} style={{ opacity: isValid ? 1 : 0.5 }}>
            Generate & Send
          </button>
        </div>
      </div>
    </CenterModal>
  );
}