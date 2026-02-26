/**
 * Utility to generate calendar events (.ics) and open provider-specific URLs.
 */

export interface CalendarEventData {
  title: string;
  description?: string;
  durationMinutes?: number;
  startDate?: Date; // defaults to ~2 hours from now
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toICSDate(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

function toGoogleDate(d: Date): string {
  return toICSDate(d);
}

function getStartEnd(data: CalendarEventData) {
  const start = data.startDate ?? new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
  const end = new Date(start.getTime() + (data.durationMinutes || 15) * 60 * 1000);
  return { start, end };
}

export function generateICSFile(data: CalendarEventData): string {
  const { start, end } = getStartEnd(data);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TeamWelly//Wellness//EN",
    "BEGIN:VEVENT",
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${data.title} - TeamWelly`,
    `DESCRIPTION:${data.description || "Time for your wellness routine! Open TeamWelly to start."}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT5M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${data.title} starting soon`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
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
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${data.title} - TeamWelly`,
    dates: `${toGoogleDate(start)}/${toGoogleDate(end)}`,
    details: data.description || "Time for your wellness routine! Open TeamWelly to start.",
  });
  window.open(`https://calendar.google.com/calendar/event?${params.toString()}`, "_blank");
}

export function openOutlookCalendar(data: CalendarEventData) {
  const { start, end } = getStartEnd(data);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: `${data.title} - TeamWelly`,
    startdt: start.toISOString(),
    enddt: end.toISOString(),
    body: data.description || "Time for your wellness routine! Open TeamWelly to start.",
  });
  window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`, "_blank");
}

export type CalendarProvider = "google" | "apple" | "outlook";

export function addToCalendar(provider: CalendarProvider, data: CalendarEventData) {
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
}
