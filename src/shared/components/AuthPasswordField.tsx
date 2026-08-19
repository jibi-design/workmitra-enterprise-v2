/** Shared auth password input with show/hide toggle (Play Store mobile UX). */

import { useId, useState, type ChangeEventHandler } from "react";

type Props = {
  readonly label: string;
  readonly value: string;
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly autoComplete: "current-password" | "new-password";
  readonly name?: string;
  readonly required?: boolean;
  readonly minLength?: number;
  readonly disabled?: boolean;
  readonly id?: string;
};

function IconEyeOpen() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7Zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
      />
    </svg>
  );
}

function IconEyeClosed() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M2.1 3.51 3.51 2.1l18.39 18.39-1.41 1.41-2.35-2.35C16.3 20.5 14.25 21 12 21 5 21 1 14 1 14a20.5 20.5 0 0 1 5.26-5.98L2.1 3.51ZM12 7c.7 0 1.37.12 2 .33l-1.56 1.56A3 3 0 0 0 9.11 12.2L7.55 10.64A5 5 0 0 1 12 7Zm0 12c2.05 0 3.88-.55 5.4-1.4l-2.12-2.12A4.98 4.98 0 0 1 7.5 12.3l-2.2-2.2C3.96 11.7 2.7 13.2 2.2 14 3.55 16.7 7.2 19 12 19Zm9.8-5s-1.2-2.1-3.5-3.7l-1.5 1.5c1.3.9 2.3 2 2.8 2.2-.4.7-1.3 1.8-2.6 2.7l1.45 1.45C20.4 16.3 21.8 14 21.8 14Z"
      />
    </svg>
  );
}

export function AuthPasswordField({
  label,
  value,
  onChange,
  autoComplete,
  name = "password",
  required = true,
  minLength,
  disabled = false,
  id,
}: Props) {
  const reactId = useId();
  const inputId = id ?? `wm-auth-password-${reactId}`;
  const [visible, setVisible] = useState(false);

  return (
    <label className="wm-auth-label" htmlFor={inputId}>
      {label}
      <span className="wm-auth-password">
        <input
          id={inputId}
          className="wm-auth-input wm-auth-password__input"
          type={visible ? "text" : "password"}
          name={name}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          disabled={disabled}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="wm-auth-password__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
        >
          {visible ? <IconEyeClosed /> : <IconEyeOpen />}
        </button>
      </span>
    </label>
  );
}
