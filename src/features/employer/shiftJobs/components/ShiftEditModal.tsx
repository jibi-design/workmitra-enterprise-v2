// App name: Job Mitra
// File name: ShiftEditModal.tsx

import { useState } from "react";
import {
  buildInitialFields,
  PAY_BASIS_OPTIONS,
  toEpoch,
  type EditFields,
  type ShiftEditModalProps,
  type ShiftPayBasis,
} from "./ShiftEditModal.helpers";
import { ShiftEditConfirmedBanner, ShiftEditFormBody } from "./ShiftEditModal.parts";
import {
  CLOSE_BUTTON_STYLE,
  FOOTER_STYLE,
  HEADER_STYLE,
  OVERLAY_STYLE,
  PANEL_STYLE,
} from "./ShiftEditModal.styles";

export function ShiftEditModal({ post, onSave, onClose }: ShiftEditModalProps) {
  const [fields, setFields] = useState<EditFields>(() => buildInitialFields(post));

  const hasConfirmed = post.confirmedIds.length > 0;
  const pay = Number(fields.payPerDayStr) || 0;
  const payInputDisabled = fields.payBasis === "not_listed";
  const selectedPayHelper =
    PAY_BASIS_OPTIONS.find((option) => option.value === fields.payBasis)?.helper ?? "";
  const canSave = fields.jobName.trim().length > 0 && (fields.payBasis === "not_listed" || pay > 0);

  function set<K extends keyof EditFields>(key: K, value: EditFields[K]): void {
    setFields((current) => ({ ...current, [key]: value }));
  }

  function handlePayBasis(value: ShiftPayBasis): void {
    setFields((current) => ({
      ...current,
      payBasis: value,
      payPerDayStr: value === "not_listed" ? "" : current.payPerDayStr,
    }));
  }

  function handleSave(): void {
    if (!fields.jobName.trim()) return;
    if (fields.payBasis !== "not_listed" && pay <= 0) return;

    onSave({
      jobName: fields.jobName.trim(),
      description: fields.description.trim(),
      shiftTiming: fields.shiftTiming.trim(),
      payPerDay: fields.payBasis === "not_listed" ? 0 : pay,
      payBasis: fields.payBasis,
      startAt: toEpoch(fields.startDateStr),
      endAt: toEpoch(fields.endDateStr),
      locationName: fields.locationName.trim(),
      dressCode: fields.dressCode.trim() || undefined,
    });
  }

  return (
    <div style={OVERLAY_STYLE} onClick={onClose}>
      <div style={PANEL_STYLE} onClick={(event) => event.stopPropagation()}>
        <div style={HEADER_STYLE}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--wm-er-text)" }}>
              Edit Shift
            </div>
            <div style={{ fontSize: 12, color: "var(--wm-er-muted)", marginTop: 2 }}>
              {post.jobName} - {post.companyName}
            </div>
          </div>

          <button type="button" onClick={onClose} aria-label="Close" style={CLOSE_BUTTON_STYLE}>
            ×
          </button>
        </div>

        {hasConfirmed ? <ShiftEditConfirmedBanner count={post.confirmedIds.length} /> : null}

        <ShiftEditFormBody
          fields={fields}
          pay={pay}
          payInputDisabled={payInputDisabled}
          selectedPayHelper={selectedPayHelper}
          onFieldChange={set}
          onPayBasisChange={handlePayBasis}
        />

        <div style={FOOTER_STYLE}>
          <button className="wm-outlineBtn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="wm-primarybtn" type="button" onClick={handleSave} disabled={!canSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
