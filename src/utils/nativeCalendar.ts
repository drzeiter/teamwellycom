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
 * Request calendar permission.
 * Tries requestFullCalendarAccess() first; falls back to requestWriteOnlyCalendarAccess() on iOS.
 * Returns true if permission was granted.
 */
export async function requestCalendarPermission(): Promise<boolean> {
  try {
    const Calendar = await getCalendarPlugin();

    console.log("[NativeCalendar] Requesting full calendar access…");
    try {
      const fullResult = await Calendar.requestFullCalendarAccess();
      console.log("[NativeCalendar] Full access result:", JSON.stringify(fullResult));
      const fullStatus = fullResult?.result ?? fullResult?.display ?? fullResult;
      if (fullStatus === "granted" || fullStatus === true) {
        console.log("[NativeCalendar] Full access GRANTED");
        return true;
      }
    } catch (fullErr) {
      console.warn("[NativeCalendar] requestFullCalendarAccess failed, trying write-only:", fullErr);
    }

    // Fallback: write-only (sufficient for creating events on iOS)
    console.log("[NativeCalendar] Requesting write-only calendar access…");
    const writeResult = await Calendar.requestWriteOnlyCalendarAccess();
    console.log("[NativeCalendar] Write-only access result:", JSON.stringify(writeResult));
    const writeStatus = writeResult?.result ?? writeResult?.writeCalendar ?? writeResult;
    if (writeStatus === "granted" || writeStatus === true) {
      console.log("[NativeCalendar] Write-only access GRANTED");
      return true;
    }

    console.warn("[NativeCalendar] Calendar permission DENIED");
    return false;
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
 * Create an event using the native calendar prompt UI (createEventWithPrompt).
 * This shows the native iOS/Android event-creation dialog so the user can confirm.
 * Returns the event identifiers on success, or null on failure.
 */
export async function createNativeCalendarEvent(event: NativeCalendarEvent): Promise<string | null> {
  try {
    const Calendar = await getCalendarPlugin();

    console.log("[NativeCalendar] Creating event with prompt…", {
      title: event.title,
      location: event.location,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
    });

    const result = await Calendar.createEventWithPrompt({
      title: event.title,
      location: event.location,
      notes: event.notes || "",
      startDate: event.startDate.getTime(),
      endDate: event.endDate.getTime(),
      isAllDay: false,
    });

    console.log("[NativeCalendar] createEventWithPrompt result:", JSON.stringify(result));
    const eventId = result?.result?.[0] ?? result?.id ?? null;
    console.log("[NativeCalendar] Event created successfully, id:", eventId);
    return eventId;
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
