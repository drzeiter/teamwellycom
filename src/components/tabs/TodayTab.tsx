import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Flame, Zap, ChevronRight, Calendar, CheckCircle2, Circle, ExternalLink, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, subDays } from "date-fns";
import ScheduleBottomSheet from "@/components/ScheduleBottomSheet";
import { addToCalendar, type CalendarProvider, type CalendarEventData } from "@/utils/calendarEvent";
import { toast } from "@/hooks/use-toast";
import type { Tab } from "@/pages/WellnessLobby";
import WellyScoreRing from "@/components/dashboard/WellyScoreRing";
import logoWhite from "@/assets/logo-white.png";

/* ─── Daily motivational messages ─── */
const DAILY_MESSAGES = [
  "Consistency builds strength.",
  "Small movement beats no movement.",
  "Show up for yourself today.",
  "Progress happens one rep at a time.",
  "Your body will thank you later.",
  "Move a little, feel a lot better.",
  "Every stretch counts.",
];

/* ─── Today's recommended sessions ─── */
const TODAY_PLAN = [
  { key: "desk", name: "5-Min Desk Reset", icon: "🖥️" },
  { key: "hip", name: "5-Min Hip Stretch", icon: "🦴" },
  { key: "breathing", name: "5-Min Breathing", icon: "🫁" },
];

