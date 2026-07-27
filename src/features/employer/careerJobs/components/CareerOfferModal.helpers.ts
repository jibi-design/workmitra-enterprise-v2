export const MAX_OFFER_SALARY = 999_999_999;

export function getTodayInputValue(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 10);
}

function getDateOnlyMs(value: string): number | null {
  if (!value.trim()) return null;

  const date = new Date(`${value}T00:00`);

  if (Number.isNaN(date.getTime())) return null;

  return date.getTime();
}

export function getOfferValidationMessage(
  roleValue: string,
  salaryValue: string,
  startDateValue: string,
  todayValue: string,
): string {
  const role = roleValue.trim();
  const salaryText = salaryValue.trim();
  const salary = Number(salaryText);
  const startDateMs = getDateOnlyMs(startDateValue);
  const todayMs = getDateOnlyMs(todayValue);

  if (role.length < 2) return "Enter a valid job title for this offer.";
  if (!salaryText) return "Enter the offered salary.";
  if (
    !Number.isFinite(salary) ||
    !Number.isInteger(salary) ||
    salary <= 0 ||
    salary > MAX_OFFER_SALARY
  ) {
    return "Salary must be a whole number between 1 and 999,999,999.";
  }
  if (startDateMs === null || todayMs === null) return "Select a valid expected start date.";
  if (startDateMs < todayMs) return "Expected start date cannot be before today.";

  return "";
}
