export const HONEYPOT_FIELD_NAME = "wm_hp_company_url";

export function honeypotTripped(form: HTMLFormElement): boolean {
  const el = form.elements.namedItem(HONEYPOT_FIELD_NAME);
  return el instanceof HTMLInputElement && el.value.trim().length > 0;
}
