import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronRight, Check, Smartphone, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { addToCalendar, CalendarProvider, type CalendarEventData } from "@/utils/calendarEvent";
import ReminderScheduler from "@/components/ReminderScheduler";

const SUGGESTED_ROUTINES = [
  { name: "5-Min Desk Reset", when: "Every 2 hours during work", emoji: "🖥️", durationMinutes: 5 },
  { name: "Morning Mobility", when: "Daily at 7:30 AM", emoji: "🌅", durationMinutes: 15 },
  { name: "Box Breathing", when: "Before meetings", emoji: "🫁", durationMinutes: 5 },
  { name: "Evening Stretch", when: "After work", emoji: "🌙", durationMinutes: 10 },
];

const CALENDAR_PROVIDERS: { id: CalendarProvider; label: string; emoji: string; desc: string }[] = [
  { id: "google", label: "Google Calendar", emoji: "📅", desc: "Add events directly to Google Calendar" },
  { id: "apple", label: "Apple Calendar", emoji: "🍎", desc: "Download .ics file for Apple Calendar" },
  { id: "outlook", label: "Outlook", emoji: "📧", desc: "Add events to Outlook Calendar" },
];

const PROVIDER_STORAGE_KEY = "welly_calendar_provider";

function getSavedProvider(): CalendarProvider | null {
  try {
    const v = localStorage.getItem(PROVIDER_STORAGE_KEY);
    return v as CalendarProvider | null;
  } catch { return null; }
}

const CalendarSync = () => {
  const [selectedProvider, setSelectedProvider] = useState<CalendarProvider | null>(getSavedProvider);
  const [showProviderPicker, setShowProviderPicker] = useState(false);

  const handlePickProvider = (provider: CalendarProvider) => {
    setSelectedProvider(provider);
    localStorage.setItem(PROVIDER_STORAGE_KEY, provider);
    setShowProviderPicker(false);
    toast({
      title: "Calendar connected! 📅",
      description: `${CALENDAR_PROVIDERS.find(p => p.id === provider)?.label} selected. Your routines will open there.`,
    });
  };

  const handleDisconnect = () => {
    setSelectedProvider(null);
    localStorage.removeItem(PROVIDER_STORAGE_KEY);
    toast({ title: "Disconnected", description: "Calendar provider removed." });
  };

  const handleAddToCalendar = (name: string, durationMinutes = 15) => {
    const provider = selectedProvider || "apple";
    const data: CalendarEventData = {
      title: name,
      description: "Time for your wellness routine! Open TeamWelly to start.",
      durationMinutes,
    };
    addToCalendar(provider, data);
    toast({
      title: "Added to calendar! ✅",
      description: `${name} has been added via ${CALENDAR_PROVIDERS.find(p => p.id === provider)?.label || "download"}.`,
    });
  };

  const connectedProvider = CALENDAR_PROVIDERS.find(p => p.id === selectedProvider);

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
          {connectedProvider ? (
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-wellness-green/20 text-wellness-green text-xs font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> {connectedProvider.label}
              </div>
              <button onClick={handleDisconnect} className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <button onClick={() => setShowProviderPicker(true)} className="px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground text-xs font-medium">
              Connect
            </button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          <Smartphone className="w-3 h-3 inline mr-1" />
          Apple Calendar · Google Calendar · Outlook
        </p>
      </motion.div>

      {/* Provider Picker Modal */}
      <AnimatePresence>
        {showProviderPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowProviderPicker(false)}
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
              <h3 className="font-display text-lg font-bold text-foreground mb-1">Choose Your Calendar</h3>
              <p className="text-xs text-muted-foreground mb-4">Select where you'd like wellness routines to appear</p>
              <div className="space-y-2">
                {CALENDAR_PROVIDERS.map(provider => (
                  <button
                    key={provider.id}
                    onClick={() => handlePickProvider(provider.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-all active:scale-[0.98]"
                  >
                    <span className="text-2xl">{provider.emoji}</span>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-foreground">{provider.label}</p>
                      <p className="text-xs text-muted-foreground">{provider.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowProviderPicker(false)} className="w-full mt-4 py-3 rounded-xl bg-secondary text-muted-foreground text-sm font-medium">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder Settings */}
      <ReminderScheduler />

      {/* Suggested Routines */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-3">💡 Suggested Routines</h3>
        <div className="space-y-2">
          {SUGGESTED_ROUTINES.map(routine => (
            <button
              key={routine.name}
              onClick={() => handleAddToCalendar(routine.name, routine.durationMinutes)}
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
