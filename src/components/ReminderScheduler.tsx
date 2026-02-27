import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, X, CalendarIcon, Check } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { addToCalendar, type CalendarProvider, type CalendarEventData } from "@/utils/calendarEvent";

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

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];

const PROVIDER_STORAGE_KEY = "welly_calendar_provider";

function getSavedProvider(): CalendarProvider | null {
  try {
    return localStorage.getItem(PROVIDER_STORAGE_KEY) as CalendarProvider | null;
  } catch { return null; }
}

export default function ReminderScheduler() {
  const { user } = useAuth();
  const [activeReminder, setActiveReminder] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [saving, setSaving] = useState(false);

  const openScheduler = (reminder: ReminderOption) => {
    const now = new Date();
    now.setDate(now.getDate() + (now.getHours() >= reminder.defaultHour ? 1 : 0));
    setSelectedDate(now);
    setSelectedHour(reminder.defaultHour > 12 ? reminder.defaultHour - 12 : reminder.defaultHour === 0 ? 12 : reminder.defaultHour);
    setSelectedMinute(reminder.defaultMinute);
    setAmpm(reminder.defaultHour >= 12 ? "PM" : "AM");
    setActiveReminder(reminder.id);
  };

  const handleSave = async () => {
    if (!user || !selectedDate || !activeReminder) return;
    const reminder = REMINDER_OPTIONS.find(r => r.id === activeReminder)!;
    setSaving(true);

    let hour24 = selectedHour % 12;
    if (ampm === "PM") hour24 += 12;

    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hour24, selectedMinute, 0, 0);

    // Save to scheduled_tasks
    const { error } = await (supabase as any).from("scheduled_tasks").insert({
      user_id: user.id,
      title: reminder.label,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: reminder.durationMinutes,
    });

    if (error) {
      toast({ title: "Error", description: "Could not save reminder.", variant: "destructive" });
      setSaving(false);
      return;
    }

    // Add to calendar
    const provider = getSavedProvider() || "apple";
    const eventData: CalendarEventData = {
      title: reminder.label,
      description: `${reminder.desc} — Open TeamWelly to start your session.`,
      durationMinutes: reminder.durationMinutes,
      startDate: scheduledAt,
    };
    addToCalendar(provider, eventData);

    toast({
      title: "Reminder scheduled! ✅",
      description: `${reminder.label} on ${format(scheduledAt, "MMM d 'at' h:mm a")}`,
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
            onClick={() => openScheduler(reminder)}
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

      {/* Scheduler Bottom Sheet */}
      <AnimatePresence>
        {activeReminder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setActiveReminder(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md glass-strong rounded-t-2xl p-5 safe-bottom"
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">
                    {REMINDER_OPTIONS.find(r => r.id === activeReminder)?.label}
                  </h3>
                  <p className="text-xs text-muted-foreground">Pick a date & time for your reminder</p>
                </div>
                <button onClick={() => setActiveReminder(null)} className="p-1">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Date Picker */}
              <div className="mb-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">📅 Date</p>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={cn(
                      "w-full flex items-center gap-2 p-3 rounded-xl bg-secondary/50 text-left text-sm",
                      !selectedDate && "text-muted-foreground"
                    )}>
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : "Select date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[60]" align="center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Picker */}
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground mb-2">⏰ Time</p>
                <div className="flex items-center gap-2">
                  {/* Hour */}
                  <div className="flex-1 grid grid-cols-4 gap-1">
                    {HOURS.map(h => (
                      <button
                        key={h}
                        onClick={() => setSelectedHour(h)}
                        className={cn(
                          "py-2 rounded-lg text-xs font-medium transition-all",
                          selectedHour === h
                            ? "gradient-primary text-primary-foreground"
                            : "bg-secondary/50 text-foreground hover:bg-secondary/80"
                        )}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                  <span className="text-foreground font-bold">:</span>
                  {/* Minute */}
                  <div className="flex flex-col gap-1">
                    {MINUTES.map(m => (
                      <button
                        key={m}
                        onClick={() => setSelectedMinute(m)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          selectedMinute === m
                            ? "gradient-primary text-primary-foreground"
                            : "bg-secondary/50 text-foreground hover:bg-secondary/80"
                        )}
                      >
                        {m.toString().padStart(2, "0")}
                      </button>
                    ))}
                  </div>
                  {/* AM/PM */}
                  <div className="flex flex-col gap-1">
                    {(["AM", "PM"] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setAmpm(p)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          ampm === p
                            ? "gradient-primary text-primary-foreground"
                            : "bg-secondary/50 text-foreground hover:bg-secondary/80"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={saving || !selectedDate}
                className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                <Check className="w-4 h-4" />
                {saving ? "Saving..." : "Add to Calendar & Tasks"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