/* ─── Movement scheduler options ─── */
const MOVEMENT_OPTIONS = [
  { label: "Desk Reset", area: "Desk" },
  { label: "Low Back Reset", area: "Low Back" },
  { label: "Hip Stretch", area: "Hips" },
  { label: "Shoulder Reset", area: "Shoulders" },
  { label: "Neck Reset", area: "Neck" },
  { label: "Breathing Reset", area: "Relax" },
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
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  // Daily motivational message (rotates by day)
  const dailyMessage = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_MESSAGES[dayOfYear % DAILY_MESSAGES.length];
  }, []);

  // Welly Score calculation
  const wellyScore = useMemo(() => {
    const todayCompleted = progressHistory.filter(p => isToday(new Date(p.completed_at))).length;
    const movementScore = Math.min(todayCompleted * 15, 40); // 40% weight
    const streakScore = Math.min(points.current_streak * 5, 30); // 30% weight
    const programScore = Math.min(progressHistory.length * 2, 20); // 20% weight
    const scanScore = 10; // 10% base (placeholder)
    return Math.min(movementScore + streakScore + programScore + scanScore, 100);
  }, [progressHistory, points.current_streak]);

  const scoreMessage = useMemo(() => {
    if (wellyScore >= 80) return "You're staying consistent this week. Keep it up! 🎉";
    if (wellyScore >= 50) return "Good progress — keep moving to boost your score.";
    return "Start a quick reset to get your score climbing.";
  }, [wellyScore]);

  // Hide FAB when overlays open
  const anyOverlay = showMovementPicker || showScheduler || showScoreInfo;
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("welly-fab-visibility", { detail: { hidden: anyOverlay } }));
    return () => { window.dispatchEvent(new CustomEvent("welly-fab-visibility", { detail: { hidden: false } })); };
  }, [anyOverlay]);

  // Fetch scheduled tasks
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

  // Build weekly heatmap
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

  // Seed checklist from today's progress
  useEffect(() => {
    const todayEntries = progressHistory.filter(p => isToday(new Date(p.completed_at)));
    const checked: Record<string, boolean> = {};
    TODAY_PLAN.forEach(item => {
      checked[item.key] = todayEntries.some(e => e.program_id && item.name.toLowerCase().includes("desk")); // simple heuristic
    });
    setCheckedItems(checked);
  }, [progressHistory]);

  const handleStartNow = () => {
    const nextTask = scheduledTasks.find(t => t.program_id);
    if (nextTask?.program_id) {
      navigate(`/player/${nextTask.program_id}`);
    } else {
      const deskReset = programs.find(p => p.target_area === "Desk" || p.name.toLowerCase().includes("desk"));
      if (deskReset) navigate(`/player/${deskReset.id}`);
      else if (programs.length > 0) navigate(`/player/${programs[0].id}`);
    }
  };

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

    const { data } = await (supabase as any).from("scheduled_tasks").select("*").eq("user_id", user!.id).eq("is_completed", false).order("scheduled_at", { ascending: true }).limit(5);
    setScheduledTasks(data || []);
  };

  const toggleChecklist = (key: string) => {
    setCheckedItems(prev => {
      const next = { ...prev, [key]: !prev[key] };
      if (!prev[key]) {
        toast({ title: "Nice work! 🎉", description: "+5 Welly Points earned" });
      }
      return next;
    });
  };

  // Deduplicate and group scheduled tasks by title + time
  const groupedTasks = useMemo(() => {
    const groups = new Map<string, { task: any; count: number }>();
    (scheduledTasks || []).forEach(t => {
      const key = `${t.title}-${format(new Date(t.scheduled_at), "yyyy-MM-dd HH:mm")}`;
      if (groups.has(key)) {
        groups.get(key)!.count++;
      } else {
        groups.set(key, { task: t, count: 1 });
      }
    });
    return Array.from(groups.values()).slice(0, 3);
  }, [scheduledTasks]);

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="px-5 pt-6 pb-4 space-y-7" variants={stagger} initial="hidden" animate="show">

      {/* ─── Section 1: Greeting ─── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Hey, {firstName} 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{dailyMessage}</p>
        </div>
        <button onClick={() => setActiveTab("profile")} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary active:scale-95 transition-transform">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-bold text-foreground">{points.total_points}</span>
        </button>
      </motion.div>

      {/* ─── Section 2: Welly Score Ring ─── */}
      <motion.div variants={fadeUp} className="flex justify-center py-2">
        <WellyScoreRing score={wellyScore} message={scoreMessage} onInfoTap={() => setShowScoreInfo(true)} />
      </motion.div>

      {/* ─── Section 3: Today's Movement Plan ─── */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, hsl(222 40% 12%), hsl(222 40% 8%))" }}
      >
        <h2 className="font-display text-base font-bold text-foreground mb-3">Today's Movement Plan</h2>
        <div className="space-y-2 mb-4">
          {TODAY_PLAN.map(s => (
            <div key={s.key} className="flex items-center gap-3 py-1">
              <span className="text-lg">{s.icon}</span>
              <span className="text-sm text-foreground font-medium">{s.name}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleStartNow}
          className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform mb-2.5"
        >
          <Play className="w-4 h-4" fill="currentColor" /> Start Now
        </button>
        <button
          onClick={() => setShowMovementPicker(true)}
          className="w-full py-2.5 rounded-xl border border-border bg-secondary/50 text-foreground font-medium text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <Plus className="w-4 h-4" /> Schedule Movement
        </button>
      </motion.div>

      {/* ─── Section 4: Daily Progress Checklist ─── */}
      <motion.div variants={fadeUp}>
        <h3 className="font-display text-sm font-bold text-foreground mb-3">Today's Progress</h3>
        <div className="space-y-2">
          {TODAY_PLAN.map(item => {
            const done = checkedItems[item.key];
            return (
              <button
                key={item.key}
                onClick={() => toggleChecklist(item.key)}
                className={`w-full glass rounded-xl p-3.5 flex items-center gap-3 transition-all active:scale-[0.98] ${done ? "border-primary/30" : ""}`}
              >
                <motion.div
                  initial={false}
                  animate={done ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {done ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground" />
                  )}
                </motion.div>
                <span className={`text-sm font-medium flex-1 text-left ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                  {item.name}
                </span>
                {done && <span className="text-xs text-primary font-semibold">+5</span>}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Section 5: Streak + Heatmap ─── */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="font-display text-xl font-bold text-foreground">{points.current_streak}-Day Streak</p>
            <p className="text-[11px] text-muted-foreground">Best: {points.longest_streak} days</p>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(weeklyData).map(([date, status]) => {
            const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(date).getDay()];
            const isCurrent = isToday(new Date(date));
            return (
              <div key={date} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">{dayName}</span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                    status === "completed"
                      ? "bg-primary/15 text-primary border border-primary/25"
                      : status === "partial"
                      ? "bg-wellness-gold/15 text-wellness-gold border border-wellness-gold/25"
                      : "bg-secondary text-muted-foreground border border-border/40"
                  } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
                >
                  {status === "completed" ? "✓" : status === "partial" ? "·" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Section 6: Upcoming Schedule ─── */}
      {groupedTasks.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h3 className="font-display text-sm font-bold text-foreground">Upcoming</h3>
          </div>
          <div className="space-y-2">
            {groupedTasks.map(({ task, count }) => (
              <div key={task.id} className="glass rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center text-sm shrink-0">📅</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {count > 1 ? `${count} Movements Scheduled` : task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{format(new Date(task.scheduled_at), "MMM d, h:mm a")} · {task.duration_minutes}m</p>
                </div>
                {task.program_id && (
                  <button onClick={() => navigate(`/player/${task.program_id}`)} className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center active:scale-95 transition-transform">
                    <Play className="w-3.5 h-3.5 text-primary-foreground" fill="currentColor" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ─── Section 7: Quick Reset Access ─── */}
      <motion.div variants={fadeUp}>
        <button
          onClick={() => setActiveTab("resets")}
          className="w-full glass rounded-2xl p-5 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
        >
          <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-xl">⚡</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-foreground text-sm">Quick Reset</h3>
            <p className="text-xs text-muted-foreground">Need relief now? Start a 5-min session.</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </motion.div>

      {/* ─── Movement Picker Modal ─── */}
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

      {/* ─── Score Info Modal ─── */}
      <AnimatePresence>
        {showScoreInfo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowScoreInfo(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-sm glass-strong rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-foreground">Understanding Your Stats</h3>
                <button onClick={() => setShowScoreInfo(false)} className="p-1 rounded-full bg-secondary"><X className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">🎯 Welly Score</p>
                  <p className="text-xs text-muted-foreground">Measures your daily movement consistency. Complete sessions, maintain streaks, follow programs, and do scans to improve it.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">⚡ Lifetime Points</p>
                  <p className="text-xs text-muted-foreground">Tracks all completed sessions and activities over time. Points accumulate and never reset.</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">🔥 Streak</p>
                  <p className="text-xs text-muted-foreground">Tracks consecutive days of movement. Keep moving daily to grow your streak!</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Schedule Bottom Sheet ─── */}
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
    </motion.div>
  );
}
