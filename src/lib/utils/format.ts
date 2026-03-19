/**
 * Formatting utilities for dates and display values.
 */

/** Build a full name string from a student record. */
export function fullName(student: { data: { firstName: string; lastName: string } }): string {
  return `${student.data.firstName} ${student.data.lastName}`;
}

/** Format a single date string (YYYY-MM-DD) to a readable format. */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a time string like "5:00 PM" or "5:00 PM – 8:00 PM" into a compact
 * style: "5 pm" or "5 – 8 pm". Minutes are omitted when they are :00.
 * If the two sides of a range have different periods (AM vs PM), each gets its own suffix.
 */
export function formatTime(timeStr: string): string {
  function parsePart(s: string): { hour: number; min: number; period: string } | null {
    const m = s.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    return { hour: parseInt(m[1], 10), min: parseInt(m[2], 10), period: m[3].toUpperCase() };
  }
  function display(hour: number, min: number): string {
    return min === 0 ? `${hour}` : `${hour}:${String(min).padStart(2, "0")}`;
  }

  const parts = timeStr.split(/\s+[–\-]\s+/);
  if (parts.length === 2) {
    const a = parsePart(parts[0]);
    const b = parsePart(parts[1]);
    if (a && b) {
      if (a.period === b.period) {
        return `${display(a.hour, a.min)} – ${display(b.hour, b.min)} ${a.period.toLowerCase()}`;
      }
      return `${display(a.hour, a.min)} ${a.period.toLowerCase()} – ${display(b.hour, b.min)} ${b.period.toLowerCase()}`;
    }
  }
  if (parts.length === 1) {
    const a = parsePart(parts[0]);
    if (a) return `${display(a.hour, a.min)} ${a.period.toLowerCase()}`;
  }
  return timeStr;
}

/** Format a date range. If endDate is absent, returns a single formatted date. */
export function formatDateRange(startStr: string, endStr?: string): string {
  if (!endStr) return formatDate(startStr);

  const start = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const month = start.toLocaleDateString("en-US", { month: "long" });
    return `${month} ${start.getDate()}\u2013${end.getDate()}, ${start.getFullYear()}`;
  }

  const opts: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  return `${start.toLocaleDateString("en-US", opts)} \u2013 ${end.toLocaleDateString("en-US", opts)}`;
}
