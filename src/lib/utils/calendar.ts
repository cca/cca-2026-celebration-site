/**
 * Generate an .ics calendar file data URI for an event.
 */

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return { hours: 0, minutes: 0 };

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();

  if (ampm === 'PM' && hours !== 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return { hours, minutes };
}

function formatIcsDate(dateStr: string, timeStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const { hours, minutes } = parseTime(timeStr);
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(hours)}${pad(minutes)}00`
  );
}

export function generateIcsDataUri(event: {
  title: string;
  date: string;
  endDate?: string;
  time: string;
  location: string;
  address: string;
  description: string;
}): string {
  const dtstart = formatIcsDate(event.date, event.time);

  // Default to 3-hour duration if no end date
  const { hours, minutes } = parseTime(event.time);
  const endHours = hours + 3;
  const endDate = event.endDate ?? event.date;
  const d = new Date(endDate + 'T00:00:00');
  const dtend = event.endDate
    ? formatIcsDate(event.endDate, event.time)
    : `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(endHours)}${pad(minutes)}00`;

  const uid = `${dtstart}-${event.title.replace(/\s+/g, '-').toLowerCase()}@cca.edu`;
  const escapedDesc = event.description.replace(/[,;\\]/g, (m) => '\\' + m).replace(/\n/g, '\\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CCA//2026 Celebrations//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTART;TZID=America/Los_Angeles:${dtstart}`,
    `DTEND;TZID=America/Los_Angeles:${dtend}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.location}\\, ${event.address}`,
    `DESCRIPTION:${escapedDesc}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const icsContent = lines.join('\r\n');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
}
