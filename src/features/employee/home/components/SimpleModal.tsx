// App name: Job Mitra
// File name: SimpleModal.tsx
// Full file path: C:\projects\WorkMitra_Enterprise_v2\src\features\employee\home\components\SimpleModal.tsx

import { useCallback } from "react";
import type { MouseEvent } from "react";

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
      className="wm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={props.title}
      onClick={props.onClose}
    >
      <div className="wm-modal-card wm-simpleModal__card" onClick={stopProp}>
        <div className="wm-simpleModal__title">{props.title}</div>

        {props.body ? (
          <div className="wm-ee-helperText wm-simpleModal__body">{props.body}</div>
        ) : null}

        <div className="wm-simpleModal__actions">
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
