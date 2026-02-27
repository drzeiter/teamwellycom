import { useState } from "react";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { addToCalendar, type CalendarProvider, type CalendarEventData } from "@/utils/calendarEvent";
import ScheduleBottomSheet from "@/components/ScheduleBottomSheet";

interface ReminderOption {
  id: string;
  label: string;
  desc: string;
  defaultHour: number;
  defaultMinute: number;
  durationMinutes: number;
}

const REMINDER_OPTIONS: ReminderOption[] = [
  { id: "morning", label: "Morning Stretch", desc: "Start the day with mobility", defaultHour: 8, defaultMinute: 0, durationMinutes: 10 },
  { id: "midday", label: "Midday Reset", desc: "Beat the afternoon slump", defaultHour: 12, defaultMinute: 30, durationMinutes: 10 },
  { id: "afternoon", label: "Posture Check", desc: "Realign after sitting", defaultHour: 15, defaultMinute: 0, durationMinutes: 5 },
  { id: "evening", label: "Wind Down", desc: "Breathwork before bed", defaultHour: 19, defaultMinute: 0, durationMinutes: 10 },
];

const PROVIDER_STORAGE_KEY = "welly_calendar_provider";

function getSavedProvider(): CalendarProvider | null {
  try {
    return localStorage.getItem(PROVIDER_STORAGE_KEY) as CalendarProvider | null;
  } catch { return null; }
}

export default function ReminderScheduler() {
  const { user } = useAuth();
  const [activeReminder, setActiveReminder] = useState<ReminderOption | null>(null);
  const [saving, setSaving] = useState(false);

  const handleConfirm = async (scheduledAt: Date, durationMinutes: number) => {
    if (!user || !activeReminder) return;
    setSaving(true);

    const { error } = await (supabase as any).from("scheduled_tasks").insert({
      user_id: user.id,
      title: activeReminder.label,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: durationMinutes,
    });

    if (error) {
      toast({ title: "Error", description: "Could not save reminder.", variant: "destructive" });
      setSaving(false);
      return;
    }

    const provider = getSavedProvider() || "apple";
    const eventData: CalendarEventData = {
      title: activeReminder.label,
      description: `${activeReminder.desc} — Open TeamWelly to start your session.`,
      durationMinutes,
      startDate: scheduledAt,
      url: "https://teamwellycom.lovable.app",
    };
    addToCalendar(provider, eventData);

    toast({
      title: "Reminder scheduled! ✅",
      description: `${activeReminder.label} on ${format(scheduledAt, "MMM d 'at' h:mm a")}`,
    });

    setActiveReminder(null);
    setSaving(false);
  };

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-primary" />
        <h3 className="font-display font-semibold text-foreground text-sm">Daily Reminders</h3>
      </div>
      <div className="space-y-2">
        {REMINDER_OPTIONS.map(reminder => (
          <button
            key={reminder.id}
            onClick={() => setActiveReminder(reminder)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-transparent hover:bg-secondary/80 transition-all"
          >
            <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-foreground">{reminder.label}</p>
              <p className="text-xs text-muted-foreground">{reminder.desc}</p>
            </div>
            <span className="text-xs text-primary font-medium">Schedule →</span>
          </button>
        ))}
      </div>

      <ScheduleBottomSheet
        open={!!activeReminder}
        onClose={() => setActiveReminder(null)}
        title={activeReminder?.label || ""}
        subtitle="Pick a date & time for your reminder"
        defaultHour={activeReminder?.defaultHour ?? 8}
        defaultMinute={activeReminder?.defaultMinute ?? 0}
        defaultDurationMinutes={activeReminder?.durationMinutes ?? 10}
        onConfirm={handleConfirm}
        saving={saving}
      />
    </div>
  );
}
