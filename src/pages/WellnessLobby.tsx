import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Activity, ChevronRight, Play, LogOut,
  Footprints, Calendar, Settings,
  LayoutGrid, Heart, Moon, TrendingUp, Sparkles,
} from "lucide-react";
import StepTracker from "@/components/StepTracker";
import CalendarSync from "@/components/CalendarSync";
import { useHealthData } from "@/hooks/useHealthData";
import logoWhite from "@/assets/logo-white.png";
import MyPlan from "@/components/MyPlan";

interface WellyPointsData {
  total_points: number;
  current_streak: number;
  longest_streak: number;
}

interface Program {
  id: string;
  name: string;
  category: string;
  category_type: string;
  duration_minutes: number;
  exercise_count: number;
  difficulty: string;
  target_area: string;
  description: string | null;
  icon: string | null;
  duration_weeks: number | null;
  region: string | null;
}

interface ProgressEntry {
  completed_at: string;
  points_earned: number | null;
  program_id: string;
}

const AREA_ICONS: Record<string, string> = {
  "Low Back": "🔻", "Hips": "🦴", "Shoulders": "💪", "Neck": "🦒",
  "Foot/Ankle": "🦶", "Knee": "🦵", "Thoracic Spine": "🔄", "Hamstrings": "🦿",
  "Glutes": "🍑", "Desk": "🖥️", "Full Body": "🧘", "Warm-Up": "🔥", "Relax": "🫁",
};

type Tab = "home" | "programs" | "plan" | "steps" | "more";

// ─── AI INSIGHT ENGINE ────────────────────────────────────
const getInsight = (streak: number, completedCount: number, hour: number) => {
  if (streak >= 7) return { title: "Exceptional Consistency", subtitle: "Your body is adapting beautifully. Keep this momentum.", gradient: "from-emerald-500/20 via-teal-500/10 to-transparent" };
  if (streak >= 3) return { title: "Building Strong Habits", subtitle: "Three days in a row. Your recovery is accelerating.", gradient: "from-sky-500/20 via-cyan-500/10 to-transparent" };
  if (completedCount > 10) return { title: "High Readiness Today", subtitle: "Your body has recovered well. A great day for movement.", gradient: "from-violet-500/15 via-purple-500/10 to-transparent" };
  if (hour < 12) return { title: "Fresh Morning Energy", subtitle: "Your readiness is high. An ideal time for your reset.", gradient: "from-amber-500/15 via-orange-500/10 to-transparent" };
  if (hour < 17) return { title: "Afternoon Recovery Window", subtitle: "Combat the midday slump with targeted movement.", gradient: "from-sky-500/15 via-blue-500/10 to-transparent" };
  return { title: "Evening Wind-Down", subtitle: "Gentle movement now supports deeper sleep tonight.", gradient: "from-indigo-500/15 via-purple-500/10 to-transparent" };
};

const WellnessLobby = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState<WellyPointsData>({ total_points: 0, current_streak: 0, longest_streak: 0 });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  const health = useHealthData();

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [pointsRes, programsRes, profileRes, progressRes] = await Promise.all([
        supabase.from("welly_points").select("*").eq("user_id", user.id).single(),
        supabase.from("programs").select("*").order("sort_order"),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase.from("user_progress").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(20),
      ]);
      if (pointsRes.data) setPoints(pointsRes.data);
      if (programsRes.data) setPrograms(programsRes.data as Program[]);
      if (profileRes.data) setDisplayName(profileRes.data.display_name || "");
      if (progressRes.data) {
        setProgressHistory(progressRes.data);
        setCompletedCount(progressRes.data.length);
      }
    };
    fetchData();
  }, [user]);

  const twelveWeekPrograms = programs.filter(p => (p.duration_weeks || 0) >= 12);
  const quickContent = programs.filter(p => (p.duration_weeks || 0) < 12);

  const firstName = displayName?.split(" ")[0] || "there";

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <HomeTab {...{ firstName, points, programs: quickContent, twelveWeekPrograms, navigate, completedCount, signOut, dailySteps: health.dailySteps, setActiveTab }} />;
      case "programs": return <ProgramsTab {...{ programs: quickContent, twelveWeekPrograms, navigate }} />;
      case "plan": return <PlanTab />;
      case "steps": return <StepsTab {...{ dailySteps: health.dailySteps, weeklySteps: health.weeklySteps, points, health, progressHistory, programs: [...quickContent, ...twelveWeekPrograms] }} />;
      case "more": return <MoreTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav — refined */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-2xl border-t border-border/30 safe-bottom z-40">
        <div className="flex items-center justify-around py-3 max-w-lg mx-auto">
          <NavItem icon={<Sparkles className="w-5 h-5" />} label="Today" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <NavItem icon={<LayoutGrid className="w-5 h-5" />} label="Programs" active={activeTab === "programs"} onClick={() => setActiveTab("programs")} />
          <NavItem icon={<Activity className="w-5 h-5" />} label="Activity" active={activeTab === "steps"} onClick={() => setActiveTab("steps")} />
          <NavItem icon={<Calendar className="w-5 h-5" />} label="Plan" active={activeTab === "plan"} onClick={() => setActiveTab("plan")} />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === "more"} onClick={() => setActiveTab("more")} />
        </div>
      </div>
    </div>
  );
};

