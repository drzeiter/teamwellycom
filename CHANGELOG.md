# Changelog — TeamWelly

All notable changes to the TeamWelly wellness platform are documented here.  
**Phase 1 — PWA MVP** · Targeting March 2026 launch · Business Requirements v7.1.0

---

## [Unreleased] — Phase 1 PWA MVP

### 🏗️ Platform & Infrastructure

- **Capacitor Native Shell** — iOS + Android native app wrappers via Capacitor 8, with live-reload dev server config (`capacitor.config.json`).
- **Lovable Cloud Backend** — Full backend powered by Lovable Cloud (Supabase) with 25+ database tables, Row-Level Security, and role-based access control.
- **React + Vite + TypeScript** — Single-page app built with React 18, Vite 5, TypeScript 5.8, Tailwind CSS 3.4, and shadcn/ui component library.
- **Framer Motion Animations** — Page transitions, micro-interactions, and animated UI throughout the app.
- **React Query** — Server state management with `@tanstack/react-query` for data fetching and caching.
- **Design System** — Custom design tokens (HSL), Space Grotesk + Inter typography, semantic color palette with dark mode support, glass-morphism cards, gradient utilities.

### 🔐 Authentication & Access Control

- **Email/Password Auth** — Sign up and sign in with email verification, powered by Lovable Cloud auth.
- **AuthContext Provider** — Global auth state with `signUp`, `signIn`, `signOut` methods and session persistence.
- **Role-Based Access Control** — `app_role` enum with `admin`, `moderator`, `hr_admin`, `user` roles stored in dedicated `user_roles` table.
- **`useUserRole` Hook** — Client-side role detection with priority resolution (admin > hr_admin > user).
- **Protected Routes** — `ProtectedRoute`, `OnboardingRoute`, and `AdminRoute` wrappers with onboarding gate check.
- **Access Code System** — Company-specific invite codes (`access_codes` table) for controlled employee onboarding.
- **Invite System** — Token-based invites (`invites` table) with expiry, role assignment, and `/invite/:token` acceptance flow.
- **Access Denied Page** — Graceful error page for unauthorized role access attempts.

### 🎯 Onboarding

- **10-Step Onboarding Flow** — Collects main goal, primary body area, fitness level, current challenge, pain score, pain duration, daily routine, weekly commitment (days), session duration preference, and equipment access.
- **Profile Creation** — Saves all onboarding data to `profiles` table with `onboarding_completed` flag.
- **Company Code Linking** — Optional company access code entry during signup links users to their employer's organization.

### 🏠 Dashboard (Wellness Lobby)

- **Welly Score Ring** — Animated SVG donut chart showing overall wellness score with gradient fill.
- **Metrics Strip** — Horizontal scroll of key health metrics (steps, heart rate, calories, streak).
- **Action Hub** — Quick-action cards for starting programs, opening Movement Lab, viewing calendar.
- **Insights Feed** — AI-generated or curated wellness insight cards.
- **Floating Particles** — Decorative ambient particle animation layer.
- **My Plan Widget** — Shows enrolled programs with progress and quick-start buttons.
- **Welly Points Display** — Current points balance, streak counter, and longest streak.
- **Tab Navigation** — Bottom tabs: Home, Tips, Quotes, Steps, Calendar, with animated tab transitions.

### 🏋️ Exercise System

- **Programs Table** — Structured exercise programs with category, difficulty, duration, target area, equipment needed, and sort order.
- **Multi-Week Modules** — `weekly_modules` table with focus text per week; `module_exercises` table linking canonical exercises with sets/reps/hold/frequency.
- **Canonical Exercises Library** — 100+ exercises in `canonical_exercises` table with animation specs, biomechanical confidence scores, cues, common mistakes, progressions/regressions, and tags.
- **Exercise Aliases** — Normalized name matching system (`exercise_aliases` table) for fuzzy exercise lookup.
- **Exercise Movement Specs** — 3,000+ line biomechanical specification system (`exerciseMovementSpecs.ts`) defining anatomical joint poses, phase sequences, tempo, breath sync, and form constraints for avatar animation.
- **Program Overview Page** — Detailed program view with exercise list, duration, difficulty badge, and "Start Program" CTA.
- **Exercise Detail Page** — Individual exercise view with instructions, cues, and progression info.
- **Exercise Player** — Full-screen guided session player with:
  - Animated exercise avatar (SVG joint-based with interpolated poses)
  - Bilateral exercise support (left/right side switching)
  - Timer with countdown and progress bar
  - Exercise queue navigation (next/previous)
  - Session completion tracking
