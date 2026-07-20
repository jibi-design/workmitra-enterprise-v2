// App: Job Mitra / WorkMitra_Enterprise_v2
// File: BulkNoticeCreateCard.tsx
// Path: C:\projects\WorkMitra_Enterprise_v2\src\features\employer\hrManagement\components\bulkNotifications\BulkNoticeCreateCard.tsx

import { NOTIF_INPUT_STYLE, NOTIF_LABEL_STYLE } from "../../helpers/bulkNotificationsHelpers";
import type { ExtendedTarget } from "../../helpers/bulkNotificationsHelpers";
import type { HRCandidateRecord } from "../../types/hrManagement.types";
import { BulkNoticeSpecificEmployeesSelector } from "./BulkNoticeSpecificEmployeesSelector";
import { BulkNoticeTargetSelector } from "./BulkNoticeTargetSelector";

type Props = {
  title: string;
  body: string;
  target: ExtendedTarget;
  targetValue: string;
  selectedIds: Set<string>;
  empSearch: string;
  departments: string[];
  locations: string[];
  employees: HRCandidateRecord[];
  filteredEmployees: HRCandidateRecord[];
  canSend: boolean;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onTargetChange: (value: ExtendedTarget) => void;
  onTargetValueChange: (value: string) => void;
  onEmpSearchChange: (value: string) => void;
  onToggleEmployee: (id: string) => void;
  onSendRequest: () => void;
};

export function BulkNoticeCreateCard({
  title,
  body,
  target,
  targetValue,
  selectedIds,
  empSearch,
  departments,
  locations,
  employees,
  filteredEmployees,
  canSend,
  onTitleChange,
  onBodyChange,
  onTargetChange,
  onTargetValueChange,
  onEmpSearchChange,
  onToggleEmployee,
  onSendRequest,
}: Props) {
  return (
    <div
      style={{
        marginTop: 10,
        padding: 16,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid var(--wm-er-border, #e5e7eb)",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14, color: "var(--wm-er-text)", marginBottom: 12 }}>
        Create Notice
      </div>

      <div>
        <label style={NOTIF_LABEL_STYLE}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="e.g. Office closed tomorrow"
          style={NOTIF_INPUT_STYLE}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={NOTIF_LABEL_STYLE}>Message *</label>
        <textarea
          value={body}
          onChange={(event) => onBodyChange(event.target.value)}
          placeholder="Write your notice here..."
          rows={4}
          style={{ ...NOTIF_INPUT_STYLE, resize: "vertical" }}
        />
      </div>

      <BulkNoticeTargetSelector
        target={target}
        targetValue={targetValue}
        departments={departments}
        locations={locations}
        onTargetChange={onTargetChange}
        onTargetValueChange={onTargetValueChange}
      />

      {target === "specific" && (
        <BulkNoticeSpecificEmployeesSelector
          selectedIds={selectedIds}
          empSearch={empSearch}
          employees={employees}
          filteredEmployees={filteredEmployees}
          onEmpSearchChange={onEmpSearchChange}
          onToggleEmployee={onToggleEmployee}
        />
      )}

      <button
        className="wm-primarybtn"
        type="button"
        onClick={onSendRequest}
        disabled={!canSend}
        style={{ width: "100%", marginTop: 16, opacity: canSend ? 1 : 0.5 }}
      >
        {target === "specific" && selectedIds.size > 0
          ? `Send Notice to ${selectedIds.size} Employee${selectedIds.size > 1 ? "s" : ""}`
          : "Send Notice"}
      </button>
    </div>
  );
}
