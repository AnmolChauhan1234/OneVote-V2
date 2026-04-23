/**
 * Safely parse a date string returned from the API as UTC.
 *
 * Problem: JavaScript's `new Date("2026-04-23T10:02:00")` (no tz suffix)
 * treats it as LOCAL time. For IST (UTC+5:30) users, 10:02 UTC becomes
 * 10:02 AM local — wrong. The correct local display should be 3:32 PM.
 *
 * This helper appends "Z" if no timezone info is present, ensuring the
 * string is always interpreted as UTC before being converted to local time.
 */
export function parseAPIDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date(NaN);

  // Already has timezone: ends with Z, or has ±HH:MM offset
  if (dateStr.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(dateStr)) {
    return new Date(dateStr);
  }

  // No timezone info — treat as UTC by appending Z
  return new Date(dateStr + "Z");
}

/**
 * Format an API date string for display in the user's local timezone.
 * e.g. "2026-04-23T10:02:00Z" → "23/04/2026, 3:32:00 pm" (for IST users)
 */
export function formatAPIDate(
  dateStr: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = parseAPIDate(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, options);
}

/**
 * Convert an API date string to the value needed by a datetime-local input.
 * datetime-local inputs work in LOCAL time, so we must extract local parts.
 * e.g. "2026-04-23T10:02:00Z" → "2026-04-23T15:32" (for IST users)
 */
export function apiDateToLocalInputValue(dateStr: string | null | undefined): string {
  const d = parseAPIDate(dateStr);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
