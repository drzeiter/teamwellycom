import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Bell, Clock, ChevronRight, Check, Smartphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const REMINDER_OPTIONS = [
  { id: "morning", label: "Morning Stretch", time: "8:00 AM", desc: "Start the day with mobility" },
  { id: "midday", label: "Midday Reset", time: "12:30 PM", desc: "Beat the afternoon slump" },
  { id: "afternoon", label: "Posture Check", time: "3:00 PM", desc: "Realign after sitting" },
  { id: "evening", label: "Wind Down", time: "7:00 PM", desc: "Breathwork before bed" },
];

const SUGGESTED_ROUTINES = [
  { name: "5-Min Desk Reset", when: "Every 2 hours during work", emoji: "🖥️" },
  { name: "Morning Mobility", when: "Daily at 7:30 AM", emoji: "🌅" },
  { name: "Box Breathing", when: "Before meetings", emoji: "🫁" },
  { name: "Evening Stretch", when: "After work", emoji: "🌙" },
];

const CalendarSync = () => {
  const [enabledReminders, setEnabledReminders] = useState<string[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);

  const toggleReminder = (id: string) => {
    setEnabledReminders(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleCalendarSync = () => {
    setCalendarConnected(true);
    toast({
      title: "Calendar synced! 📅",
      description: "Your wellness routines will appear in your calendar.",
    });
  };

  const handleAddToCalendar = (name: string) => {
    // Generate .ics download for the routine
    const event = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${name} - TeamWelly`,
      `DTSTART:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DURATION:PT15M`,
      `DESCRIPTION:Time for your wellness routine! Open TeamWelly to start.`,
      "RRULE:FREQ=DAILY",
      "BEGIN:VALARM",
      "TRIGGER:-PT5M",
      "ACTION:DISPLAY",
      `DESCRIPTION:${name} starting soon`,
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([event], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "-").toLowerCase()}.ics`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Added to calendar! ✅",
      description: `${name} has been downloaded as an .ics file.`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Calendar Sync Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-foreground text-sm">Sync to Calendar</h3>
            <p className="text-xs text-muted-foreground">Add routines to your phone calendar</p>
          </div>
          {calendarConnected ? (
            <div className="px-3 py-1 rounded-full bg-wellness-green/20 text-wellness-green text-xs font-medium flex items-center gap-1">
              <Check className="w-3 h-3" /> Synced
            </div>
          ) : (
            <button onClick={handleCalendarSync} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-medium">
              Connect
            </button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          <Smartphone className="w-3 h-3 inline mr-1" />
          Apple Calendar · Google Calendar · Outlook
        </p>
      </motion.div>

      {/* Reminder Settings */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground text-sm">Daily Reminders</h3>
        </div>
        <div className="space-y-2">
          {REMINDER_OPTIONS.map(reminder => (
            <button
              key={reminder.id}
              onClick={() => toggleReminder(reminder.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                enabledReminders.includes(reminder.id)
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary/50 border border-transparent"
              }`}
            >
              <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{reminder.label}</p>
                <p className="text-xs text-muted-foreground">{reminder.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">{reminder.time}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                enabledReminders.includes(reminder.id)
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              }`}>
                {enabledReminders.includes(reminder.id) && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Routines */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-3">💡 Suggested Routines</h3>
        <div className="space-y-2">
          {SUGGESTED_ROUTINES.map(routine => (
            <button
              key={routine.name}
              onClick={() => handleAddToCalendar(routine.name)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-all"
            >
              <span className="text-lg">{routine.emoji}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{routine.name}</p>
                <p className="text-xs text-muted-foreground">{routine.when}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarSync;
