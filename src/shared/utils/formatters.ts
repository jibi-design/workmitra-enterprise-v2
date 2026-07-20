/** Job Mitra | formatters.ts | src/shared/utils/formatters.ts */

/**
 * ARCHITECTURE NOTE:
 * Reusable formatting logic using native Intl APIs.
 * Ensures consistent data presentation across all dashboards.
 */

// 1. Currency Formatter (Default to INR)
export const formatCurrency = (amount: number, currency = "INR", locale = "en-IN"): string => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

// 2. Date Formatter (Standard: 12 Jun 2026)
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {},
): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
};

// 3. Compact Number Formatter (e.g. 1.2k)
export const formatCompactNumber = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
};

// 4. Status Label Formatter (joined_pending -> Joined Pending)
export const formatStatusLabel = (slug: string): string => {
  return slug
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
