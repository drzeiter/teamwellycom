# Changelog

All notable changes to TeamWelly will be documented in this file.

## [Unreleased]

### Added
- **iOS 17+ Write-Only Calendar Permission** — Native calendar integration now uses `requestWriteOnlyCalendarAccess()` first, falling back to full access on older iOS versions. Expects `NSCalendarsWriteOnlyAccessUsageDescription` in `Info.plist`.
- **Enhanced Calendar Logging** — Detailed console logs for permission requests, event creation, and error states to aid debugging on-device.
- **ReminderScheduler Component** — Daily reminder cards (Morning Stretch, Midday Reset, Posture Check, Wind Down) with date/time picker and calendar sync.
- **CalendarSync Component** — Provider picker (Google, Apple, Outlook) with suggested wellness routines and one-tap scheduling.
- **ScheduleBottomSheet** — Reusable bottom sheet for selecting date, time, and duration when scheduling tasks or routines.
- **Movement Analysis Lab** — Camera-based posture analysis with AI-powered movement assessment, body map, and detailed reports.
- **Welly Assistant** — AI-powered wellness chat assistant.
- **Exercise Player** — Guided exercise sessions with animated avatar, bilateral support, and progress tracking.
- **Onboarding Flow** — Multi-step onboarding collecting fitness level, goals, pain areas, and equipment preferences.
- **Dashboard** — Welly Score ring, metrics strip, action hub, insights feed, and floating particles.
- **Step Tracker** — Daily step count widget with animated progress ring.
- **Confetti Effect** — Celebratory animation on milestone completions.
- **Breathing Visualizer** — Guided breathwork with animated circle.
- **Wellness Quotes & Tips** — Rotating motivational content cards.
- **Company Admin Dashboard** — HR/admin views for managing employees, challenges, events, and rewards.
- **Super Admin Dashboard** — Platform-level administration.
- **Access Code System** — Company invite codes for employee onboarding.
- **Welly Points & Streaks** — Gamification with points ledger, streaks, and reward redemptions.
- **Multi-Week Programs** — Structured exercise programs with weekly modules and enrolled program tracking.
- **Role-Based Access Control** — `admin`, `moderator`, `hr_admin`, `user` roles with RLS policies.

### Changed
- **Native Calendar Integration** — Refactored `nativeCalendar.ts` to prioritize iOS 17+ write-only permission before falling back to full calendar access.
- **Calendar Event Utils** — Unified `addToCalendar()` with native-first detection and web URL fallback.

### Fixed
- Calendar permission handling for iOS 17+ devices that don't support legacy full-access prompts.