- **Exercise Avatar Components** — `ExerciseAvatar.tsx`, `AnatomicalAvatar.tsx`, `LegacyExerciseAvatar.tsx` for rendering biomechanically accurate exercise demonstrations.
- **User Enrolled Programs** — `user_enrolled_programs` table tracking active enrollments and current week progress.
- **User Progress Tracking** — `user_progress` table recording completed exercises, session duration, and points earned.

### 🔬 Movement Analysis Lab

- **Camera Capture** — Device camera integration for posture photo/video capture (`CameraCapture.tsx`).
- **AI-Powered Analysis** — Backend edge function (`analyze-movement`) using AI vision models to analyze posture with:
  - Three-plane analysis (sagittal, frontal, transverse)
  - Compensation chain detection
  - Symptom correlation mapping
  - Joint angle measurements
  - Risk flag identification
- **Movement Report** — Detailed assessment results display (`MovementReport.tsx`) with:
  - Overall posture score
  - Area-by-area scores (`ReportAreaScores.tsx`)
  - Joint measurements visualization (`ReportJointMeasurements.tsx`)
  - Posture alignment diagram (`PostureAlignmentDiagram.tsx`)
  - Body map overlay (`BodyMap.tsx`)
  - Program recommendations based on findings
- **Assessment History** — `movement_assessments` table storing scores, findings, risk flags, and raw AI response.
- **Movement Replay** — Visual replay of assessment captures (`MovementReplay.tsx`).

### 🤖 Welly AI Assistant

- **Chat Interface** — Floating chat bubble (`WellyAssistant.tsx`) available on all screens.
- **Backend Edge Function** — `welly-assistant` function (460+ lines) with:
  - Zeiter Recovery System knowledge base
  - 200+ conditions knowledge base integration (`conditions_kb` table)
  - Program recommendation engine with tag-based matching
  - Saved routines system (`saved_routines` table)
  - Context-aware responses using user profile, assessment history, and enrolled programs
  - Safety guardrails (no diagnosis, coaching-only language)
- **Markdown Rendering** — AI responses rendered with `react-markdown` for formatted text.

### 📅 Calendar & Scheduling

- **Calendar Sync Component** — Provider picker supporting Google Calendar, Apple Calendar (ICS), and Outlook with persistent preference (`CalendarSync.tsx`).
- **Suggested Routines** — Pre-built wellness routines (Desk Reset, Morning Mobility, Box Breathing, Evening Stretch) with one-tap scheduling.
- **Reminder Scheduler** — Daily reminder presets (Morning Stretch, Midday Reset, Posture Check, Wind Down) with custom time selection (`ReminderScheduler.tsx`).
- **Schedule Bottom Sheet** — Reusable date/time/duration picker modal (`ScheduleBottomSheet.tsx`).
- **Scheduled Tasks** — `scheduled_tasks` table with program linking, completion tracking, and duration.
- **ICS File Generation** — Full `.ics` file generation with VALARM reminders, deep link URLs, and proper escaping (`calendarEvent.ts`).
- **Google Calendar URL Builder** — Direct Google Calendar event creation via URL parameters.
- **Outlook Calendar URL Builder** — Direct Outlook web calendar event creation.
- **Native Calendar Integration (iOS/Android)** — Capacitor Calendar plugin (`@ebarooni/capacitor-calendar`) with:
  - iOS 17+ write-only calendar access (`requestWriteOnlyCalendarAccess`)
  - Fallback to full calendar access for pre-iOS 17
  - Native event creation dialog (`createEventWithPrompt`)
  - Detailed console logging for debugging
  - Requires `NSCalendarsWriteOnlyAccessUsageDescription` in Info.plist

