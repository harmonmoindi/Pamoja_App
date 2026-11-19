// Shared formatting helpers. Owned by the Foundation owner: add new helpers, never change existing ones.

/** "2026-11-15" -> "15 Nov 2026" (date-only strings are treated as UTC so the day never shifts) */
export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}

/** "2026-11-18T08:48:00" -> "18 Nov, 08:48" */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
