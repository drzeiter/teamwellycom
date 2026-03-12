/**
 * Utility to generate calendar events (.ics) and open provider-specific URLs.
 */

export interface CalendarEventData {
  title: string;
  description?: string;
  durationMinutes?: number;
  startDate?: Date; // defaults to ~2 hours from now
  url?: string; // deep link URL shown in event notes
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toICSDate(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

function getStartEnd(data: CalendarEventData) {
  const start = data.startDate ?? new Date(Date.now() + 2 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + (data.durationMinutes || 15) * 60 * 1000);
  return { start, end };
}

// Escape special chars for ICS text fields
function escapeICS(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function generateICSFile(data: CalendarEventData): string {
  const { start, end } = getStartEnd(data);
  const baseDesc = escapeICS(data.description || "Time for your wellness routine!");
  const desc = data.url
    ? `${baseDesc}\\n\\nOpen your program:\\n${data.url}`
    : escapeICS(data.description || "Time for your wellness routine! Open TeamWelly to start.");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TeamWelly//Wellness//EN",
    "BEGIN:VEVENT",
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICS(data.title)} - TeamWelly`,
    `DESCRIPTION:${desc}`,
  ];

  // URL field is rendered as a clickable link in most calendar apps
  if (data.url) {
    lines.push(`URL:${data.url}`);
  }

  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-PT5M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeICS(data.title)} starting soon`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  );

  return lines.join("\r\n");
}

export function downloadICS(data: CalendarEventData) {
  const ics = generateICSFile(data);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${data.title.replace(/\s+/g, "-").toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export function openGoogleCalendar(data: CalendarEventData) {
  const { start, end } = getStartEnd(data);
  // Google Calendar renders HTML in details, so we can include a clickable link
  let details = data.description || "Time for your wellness routine! Open TeamWelly to start.";
  if (data.url) {
    details += `\n\n🔗 Open your program: ${data.url}`;
  }
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${data.title} - TeamWelly`,
    dates: `${toICSDate(start)}/${toICSDate(end)}`,
    details,
  });
  window.open(`https://calendar.google.com/calendar/event?${params.toString()}`, "_blank");
}

export function openOutlookCalendar(data: CalendarEventData) {
  const { start, end } = getStartEnd(data);
  let body = data.description || "Time for your wellness routine! Open TeamWelly to start.";
  if (data.url) {
    body += `\n\n🔗 Open your program: ${data.url}`;
  }
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: `${data.title} - TeamWelly`,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body,
  });
  window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`, "_blank");
}

export type CalendarProvider = "google" | "apple" | "outlook";

export async function addToCalendar(provider: CalendarProvider, data: CalendarEventData): Promise<boolean> {
  // On native Capacitor platforms, use the native calendar API (EventKit / CalendarProvider)
  const { isNativePlatform, requestCalendarPermission, createNativeCalendarEvent } = await import("@/utils/nativeCalendar");

  if (isNativePlatform()) {
    console.log("[CalendarEvent] Native platform detected — using Capacitor calendar plugin");

    // Use provided dates or default test event (5 min from now, 1 hour duration)
    const start = data.startDate ?? new Date(Date.now() + 5 * 60 * 1000);
    const end = new Date(start.getTime() + (data.durationMinutes || 60) * 60 * 1000);

    console.log("[CalendarEvent] Requesting calendar permission…");
    const granted = await requestCalendarPermission();
    console.log("[CalendarEvent] Permission granted:", granted);

    if (!granted) {
      return false;
    }

    const eventId = await createNativeCalendarEvent({
      title: data.title || "Team Welly Recovery Session",
      location: "Team Welly",
      notes: data.description || "Mobility and recovery session",
      startDate: start,
      endDate: end,
      url: data.url,
    });

    console.log("[CalendarEvent] Native event result:", eventId);
    return eventId !== null;
  }

  // Web fallback — only used on non-native platforms
  console.log("[CalendarEvent] Web platform — using browser fallback");
  switch (provider) {
    case "google":
      openGoogleCalendar(data);
      break;
    case "outlook":
      openOutlookCalendar(data);
      break;
    case "apple":
    default:
      downloadICS(data);
      break;
  }
  return true;
}
