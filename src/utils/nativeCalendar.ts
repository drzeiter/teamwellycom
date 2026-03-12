/**
 * Native calendar integration via Capacitor Calendar plugin.
 * Uses @ebarooni/capacitor-calendar for EventKit (iOS) and CalendarProvider (Android).
 */

import { Capacitor } from "@capacitor/core";

// Lazy-import to avoid errors in web-only environments
let CapCalendar: any = null;

async function getCalendarPlugin() {
  if (!CapCalendar) {
    const mod = await import("@ebarooni/capacitor-calendar");
    CapCalendar = mod.CapacitorCalendar;
  }
  return CapCalendar;
}

/**
 * Returns true when running inside a native Capacitor shell (iOS/Android).
 */
export function isNativePlatform(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Request write-only calendar permission (triggers the native iOS/Android popup).
 * Returns true if permission was granted.
 */
export async function requestCalendarPermission(): Promise<boolean> {
  try {
    const Calendar = await getCalendarPlugin();
    // requestWriteOnlyCalendarAccess is sufficient for creating events
    const result = await Calendar.requestWriteOnlyCalendarAccess();
    // The result contains the permission status
    const status = result?.result ?? result?.writeCalendar ?? result;
    return status === "granted" || status === true;
  } catch (err) {
    console.error("[NativeCalendar] Permission request failed:", err);
    return false;
  }
}

export interface NativeCalendarEvent {
  title: string;
  location?: string;
  notes?: string;
  startDate: Date;
  endDate: Date;
  url?: string;
}

/**
 * Create an event in the device's native calendar using EventKit (iOS) / CalendarProvider (Android).
 * Returns the event ID on success, or null on failure.
 */
export async function createNativeCalendarEvent(event: NativeCalendarEvent): Promise<string | null> {
  try {
    const Calendar = await getCalendarPlugin();

    // Build description with deep-link URL if provided
    let description = event.notes || "";
    if (event.url) {
      description += `\n\n🔗 Open your program: ${event.url}`;
    }

    const result = await Calendar.createEvent({
      title: event.title,
      location: event.location,
      startDate: event.startDate.getTime(),
      endDate: event.endDate.getTime(),
      isAllDay: false,
    });

    console.log("[NativeCalendar] Event created:", result);
    return result?.id ?? result?.result ?? null;
  } catch (err) {
    console.error("[NativeCalendar] Failed to create event:", err);
    return null;
  }
}

/**
 * High-level helper: request permission then create event.
 * Returns { success, eventId }.
 */
export async function addEventToNativeCalendar(event: NativeCalendarEvent): Promise<{ success: boolean; eventId: string | null }> {
  const granted = await requestCalendarPermission();
  if (!granted) {
    return { success: false, eventId: null };
  }

  const eventId = await createNativeCalendarEvent(event);
  return { success: eventId !== null, eventId };
}
