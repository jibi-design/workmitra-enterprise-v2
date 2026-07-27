import type { ShiftPost } from "../../shiftJobs/storage/employerShift.storage";
import {
  formatShiftPayDisplay,
  PAY_BASIS_OPTIONS,
  todayStr,
  type EditFields,
  type ShiftPayBasis,
} from "./ShiftEditModal.helpers";
import {
  DATE_GRID_STYLE,
  FORM_BODY_STYLE,
  PAY_PREVIEW_STYLE,
  TEXTAREA_STYLE,
} from "./ShiftEditModal.styles";

type ShiftEditFormProps = {
  post: ShiftPost;
  fields: EditFields;
  hasConfirmed: boolean;
  pay: number;
  payInputDisabled: boolean;
  selectedPayHelper: string;
  canSave: boolean;
  onFieldChange: <K extends keyof EditFields>(key: K, value: EditFields[K]) => void;
  onPayBasisChange: (value: ShiftPayBasis) => void;
  onSave: () => void;
  onClose: () => void;
};

export function ShiftEditFormBody({
  fields,
  pay,
  payInputDisabled,
  selectedPayHelper,
  onFieldChange,
  onPayBasisChange,
}: Pick<
  ShiftEditFormProps,
  "fields" | "pay" | "payInputDisabled" | "selectedPayHelper" | "onFieldChange" | "onPayBasisChange"
>) {
  return (
    <div style={FORM_BODY_STYLE}>
      <div>
        <div className="wm-label">
          Job Title <span style={{ color: "var(--wm-error)" }}>*</span>
        </div>
        <input
          className="wm-input"
          value={fields.jobName}
          onChange={(event) => onFieldChange("jobName", event.target.value)}
          maxLength={100}
        />
      </div>

      <div>
        <div className="wm-label">
          Location <span style={{ color: "var(--wm-error)" }}>*</span>
        </div>
        <input
          className="wm-input"
          value={fields.locationName}
          onChange={(event) => onFieldChange("locationName", event.target.value)}
          maxLength={150}
        />
      </div>

      <div style={DATE_GRID_STYLE}>
        <div>
          <div className="wm-label">Start Date</div>
          <input
            className="wm-input"
            type="date"
            value={fields.startDateStr}
            min={todayStr()}
            onChange={(event) => onFieldChange("startDateStr", event.target.value)}
          />
        </div>

        <div>
          <div className="wm-label">End Date</div>
          <input
            className="wm-input"
            type="date"
            value={fields.endDateStr}
            min={fields.startDateStr}
            onChange={(event) => onFieldChange("endDateStr", event.target.value)}
          />
        </div>
      </div>

      <div>
        <div className="wm-label">
          Pay Basis <span style={{ color: "var(--wm-error)" }}>*</span>
        </div>
        <select
          className="wm-input"
          value={fields.payBasis}
          onChange={(event) => onPayBasisChange(event.target.value as ShiftPayBasis)}
        >
          {PAY_BASIS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div style={{ marginTop: 5, fontSize: 11, color: "var(--wm-er-muted)", lineHeight: 1.45 }}>
          {selectedPayHelper}
        </div>
      </div>

      <div>
        <div className="wm-label">
          Pay Amount{" "}
          {fields.payBasis !== "not_listed" && <span style={{ color: "var(--wm-error)" }}>*</span>}
        </div>
        <input
          className="wm-input"
          value={payInputDisabled ? "" : fields.payPerDayStr}
          onChange={(event) => onFieldChange("payPerDayStr", event.target.value.replace(/\D/g, ""))}
          inputMode="numeric"
          maxLength={7}
          disabled={payInputDisabled}
          placeholder={
            payInputDisabled
              ? "Not required when pay is not listed"
              : "Amount without currency symbol"
          }
        />

        <div style={PAY_PREVIEW_STYLE}>
          Workers will see:{" "}
          <b style={{ color: "var(--wm-er-text)" }}>
            {formatShiftPayDisplay(pay, fields.payBasis)}
          </b>
        </div>
      </div>

      <div>
        <div className="wm-label">Shift Timing</div>
        <input
          className="wm-input"
          value={fields.shiftTiming}
          onChange={(event) => onFieldChange("shiftTiming", event.target.value)}
          placeholder="e.g. 8:00 AM - 5:00 PM"
          maxLength={50}
        />
      </div>

      <div>
        <div className="wm-label">Dress Code</div>
        <input
          className="wm-input"
          value={fields.dressCode}
          onChange={(event) => onFieldChange("dressCode", event.target.value)}
          placeholder="e.g. Black trousers and white shirt"
          maxLength={200}
        />
      </div>

      <div>
        <div className="wm-label">Description</div>
        <textarea
          className="wm-input"
          value={fields.description}
          onChange={(event) => onFieldChange("description", event.target.value)}
          placeholder="Job description..."
          maxLength={500}
          style={TEXTAREA_STYLE}
        />
      </div>
    </div>
  );
}

export function ShiftEditConfirmedBanner({ count }: { count: number }) {
  return (
    <div
      style={{
        margin: "12px 18px 0",
        padding: "10px 12px",
        borderRadius: "var(--wm-radius-10)",
        background: "rgba(217,119,6,0.07)",
        border: "1px solid rgba(217,119,6,0.2)",
        fontSize: 12,
        color: "#92400e",
        fontWeight: 600,
        lineHeight: 1.5,
      }}
    >
      {count} confirmed worker{count !== 1 ? "s" : ""} will be notified of these changes.
    </div>
  );
}