// ─── HOME TAB — Oura-inspired ────────────────────────────────────
const HomeTab = ({ firstName, points, programs, twelveWeekPrograms, navigate, completedCount, signOut, dailySteps, setActiveTab }: any) => {
  const hour = new Date().getHours();
  const insight = getInsight(points.current_streak, completedCount, hour);

  // Compute a simple "Welly Score" from streak + completed + steps
  const wellyScore = useMemo(() => {
    const streakScore = Math.min(points.current_streak * 5, 30);
    const completionScore = Math.min(completedCount * 2, 40);
    const stepScore = Math.min(Math.round((dailySteps / 10000) * 30), 30);
    return Math.min(streakScore + completionScore + stepScore, 100) || 42;
  }, [points.current_streak, completedCount, dailySteps]);

  const recoveryPct = Math.min(Math.round(wellyScore * 0.9 + 8), 100);
  const mobilityPct = Math.min(Math.round(wellyScore * 0.75 + 15), 100);
  const stressPct = Math.max(100 - wellyScore, 15);

  const deskProgram = programs.find((p: Program) => p.target_area === "Desk" && p.duration_minutes === 5);
  const quickResets = programs.filter((p: Program) => p.category_type === "quick_reset").slice(0, 4);

  return (
    <div className="max-w-lg mx-auto">
      {/* Minimal Header */}
      <div className="px-6 pt-8 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoWhite} alt="Team Welly" className="h-7 w-auto opacity-80" />
        </div>
        <button onClick={signOut} className="w-8 h-8 rounded-full bg-secondary/40 flex items-center justify-center">
          <LogOut className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Daily State Header — Emotional anchor */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-6 pt-4 pb-6"
      >
        <p className="text-muted-foreground text-sm mb-1">Good {hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening"}, {firstName}</p>
        <div className={`relative rounded-3xl p-6 overflow-hidden bg-gradient-to-br ${insight.gradient}`}>
          {/* Subtle animated glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10">
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">{insight.title}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{insight.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Core Welly Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="px-6 pb-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Ring background */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="6" opacity="0.3" />
              <motion.circle
                cx="60" cy="60" r="52" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 52}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - wellyScore / 100) }}
                transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
              />
            </svg>
            <div className="text-center z-10">
              <motion.p
                className="font-display text-4xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {wellyScore}
              </motion.p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Welly Score</p>
            </div>
          </div>
        </div>

        {/* Sub-metrics */}
        <div className="flex items-center justify-center gap-8">
          <ScoreRing label="Recovery" value={recoveryPct} color="hsl(var(--wellness-green))" />
          <ScoreRing label="Mobility" value={mobilityPct} color="hsl(var(--primary))" />
          <ScoreRing label="Stress" value={stressPct} color="hsl(var(--wellness-coral))" inverted />
        </div>
      </motion.div>

      {/* Today's Primary Action */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="px-6 pb-6"
      >
        <button
          onClick={() => {
            if (deskProgram) navigate(`/player/${deskProgram.id}`);
            else if (quickResets.length > 0) navigate(`/player/${quickResets[0].id}`);
          }}
          className="w-full text-left group"
        >
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/10 p-6 transition-all group-hover:border-primary/20 group-active:scale-[0.99]">
            <p className="text-[10px] text-primary uppercase tracking-widest font-semibold mb-2">Today's Reset</p>
            <h3 className="font-display text-xl font-bold text-foreground mb-1">5-Min Desk Reset</h3>
            <p className="text-sm text-muted-foreground mb-4">Quick relief designed for your body after sitting</p>
            <div className="flex items-center gap-2 text-primary text-sm font-medium">
              <Play className="w-4 h-4" />
              Start Now
            </div>
          </div>
        </button>
      </motion.div>

      {/* Metrics Strip — horizontal scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="px-6 pb-8"
      >
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
          <MetricCard icon={<Heart className="w-4 h-4" />} label="Heart Rate" value="--" unit="bpm" sparkColor="hsl(var(--wellness-coral))" />
          <MetricCard icon={<Moon className="w-4 h-4" />} label="Sleep" value="--" unit="hrs" sparkColor="hsl(var(--wellness-purple))" />
          <MetricCard icon={<Footprints className="w-4 h-4" />} label="Steps" value={dailySteps > 0 ? (dailySteps / 1000).toFixed(1) + "k" : "--"} unit="" sparkColor="hsl(var(--primary))" />
          <MetricCard icon={<TrendingUp className="w-4 h-4" />} label="HRV" value="--" unit="ms" sparkColor="hsl(var(--wellness-green))" />
        </div>
      </motion.div>

      {/* Quick Resets — clean cards */}
      {quickResets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="px-6 pb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-semibold text-foreground tracking-wide">Quick Resets</h3>
            <button onClick={() => setActiveTab("programs")} className="text-xs text-muted-foreground hover:text-primary transition-colors">See all</button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickResets.map((program: Program, i: number) => (
              <motion.button
                key={program.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                onClick={() => navigate(`/player/${program.id}`)}
                className="rounded-2xl bg-secondary/30 border border-border/30 p-4 text-left hover:bg-secondary/50 transition-all active:scale-[0.98]"
              >
                <span className="text-lg mb-2 block">{AREA_ICONS[program.target_area] || "🏋️"}</span>
                <h4 className="font-display font-semibold text-foreground text-xs leading-tight">{program.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-1">{program.duration_minutes} min</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 12-Week Programs — refined */}
      {twelveWeekPrograms.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="px-6 pb-8"
        >
          <h3 className="font-display text-sm font-semibold text-foreground tracking-wide mb-4">12-Week Programs</h3>
          <div className="space-y-3">
            {twelveWeekPrograms.slice(0, 3).map((program: Program, i: number) => (
              <motion.button
                key={program.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                onClick={() => navigate(`/program/${program.id}`)}
                className="w-full rounded-2xl bg-secondary/20 border border-border/20 p-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-all active:scale-[0.99]"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                  {AREA_ICONS[program.target_area] || "🏋️"}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-semibold text-foreground text-sm truncate">{program.name}</h4>
                  <p className="text-muted-foreground text-xs mt-0.5">{program.target_area} · Progressive</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ─── Score Ring Sub-component ────────────────────────────────
const ScoreRing = ({ label, value, color, inverted }: { label: string; value: number; color: string; inverted?: boolean }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r="22" fill="none" stroke="hsl(var(--border))" strokeWidth="3" opacity="0.2" />
        <motion.circle
          cx="28" cy="28" r="22" fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 22}`}
          initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
          animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - value / 100) }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
        />
      </svg>
      <span className="font-display text-sm font-bold text-foreground z-10">{value}</span>
    </div>
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </div>
);

// ─── Metric Card ────────────────────────────────
const MetricCard = ({ icon, label, value, unit, sparkColor }: { icon: React.ReactNode; label: string; value: string; unit: string; sparkColor: string }) => (
  <div className="min-w-[120px] rounded-2xl bg-secondary/20 border border-border/20 p-4 flex flex-col gap-2 shrink-0">
    <div className="flex items-center gap-1.5" style={{ color: sparkColor }}>
      {icon}
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="font-display text-xl font-bold text-foreground">{value}</span>
      {unit && <span className="text-[10px] text-muted-foreground">{unit}</span>}
    </div>
    {/* Mini sparkline placeholder */}
    <div className="h-4 flex items-end gap-[2px]">
      {[0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.6].map((h, i) => (
        <div key={i} className="flex-1 rounded-sm opacity-30" style={{ height: `${h * 100}%`, backgroundColor: sparkColor }} />
      ))}
    </div>
  </div>
);

// ─── PROGRAMS TAB ────────────────────────────────────
const ProgramsTab = ({ programs, twelveWeekPrograms, navigate }: any) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const categories = ["all", ...new Set(programs.map((p: Program) => p.target_area))];
  const filtered = selectedCategory === "all" ? programs : programs.filter((p: Program) => p.target_area === selectedCategory);
  const quickResets = filtered.filter((p: Program) => p.category_type === "quick_reset" && p.target_area !== "Relax");
  const relaxPrograms = filtered.filter((p: Program) => p.target_area === "Relax");

  return (
    <div className="max-w-lg mx-auto pt-8">
      <div className="px-6 mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Programs</h1>
        <p className="text-muted-foreground text-sm mt-1">{programs.length + twelveWeekPrograms.length} available</p>
      </div>

      {/* 12-Week Programs */}
      {twelveWeekPrograms.length > 0 && (
        <div className="px-6 mb-8">
          <h2 className="font-display text-sm font-semibold text-foreground tracking-wide mb-4">12-Week Progressive</h2>
          <div className="grid grid-cols-2 gap-3">
            {twelveWeekPrograms.map((program: Program) => (
              <motion.button
                key={program.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/program/${program.id}`)}
                className="rounded-2xl bg-secondary/20 border border-border/20 p-4 text-left hover:bg-secondary/30 transition-all"
              >
                <div className="text-2xl mb-2">{AREA_ICONS[program.target_area] || "🏋️"}</div>
                <h4 className="font-display font-semibold text-foreground text-xs leading-tight">{program.name.replace("12-Week ", "")}</h4>
                <p className="text-[10px] text-muted-foreground mt-1">12 weeks</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="px-6 mb-6">
        <div className="h-px bg-border/30" />
      </div>

      {/* Category Filter */}
      <div className="px-6 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat: string) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary/30 text-muted-foreground"}`}
            >{cat === "all" ? "All" : cat}</button>
          ))}
        </div>
      </div>

      {relaxPrograms.length > 0 && <ProgramSection title="Breathwork & Relax" programs={relaxPrograms} onSelect={(id: string) => navigate(`/player/${id}`)} />}
      {quickResets.length > 0 && <ProgramSection title="Quick Resets" programs={quickResets} onSelect={(id: string) => navigate(`/player/${id}`)} />}
    </div>
  );
};

// ─── PLAN TAB ────────────────────────────────────
const PlanTab = () => (
  <div className="max-w-lg mx-auto pt-8 px-6">
    <h1 className="font-display text-2xl font-bold text-foreground mb-1">My Plan</h1>
    <p className="text-muted-foreground text-sm mb-6">Your scheduled wellness activities</p>
    <MyPlan />
  </div>
);

// ─── STEPS TAB ────────────────────────────────────
const StepsTab = ({ dailySteps, weeklySteps, points, health, progressHistory, programs }: any) => {
  const [showWearableModal, setShowWearableModal] = useState(false);

  const WEARABLES = [
    { name: "Apple Health", emoji: "🍎", desc: "Sync via HealthKit (iOS)", native: true },
    { name: "Google Fit", emoji: "🏃", desc: "Sync via Health Connect (Android)", native: true },
    { name: "Garmin Connect", emoji: "⌚", desc: "Syncs through Apple Health / Health Connect", native: false },
    { name: "Fitbit", emoji: "💚", desc: "Syncs through Apple Health / Health Connect", native: false },
    { name: "Samsung Health", emoji: "📱", desc: "Syncs through Health Connect", native: false },
  ];

  const handleConnect = async (wearable: typeof WEARABLES[0]) => {
    if (health.isNative) {
      const success = await health.connect();
      if (success) {
        toast({ title: "Connected! 🎉", description: `Now syncing health data from ${wearable.name}.` });
      } else {
        toast({ title: "Connection failed", description: "Please enable health permissions in your device settings.", variant: "destructive" });
      }
    } else {
      toast({ title: `${wearable.name}`, description: "Wearable sync requires the native app." });
    }
    setShowWearableModal(false);
  };

  return (
    <div className="max-w-lg mx-auto pt-8 px-6">
      <h1 className="font-display text-2xl font-bold text-foreground mb-1">Activity</h1>
      <p className="text-muted-foreground text-sm mb-6">
        {health.isConnected ? "Syncing live health data" : "Connect a device for real-time data"}
      </p>

      {/* Connect Device */}
      <div className="mb-6 rounded-2xl bg-secondary/20 border border-border/20 p-5 text-center">
        {health.isConnected ? (
          <>
            <p className="text-sm text-foreground mb-3">✅ Wearable connected</p>
            <button onClick={() => health.refresh()} className="px-5 py-2.5 rounded-xl bg-secondary/50 text-foreground text-sm font-medium active:scale-95 transition-transform">
              Refresh Data
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-3">Connect your wearable for real health data</p>
            <button onClick={() => setShowWearableModal(true)} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium active:scale-95 transition-transform">
              Connect Device
            </button>
          </>
        )}
      </div>

      {health.isConnected && (health.heartRate || health.calories > 0) && (
        <div className="rounded-2xl bg-secondary/20 border border-border/20 p-5 mb-6 flex items-center justify-around">
          {health.heartRate && (
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-wellness-coral">{health.heartRate}</p>
              <p className="text-[10px] text-muted-foreground mt-1">BPM</p>
            </div>
          )}
          {health.calories > 0 && (
            <div className="text-center">
              <p className="font-display text-2xl font-bold text-wellness-gold">{health.calories}</p>
              <p className="text-[10px] text-muted-foreground mt-1">kcal</p>
            </div>
          )}
        </div>
      )}

      <StepTracker dailySteps={dailySteps} dailyGoal={10000} weeklySteps={weeklySteps} />

      {/* Recent Activity */}
      <div className="mt-8">
        <h2 className="font-display text-sm font-semibold text-foreground tracking-wide mb-4">Recent Activity</h2>
        {(!progressHistory || progressHistory.length === 0) ? (
          <div className="rounded-2xl bg-secondary/20 border border-border/20 p-8 text-center">
            <Activity className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-muted-foreground text-sm">Complete a session to see activity here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {progressHistory.slice(0, 5).map((entry: any, i: number) => {
              const prog = programs?.find((p: Program) => p.id === entry.program_id);
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl bg-secondary/20 border border-border/20 p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm">
                    {AREA_ICONS[prog?.target_area || ""] || "🏋️"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{prog?.name || "Session"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.completed_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">+{entry.points_earned || 0} pts</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showWearableModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowWearableModal(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} onClick={e => e.stopPropagation()} className="w-full max-w-md bg-card border-t border-border/30 rounded-t-3xl p-6 safe-bottom">
              <div className="w-10 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-5" />
              <h3 className="font-display text-lg font-bold text-foreground mb-1">Connect Device</h3>
              <p className="text-sm text-muted-foreground mb-5">Choose your health data source</p>
              <div className="space-y-2">
                {WEARABLES.map(w => (
                  <button key={w.name} onClick={() => handleConnect(w)} className="w-full flex items-center gap-3 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-all active:scale-[0.98]">
                    <span className="text-2xl">{w.emoji}</span>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-foreground">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowWearableModal(false)} className="w-full mt-4 py-3 rounded-xl bg-secondary/30 text-muted-foreground text-sm font-medium">Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── MORE/SETTINGS TAB ────────────────────────────────────
const MoreTab = () => {
  const { signOut } = useAuth();
  return (
    <div className="max-w-lg mx-auto pt-8 px-6">
      <h1 className="font-display text-2xl font-bold text-foreground mb-6">Settings</h1>

      <div className="mb-8">
        <h2 className="font-display text-sm font-semibold text-foreground tracking-wide mb-3">Calendar & Reminders</h2>
        <CalendarSync />
      </div>

      <div className="mb-8">
        <h2 className="font-display text-sm font-semibold text-foreground tracking-wide mb-3">Professional Support</h2>
        <a
          href="https://calendly.com/drchriszeiter/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-2xl bg-secondary/20 border border-border/20 p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-all active:scale-[0.98] block"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">📞</div>
          <div className="flex-1">
            <h4 className="font-display font-semibold text-foreground text-sm">Book a Coaching Call</h4>
            <p className="text-xs text-muted-foreground">1-on-1 guidance from a wellness professional</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
        </a>
      </div>

      <button onClick={signOut} className="w-full rounded-2xl bg-secondary/20 border border-border/20 p-4 flex items-center gap-3 text-destructive hover:bg-secondary/30 transition-all">
        <LogOut className="w-5 h-5" />
        <span className="font-medium text-sm">Sign Out</span>
      </button>
    </div>
  );
};

// ─── SHARED COMPONENTS ────────────────────────────────────
const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors relative ${active ? "text-primary" : "text-muted-foreground/60"}`}>
    {active && <motion.div layoutId="navIndicator" className="absolute -top-0 w-6 h-0.5 rounded-full bg-primary" />}
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const ProgramSection = ({ title, programs, onSelect }: { title: string; programs: Program[]; onSelect: (id: string) => void }) => (
  <div className="px-6 mb-8">
    <h2 className="font-display text-sm font-semibold text-foreground tracking-wide mb-3">{title}</h2>
    <div className="space-y-2">
      {programs.map((program, i) => (
        <motion.button
          key={program.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onSelect(program.id)}
          className="w-full rounded-2xl bg-secondary/20 border border-border/20 p-4 flex items-center gap-3 text-left hover:bg-secondary/30 transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary/40 flex items-center justify-center text-lg shrink-0">
            {AREA_ICONS[program.target_area] || "🏋️"}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-foreground text-sm truncate">{program.name}</h4>
            <p className="text-muted-foreground text-xs">{program.duration_minutes} min · {program.exercise_count} exercises</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0" />
        </motion.button>
      ))}
    </div>
  </div>
);

export default WellnessLobby;