### ❤️ Health Data Integration

- **HealthKit / Google Fit** — Native health data via `@capgo/capacitor-health` plugin.
- **Health Service** — Abstracted health data layer (`healthService.ts`) supporting:
  - Daily step count
  - Weekly step history (7-day array)
  - Heart rate (latest reading)
  - Active calories
  - Authorization flow
- **`useHealthData` Hook** — Reactive health data with auto-refresh every 5 minutes, connection state, and simulated data for web preview.
- **Step Tracker Widget** — Animated progress ring with daily step count and weekly bar chart (`StepTracker.tsx`).
- **Metrics Daily Table** — `metrics_daily` table for persisting health snapshots (steps, HRV, resting HR, sleep score) per user per day.

### 🏆 Gamification

- **Welly Points System** — `welly_points` table with total points, current streak, and longest streak per user.
- **Points Ledger** — `welly_points_ledger` table for auditable point transactions with reason, related challenge/event, and admin attribution.
- **Challenges** — `challenges` table with company-scoped challenges, metric types, point awards, and status tracking.
- **Challenge Participants** — `challenge_participants` table with progress value, completion, and winner flags.
- **Rewards Marketplace** — `rewards` table with point costs, inventory limits, and active/inactive state.
- **Reward Redemptions** — `reward_redemptions` table with approval workflow (pending → approved/rejected).
- **Confetti Effect** — Celebratory particle animation on milestones (`ConfettiEffect.tsx`).

### 🏢 Company Administration

- **Company Admin Dashboard** — HR admin portal (`CompanyAdminDashboard.tsx`) for managing:
  - Employee roster and engagement metrics
  - Wellness challenges (create, monitor, close)
  - Company events with attendance codes
  - Reward catalog management
  - Points allocation to employees
- **Super Admin Dashboard** — Platform-wide admin (`SuperAdminDashboard.tsx`) for:
  - Multi-company management
  - Access code generation
  - System-wide analytics
- **Companies Table** — Organization records with branding (logo, accent color), plan status, seat limits, employee access codes, and slug-based URLs.
- **Events System** — `events` table with attendance codes and `event_attendance` tracking.
- **Program Mapping** — `program_mapping` table linking program recommendations to body regions and use-case tags.

### 🧘 Wellness Content

- **Wellness Tips** — Curated tip cards with categories and icons (`WellnessTips.tsx`).
- **Wellness Quotes** — Rotating motivational quotes with author attribution (`WellnessQuotes.tsx`).
- **Breathing Visualizer** — Guided breathwork animation with expanding/contracting circle and phase labels (`BreathingVisualizer.tsx`).
- **Content Data** — Centralized wellness content store (`wellnessContent.ts`).

### 🧭 Navigation & UX

- **Bottom Tab Bar** — Mobile-first navigation with animated active states.
- **NavLink Component** — Reusable navigation link with active state detection (`NavLink.tsx`).
- **Loading Screen** — Branded loading state with animated logo and spinner.
- **Not Found Page** — Custom 404 page (`NotFound.tsx`).
- **Legacy Route Redirects** — `/hr` → `/admin/company`, `/admin` → `/admin/super`.
- **Toast Notifications** — Dual toast system (Radix + Sonner) for success/error/info messages.

### 📱 Mobile & PWA

- **Responsive Design** — Mobile-first layouts with `use-mobile` hook for breakpoint detection.
- **Safe Area Handling** — `safe-bottom` CSS class for iOS home indicator.
- **Capacitor iOS Plugin** — `@capacitor/ios` v8 for native iOS builds.
- **Capacitor Android Plugin** — `@capacitor/android` v8 for native Android builds.

---

*TeamWelly — Move better. Recover smarter. Build resilience.*
