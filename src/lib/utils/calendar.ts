/**
 * Generate a Google Calendar URL for an event.
 */

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

type Time = { hours: number; minutes: number };

function parseTimePart(s: string, fallbackPeriod?: 'AM' | 'PM'): Time | null {
  const m = s.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!m) return null;

  let hours = parseInt(m[1], 10);
  const minutes = m[2] ? parseInt(m[2], 10) : 0;
  const period = (m[3]?.toUpperCase() ?? fallbackPeriod) as 'AM' | 'PM' | undefined;

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

function parseTimeRange(timeStr: string): { start: Time; end?: Time } | null {
  const trimmed = timeStr.trim();
  const timeToken = String.raw`\d{1,2}(?::\d{2})?\s*(?:AM|PM)?`;

  // Range at the start of the string. Matches "12–6 PM", "12:00 – 6:00 PM",
  // "5:00 PM – 8:00 PM" — and ignores any trailing text like ", Wed–Sat".
  const rangeMatch = trimmed.match(
    new RegExp(`^(${timeToken})\\s*[–—\\-]\\s*(${timeToken})`, 'i')
  );
  if (rangeMatch) {
    const [, startStr, endStr] = rangeMatch;
    // The start side may omit AM/PM (e.g. "12:00 – 6:00 PM"); inherit from end.
    const endPeriodMatch = endStr.match(/(AM|PM)\s*$/i);
    const endPeriod = endPeriodMatch?.[1].toUpperCase() as 'AM' | 'PM' | undefined;
    const start = parseTimePart(startStr, endPeriod);
    const end = parseTimePart(endStr);
    if (!start) return null;
    return { start, end: end ?? undefined };
  }

  // Single time at the start of the string. Require AM/PM so bare words
  // (e.g. "All Day") don't accidentally parse.
  const singleMatch = trimmed.match(/^(\d{1,2}(?::\d{2})?\s*(?:AM|PM))/i);
  if (singleMatch) {
    const start = parseTimePart(singleMatch[1]);
    return start ? { start } : null;
  }

  return null;
}

function formatGCalDate(dateStr: string, time: Time): string {
  const d = new Date(dateStr + 'T00:00:00');
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(time.hours)}${pad(time.minutes)}00`
  );
}

function nextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

function formatGCalDateOnly(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
}

export function generateGoogleCalendarUrl(event: {
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  location: string;
  address: string;
  description: string;
}): string {
  const parsed = event.time ? parseTimeRange(event.time) : null;

  // No time, or unparseable (e.g. "All Day"): all-day event. End is exclusive.
  if (!parsed) {
    const dtstart = formatGCalDateOnly(event.date);
    const dtend = nextDay(event.endDate ?? event.date);
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${dtstart}/${dtend}`,
      details: event.description,
      location: `${event.location}, ${event.address}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  const { start, end } = parsed;
  const dtstart = formatGCalDate(event.date, start);

  const endDateStr = event.endDate ?? event.date;
  const endTime: Time = end ?? {
    hours: Math.min(start.hours + 3, 23),
    minutes: start.hours + 3 > 23 ? 59 : start.minutes,
  };
  const dtend = formatGCalDate(endDateStr, endTime);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${dtstart}/${dtend}`,
    details: event.description,
    location: `${event.location}, ${event.address}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
