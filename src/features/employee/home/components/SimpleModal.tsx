// App name: Job Mitra
// File name: SimpleModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\home\components\SimpleModal.tsx

import { useCallback } from "react";
import type { MouseEvent } from "react";
import { EMPLOYEE_STATUS_COLORS } from "../helpers/employeeStatusCardStyles";

type SimpleModalProps = {
  title: string;
  body?: string;
  primaryText?: string;
  onPrimary?: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
  onClose: () => void;
};

export function SimpleModal(props: SimpleModalProps) {
  const stopProp = useCallback((event: MouseEvent) => {
    event.stopPropagation();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 50,
      }}
      onClick={props.onClose}
    >
      <div className="wm-ee-card" style={{ width: "100%", maxWidth: 420 }} onClick={stopProp}>
        <div style={{ fontWeight: 700, color: EMPLOYEE_STATUS_COLORS.text, fontSize: 16 }}>
          {props.title}
        </div>

        {props.body ? (
          <div className="wm-ee-helperText" style={{ marginTop: 8 }}>
            {props.body}
          </div>
        ) : null}

        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          {props.secondaryText ? (
            <button
              className="wm-secondarybtn"
              type="button"
              onClick={props.onSecondary ?? props.onClose}
            >
              {props.secondaryText}
            </button>
          ) : null}

          {props.primaryText ? (
            <button
              className="wm-primarybtn"
              type="button"
              onClick={props.onPrimary ?? props.onClose}
            >
              {props.primaryText}
            </button>
          ) : (
            <button className="wm-primarybtn" type="button" onClick={props.onClose}>
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
