/**
 * Generate a Google Calendar URL for an event.
 */

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function parseTime(timeStr: string | undefined): { hours: number; minutes: number } {
  if (!timeStr) return { hours: 0, minutes: 0 };
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return { hours: 0, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

function formatGCalDate(dateStr: string, timeStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const { hours, minutes } = parseTime(timeStr);
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(hours)}${pad(minutes)}00`
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
  // All-day event: use date-only format; Google Calendar end is exclusive so add one day
  if (!event.time) {
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

  const dtstart = formatGCalDate(event.date, event.time);

  const { hours, minutes } = parseTime(event.time);
  const endHours = hours + 3;
  const endDate = event.endDate ?? event.date;
  const d = new Date(endDate + 'T00:00:00');
  const dtend = event.endDate
    ? formatGCalDate(event.endDate, event.time)
    : `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(endHours)}${pad(minutes)}00`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${dtstart}/${dtend}`,
    details: event.description,
    location: `${event.location}, ${event.address}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
