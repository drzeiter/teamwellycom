import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Flame, Zap, ChevronRight, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, subDays, startOfDay } from "date-fns";
import ScheduleBottomSheet from "@/components/ScheduleBottomSheet";
import { addToCalendar, type CalendarProvider, type CalendarEventData } from "@/utils/calendarEvent";
import { toast } from "@/hooks/use-toast";
import type { Tab } from "@/pages/WellnessLobby";
import logoWhite from "@/assets/logo-white.png";

const RESET_SUGGESTIONS = [
  { name: "5-Min Desk Reset", icon: "🖥️" },
  { name: "5-Min Hip Stretch", icon: "🦴" },
  { name: "5-Min Breathing", icon: "🫁" },
];

interface TodayTabProps {
  firstName: string;
  points: { total_points: number; current_streak: number; longest_streak: number };
  programs: any[];
  navigate: any;
  progressHistory: any[];
  setActiveTab: (tab: Tab) => void;
}

export default function TodayTab({ firstName, points, programs, navigate, progressHistory, setActiveTab }: TodayTabProps) {
  const { user } = useAuth();
  const [scheduledTasks, setScheduledTasks] = useState<any[]>([]);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [showMovementPicker, setShowMovementPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [weeklyData, setWeeklyData] = useState<Record<string, "completed" | "partial" | "missed">>({});

  // Hide Welly FAB when overlays open
  const anyOverlay = showMovementPicker || showScheduler;
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("welly-fab-visibility", { detail: { hidden: anyOverlay } }));
    return () => { window.dispatchEvent(new CustomEvent("welly-fab-visibility", { detail: { hidden: false } })); };
  }, [anyOverlay]);

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      const { data } = await (supabase as any)
        .from("scheduled_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .order("scheduled_at", { ascending: true })
        .limit(5);
      setScheduledTasks(data || []);
    };
    fetchTasks();
  }, [user]);

  // Build weekly heatmap from progress history
  useEffect(() => {
    const map: Record<string, "completed" | "partial" | "missed"> = {};
    for (let i = 6; i >= 0; i--) {
      const day = format(subDays(new Date(), i), "yyyy-MM-dd");
      const dayEntries = progressHistory.filter(p => format(new Date(p.completed_at), "yyyy-MM-dd") === day);
      if (dayEntries.length >= 2) map[day] = "completed";
      else if (dayEntries.length === 1) map[day] = "partial";
      else map[day] = "missed";
    }
    setWeeklyData(map);
  }, [progressHistory]);

  const handleStartNow = () => {
    // Find next scheduled task or default to first quick reset
    const nextTask = scheduledTasks.find(t => t.program_id);
    if (nextTask?.program_id) {
      navigate(`/player/${nextTask.program_id}`);
    } else {
      // Find a desk reset program
      const deskReset = programs.find(p => p.target_area === "Desk" || p.name.toLowerCase().includes("desk"));
      if (deskReset) navigate(`/player/${deskReset.id}`);
      else if (programs.length > 0) navigate(`/player/${programs[0].id}`);
    }
  };

  const handleOpenScheduler = () => {
    setShowMovementPicker(true);
  };

  const MOVEMENT_OPTIONS = [
    { label: "Desk Reset", area: "Desk" },
    { label: "Low Back Reset", area: "Low Back" },
    { label: "Hip Stretch", area: "Hips" },
    { label: "Shoulder Reset", area: "Shoulders" },
    { label: "Neck Reset", area: "Neck" },
    { label: "Breathing Reset", area: "Relax" },
  ];

  const handleSelectMovement = (option: typeof MOVEMENT_OPTIONS[0]) => {
    const matchedProgram = programs.find(p => p.target_area === option.area) || { id: null, name: option.label, duration_minutes: 5 };
    setSelectedMovement({ ...matchedProgram, name: matchedProgram.name || option.label });
    setShowMovementPicker(false);
    setShowScheduler(true);
  };

  const handleScheduleConfirm = async (scheduledAt: Date, durationMinutes: number) => {
    if (!selectedMovement || !user) return;
    setSaving(true);

    await (supabase as any).from("scheduled_tasks").insert({
      user_id: user.id,
      title: selectedMovement.name,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: durationMinutes,
      program_id: selectedMovement.id || null,
    });

    const provider = (localStorage.getItem("welly_calendar_provider") as CalendarProvider) || "apple";
    const eventData: CalendarEventData = {
      title: selectedMovement.name,
      description: `Time for ${selectedMovement.name}! Open TeamWelly to start.`,
      durationMinutes,
      startDate: scheduledAt,
      url: "https://teamwelly.com",
    };
    addToCalendar(provider, eventData);

    toast({ title: "Scheduled! ✅", description: `${selectedMovement.name} on ${format(scheduledAt, "MMM d 'at' h:mm a")}` });
    setSelectedMovement(null);
    setShowScheduler(false);
    setSaving(false);

    // Refresh tasks
    const { data } = await (supabase as any).from("scheduled_tasks").select("*").eq("user_id", user!.id).eq("is_completed", false).order("scheduled_at", { ascending: true }).limit(5);
    setScheduledTasks(data || []);
  };

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="px-5 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoWhite} alt="Welly" className="h-7 w-auto" />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-foreground">{points.total_points}</span>
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, hsl(174 72% 40% / 0.15), hsl(222 40% 12%))" }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/5 -translate-y-8 translate-x-8" />
        <h2 className="font-display text-xl font-bold text-foreground mb-1">Today's Movement Plan</h2>
        <p className="text-sm text-muted-foreground mb-4">Hey {firstName}, here's what's lined up 👋</p>

        <div className="space-y-2 mb-5">
          {RESET_SUGGESTIONS.map((s, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5">
              <span className="text-lg">{s.icon}</span>
              <span className="text-sm text-foreground font-medium">{s.name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleStartNow}
          className="w-full py-3.5 rounded-xl gradient-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2 active:scale-[0.97] transition-transform mb-3"
        >
          <Play className="w-5 h-5" fill="currentColor" /> Start Now
        </button>

        <button
          onClick={handleOpenScheduler}
          className="w-full py-3 rounded-xl border border-border bg-secondary/50 text-foreground font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <Plus className="w-4 h-4" /> Schedule Movement
        </button>
      </motion.div>

      {/* Streak */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-400" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold text-foreground">{points.current_streak}-Day Streak</p>
            <p className="text-xs text-muted-foreground">Best: {points.longest_streak} days</p>
          </div>
        </div>

        {/* Weekly Heatmap */}
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(weeklyData).map(([date, status], i) => {
            const dayOfWeek = new Date(date).getDay();
            const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek];
            const isCurrentDay = isToday(new Date(date));
            return (
              <div key={date} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">{dayName}</span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    status === "completed"
                      ? "bg-wellness-green/20 text-wellness-green border border-wellness-green/30"
                      : status === "partial"
                      ? "bg-wellness-gold/20 text-wellness-gold border border-wellness-gold/30"
                      : "bg-secondary text-muted-foreground border border-border/50"
                  } ${isCurrentDay ? "ring-2 ring-primary/40" : ""}`}
                >
                  {status === "completed" ? "✓" : status === "partial" ? "·" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Scheduled Tasks */}
      {scheduledTasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">Upcoming</h3>
          </div>
          <div className="space-y-2">
            {scheduledTasks.slice(0, 3).map((task, i) => (
              <div key={task.id} className="glass rounded-xl p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-sm shrink-0">📅</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(task.scheduled_at), "MMM d, h:mm a")} · {task.duration_minutes}m</p>
                </div>
                {task.program_id && (
                  <button onClick={() => navigate(`/player/${task.program_id}`)} className="text-xs font-medium px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground active:scale-95 transition-transform">
                    <Play className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Access */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <button
          onClick={() => setActiveTab("resets")}
          className="w-full glass rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-xl">⚡</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-base">Quick Reset</h3>
            <p className="text-xs text-muted-foreground">5-minute guided sessions</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.div>

      {/* Movement Picker Modal */}
      <AnimatePresence>
        {showMovementPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowMovementPicker(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} onClick={e => e.stopPropagation()} className="w-full max-w-md glass-strong rounded-t-2xl p-5 safe-bottom">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-1">Choose Movement</h3>
              <p className="text-xs text-muted-foreground mb-4">Select what you'd like to schedule</p>
              <div className="space-y-2">
                {MOVEMENT_OPTIONS.map(opt => (
                  <button key={opt.label} onClick={() => handleSelectMovement(opt)} className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-all active:scale-[0.98]">
                    <span className="text-xl">🏃</span>
                    <span className="text-sm font-medium text-foreground flex-1 text-left">{opt.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowMovementPicker(false)} className="w-full mt-4 py-3 rounded-xl bg-secondary text-muted-foreground text-sm font-medium">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Bottom Sheet */}
      <ScheduleBottomSheet
        open={showScheduler}
        onClose={() => { setShowScheduler(false); setSelectedMovement(null); }}
        title={selectedMovement?.name || ""}
        subtitle="Pick a date & time"
        defaultHour={9}
        defaultMinute={0}
        defaultDurationMinutes={selectedMovement?.duration_minutes ?? 5}
        onConfirm={handleScheduleConfirm}
        saving={saving}
      />
    </div>
  );
}
