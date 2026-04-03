// src/features/employer/company/components/SettingsFormFields.tsx
// Reusable form field components for Employer Settings page.
// Session 7: Focus border = purple (Settings = HR domain).

import {
  fieldGroupStyle,
  fieldLabelStyle,
  fieldInputStyle,
  fieldInputDisabledStyle,
  fieldSelectStyle,
  fieldSelectDisabledStyle,
} from "../helpers/settingsStyles";

/* ------------------------------------------------ */
/* Focus color constant                             */
/* ------------------------------------------------ */
const FOCUS_COLOR = "var(--wm-er-accent-hr)";
const BORDER_RESET = "#d1d5db";

/* ------------------------------------------------ */
/* Text Field                                       */
/* ------------------------------------------------ */
interface SettingsTextFieldProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  /** Auto-capitalize words on blur (for name fields) */
  capitalizeWords?: boolean;
  /** Minimum character length — shows hint if below */
  minLength?: number;
}

export function SettingsTextField({
  label,
  value,
  disabled,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  capitalizeWords,
  minLength,
}: SettingsTextFieldProps) {
  const trimmedLen = value.trim().length;
  const showMinHint = minLength && trimmedLen > 0 && trimmedLen < minLength;

  return (
    <div style={fieldGroupStyle}>
      <label style={fieldLabelStyle}>
        {label}
        {required && <span style={{ color: "var(--wm-error)", marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => {
          const val = capitalizeWords
            ? e.target.value.replace(/\b\w/g, (c) => c.toUpperCase())
            : e.target.value;
          onChange(val);
        }}
        style={disabled ? fieldInputDisabledStyle : fieldInputStyle}
        onFocus={(e) => {
          if (!disabled) e.currentTarget.style.borderColor = FOCUS_COLOR;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = BORDER_RESET;
          if (capitalizeWords && !disabled) {
            const trimmed = value.trim().replace(/\s+/g, " ");
            onChange(trimmed);
          }
        }}
      />
      {showMinHint && (
        <div style={{ fontSize: 11, color: "var(--wm-error)", marginTop: 4 }}>
          Minimum {minLength} characters required
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* Select Field                                     */
/* ------------------------------------------------ */
interface SettingsSelectFieldProps {
  label: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  options: readonly string[] | readonly { value: string; label: string }[];
  placeholder: string;
}

export function SettingsSelectField({
  label,
  value,
  disabled,
  onChange,
  options,
  placeholder,
}: SettingsSelectFieldProps) {
  const isStringArray = options.length > 0 && typeof options[0] === "string";

  return (
    <div style={fieldGroupStyle}>
      <label style={fieldLabelStyle}>{label}</label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={disabled ? fieldSelectDisabledStyle : fieldSelectStyle}
      >
        <option value="">{placeholder}</option>
        {isStringArray
          ? (options as readonly string[]).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))
          : (options as readonly { value: string; label: string }[]).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
      </select>
    </div>
  );
}