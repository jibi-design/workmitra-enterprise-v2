/**
 * Job Mitra | PhoneNumberField.tsx
 * Country dial selector (searchable, 200+) + national number.
 */

import { PhoneCountryPicker } from "./PhoneCountryPicker";
import {
  composeE164,
  getPhoneDialCountry,
  parseStoredPhone,
  sanitizeNationalNumber,
} from "./phoneDialCountries";

type Props = {
  value: string;
  onChange: (e164: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  testId?: string;
  className?: string;
  /** Prefer iso when value empty */
  preferredIso?: string;
};

export function PhoneNumberField({
  value,
  onChange,
  disabled = false,
  placeholder = "Mobile number",
  autoComplete = "tel-national",
  testId = "phone-number-field",
  className = "wm-input",
  preferredIso,
}: Props) {
  const parsed = parseStoredPhone(value);
  const iso = value.trim() ? parsed.iso : (preferredIso ?? parsed.iso);
  const country = getPhoneDialCountry(iso);
  const national = value.trim() ? parsed.national : "";

  function emit(nextIso: string, nextNational: string) {
    const c = getPhoneDialCountry(nextIso);
    onChange(composeE164(c.dial, nextNational));
  }

  return (
    <div
      data-testid={testId}
      style={{ display: "grid", gridTemplateColumns: "minmax(118px, 140px) 1fr", gap: 8 }}
    >
      <PhoneCountryPicker
        valueIso={country.iso}
        disabled={disabled}
        className={className}
        testId={`${testId}-country`}
        onSelect={(nextIso) => emit(nextIso, national)}
      />
      <input
        className={className}
        type="tel"
        inputMode="numeric"
        autoComplete={autoComplete}
        aria-label="Phone number"
        data-testid={`${testId}-national`}
        value={national}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => emit(country.iso, sanitizeNationalNumber(e.target.value))}
      />
    </div>
  );
}
