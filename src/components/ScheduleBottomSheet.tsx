import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CalendarIcon, Check, Clock } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];

export interface ScheduleBottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  /** Called with the chosen date/time and duration */
  onConfirm: (scheduledAt: Date, durationMinutes: number) => void;
  /** Default duration in minutes */
  defaultDurationMinutes?: number;
  /** Default hour (24h) for initial selection */
  defaultHour?: number;
  /** Default minute for initial selection */
  defaultMinute?: number;
  saving?: boolean;
}

export default function ScheduleBottomSheet({
  open,
  onClose,
  title,
  subtitle = "Pick a date & time for your reminder",
  onConfirm,
  defaultDurationMinutes = 10,
  defaultHour = 8,
  defaultMinute = 0,
  saving = false,
}: ScheduleBottomSheetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => new Date());
  const [selectedHour, setSelectedHour] = useState(() => {
    const h = defaultHour > 12 ? defaultHour - 12 : defaultHour === 0 ? 12 : defaultHour;
    return h;
  });
  const [selectedMinute, setSelectedMinute] = useState(defaultMinute);
  const [ampm, setAmpm] = useState<"AM" | "PM">(defaultHour >= 12 ? "PM" : "AM");

  const handleConfirm = () => {
    if (!selectedDate) return;
    let hour24 = selectedHour % 12;
    if (ampm === "PM") hour24 += 12;
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hour24, selectedMinute, 0, 0);
    onConfirm(scheduledAt, defaultDurationMinutes);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md glass-strong rounded-t-2xl p-5 safe-bottom"
          >
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
              <button onClick={onClose} className="p-1">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Date Picker */}
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">📅 Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center gap-2 p-3 rounded-xl bg-secondary/50 text-left text-sm",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
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
                  {HOURS.map((h) => (
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
                  {MINUTES.map((m) => (
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
                  {(["AM", "PM"] as const).map((p) => (
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
              onClick={handleConfirm}
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
  );
}
