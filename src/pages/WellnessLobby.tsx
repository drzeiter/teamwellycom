import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Activity, Flame, Trophy, Zap, ChevronRight, Play, LogOut,
  TrendingUp, Star, Footprints, Wind, Calendar, Lightbulb, Quote,
  LayoutGrid, Settings, BarChart3,
} from "lucide-react";
import WellnessTips from "@/components/WellnessTips";
import WellnessQuotes from "@/components/WellnessQuotes";
import StepTracker from "@/components/StepTracker";
import CalendarSync from "@/components/CalendarSync";
import { useHealthData } from "@/hooks/useHealthData";
import logoWhite from "@/assets/logo-white.png";
import MyPlan from "@/components/MyPlan";
import WellyScoreRing from "@/components/dashboard/WellyScoreRing";
import InsightsFeed from "@/components/dashboard/InsightsFeed";
import ActionHub from "@/components/dashboard/ActionHub";
import MetricsStrip from "@/components/dashboard/MetricsStrip";
import FloatingParticles from "@/components/dashboard/FloatingParticles";

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

const WellnessLobby = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState<WellyPointsData>({ total_points: 0, current_streak: 0, longest_streak: 0 });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displayName, setDisplayName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [tipsMode, setTipsMode] = useState<"tips" | "quotes">("tips");

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

  // Separate 12-week programs from quick content
  const twelveWeekPrograms = programs.filter(p => (p.duration_weeks || 0) >= 12);
  const quickContent = programs.filter(p => (p.duration_weeks || 0) < 12);
  const categories = ["all", ...new Set(quickContent.map(p => p.target_area))];
  const filtered = selectedCategory === "all" ? quickContent : quickContent.filter(p => p.target_area === selectedCategory);
  const quickResets = filtered.filter(p => p.category_type === "quick_reset");
  const deskResets = filtered.filter(p => p.target_area === "Desk");
  const relaxPrograms = filtered.filter(p => p.target_area === "Relax");

  const firstName = displayName?.split(" ")[0] || "there";
  const level = Math.floor(points.total_points / 100) + 1;
  const xpInLevel = points.total_points % 100;

  const renderContent = () => {
    switch (activeTab) {
      case "home": return <HomeTab {...{ firstName, points, programs: quickContent, twelveWeekPrograms, quickResets, deskResets, relaxPrograms, categories, selectedCategory, setSelectedCategory, navigate, level, xpInLevel, completedCount, signOut, dailySteps: health.dailySteps, tipsMode, setTipsMode, setActiveTab }} />;
      case "programs": return <ProgramsTab {...{ programs: quickContent, twelveWeekPrograms, categories, selectedCategory, setSelectedCategory, navigate }} />;
      case "plan": return <PlanTab />;
      case "steps": return <StepsTab {...{ dailySteps: health.dailySteps, weeklySteps: health.weeklySteps, points, health, progressHistory, programs: [...quickContent, ...twelveWeekPrograms] }} />;
      case "more": return <MoreTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      <div className="fixed bottom-0 left-0 right-0 glass-strong safe-bottom z-40">
        <div className="flex items-center justify-around py-3 max-w-lg mx-auto">
          <NavItem icon={<Activity className="w-5 h-5" />} label="Home" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <NavItem icon={<LayoutGrid className="w-5 h-5" />} label="Programs" active={activeTab === "programs"} onClick={() => setActiveTab("programs")} />
          <NavItem icon={<Footprints className="w-5 h-5" />} label="Activity" active={activeTab === "steps"} onClick={() => setActiveTab("steps")} />
          <NavItem icon={<Calendar className="w-5 h-5" />} label="Plan" active={activeTab === "plan"} onClick={() => setActiveTab("plan")} />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" active={activeTab === "more"} onClick={() => setActiveTab("more")} />
        </div>
      </div>
    </div>
  );
};

// ─── SCROLL REVEAL WRAPPER ──────────────────────────
const ScrollReveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

// ─── DYNAMIC STATE GENERATOR ──────────────────────────
const getDailyState = (streak: number, points: number) => {
  const states = [
    { headline: "Recovery Ready", explanation: "Your body is primed for a quality session today. Consistency is building resilience." },
    { headline: "Strong Mobility Score", explanation: "Your movement patterns are improving. Keep the momentum going with today's routine." },
    { headline: "Optimal Performance Window", explanation: "Your recent activity shows you're in peak form. Make the most of today." },
    { headline: "Building Momentum", explanation: "Your streak is growing — every session compounds. Today is another opportunity." },
  ];
  const idx = (streak + Math.floor(points / 50)) % states.length;
  return states[idx];
};

// ─── HOME TAB ────────────────────────────────────────
const HomeTab = ({ firstName, points, programs, twelveWeekPrograms, quickResets, deskResets, relaxPrograms, categories, selectedCategory, setSelectedCategory, navigate, level, xpInLevel, completedCount, signOut, dailySteps, tipsMode, setTipsMode, setActiveTab }: any) => {
  const allPrograms = [...programs, ...twelveWeekPrograms];
  const dailyState = getDailyState(points.current_streak, points.total_points);
  const wellyScore = Math.min(99, Math.max(40, 60 + points.current_streak * 5 + Math.floor(completedCount / 2)));
  const recoveryScore = Math.min(95, 55 + points.current_streak * 4);
  const mobilityScore = Math.min(90, 50 + completedCount * 3);
  const stressScore = Math.max(15, 50 - points.current_streak * 6);

  return (
    <>
      {/* ─── HERO SECTION ─────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(135deg, hsl(222 47% 6%) 0%, hsl(200 40% 10%) 50%, hsl(222 47% 6%) 100%)",
              "linear-gradient(135deg, hsl(222 47% 6%) 0%, hsl(174 30% 12%) 50%, hsl(222 47% 6%) 100%)",
              "linear-gradient(135deg, hsl(222 47% 6%) 0%, hsl(200 40% 10%) 50%, hsl(222 47% 6%) 100%)",
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <FloatingParticles />

        <div className="relative z-10 px-5 pt-6 pb-8">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <img src={logoWhite} alt="Team Welly" className="h-8 w-auto" />
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Custom Wellness</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-bold">Lv.{level}</div>
              <button onClick={signOut} className="w-9 h-9 rounded-full bg-secondary/40 backdrop-blur-sm flex items-center justify-center">
                <LogOut className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Greeting */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">Hey, {firstName} 👋</h1>
            <motion.p
              className="font-display text-lg font-semibold text-primary"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {dailyState.headline}
            </motion.p>
            <motion.p
              className="text-sm text-muted-foreground mt-1 max-w-xs leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {dailyState.explanation}
            </motion.p>
          </motion.div>

          {/* Welly Score */}
          <div className="mt-8">
            <WellyScoreRing score={wellyScore} recovery={recoveryScore} mobility={mobilityScore} stress={stressScore} />
          </div>
        </div>
      </div>

      {/* ─── STATS BAR ─────────────────────────── */}
      <ScrollReveal>
        <div className="px-5 -mt-2 mb-6">
          <div className="glass rounded-2xl p-4 flex items-center justify-between">
            <StatItem icon={<Zap className="w-4 h-4 text-wellness-gold" />} value={points.total_points} label="Points" />
            <div className="w-px h-8 bg-border" />
            <StatItem icon={<Flame className="w-4 h-4 text-wellness-coral" />} value={points.current_streak} label="Streak" />
            <div className="w-px h-8 bg-border" />
            <StatItem icon={<Footprints className="w-4 h-4 text-primary" />} value={dailySteps.toLocaleString()} label="Steps" />
          </div>
        </div>
      </ScrollReveal>

      {/* ─── LEVEL PROGRESS ─────────────────────────── */}
      <ScrollReveal delay={0.05}>
        <div className="px-5 mb-6">
          <div className="glass rounded-xl p-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Level {level}</span>
              <span className="text-primary font-mono">{xpInLevel}/100 XP</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full gradient-primary rounded-full" animate={{ width: `${xpInLevel}%` }} />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ─── ACTION HUB ─────────────────────────── */}
      <ScrollReveal delay={0.05}>
        <div className="px-5 mb-6">
          <ActionHub programs={allPrograms} />
        </div>
      </ScrollReveal>

      {/* ─── INSIGHTS FEED ─────────────────────────── */}
      <ScrollReveal delay={0.05}>
        <div className="px-5 mb-6">
          <InsightsFeed />
        </div>
      </ScrollReveal>

      {/* ─── METRICS STRIP ─────────────────────────── */}
      <ScrollReveal delay={0.05}>
        <div className="px-5 mb-6">
          <MetricsStrip />
        </div>
      </ScrollReveal>

      {/* ─── TIPS / QUOTES ─────────────────────────── */}
      <ScrollReveal delay={0.05}>
        <div className="px-5 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={() => setTipsMode("tips")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${tipsMode === "tips" ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <Lightbulb className="w-3 h-3" /> Science & Tips
            </button>
            <button onClick={() => setTipsMode("quotes")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${tipsMode === "quotes" ? "gradient-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
              <Quote className="w-3 h-3" /> Inspiration
            </button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tipsMode} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
              {tipsMode === "tips" ? <WellnessTips /> : <WellnessQuotes />}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollReveal>

      {/* ─── 12-WEEK PROGRAMS ─────────────────────────── */}
      {twelveWeekPrograms.length > 0 && (
        <ScrollReveal delay={0.05}>
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-base font-bold text-foreground">🎯 Pain → Performance</h2>
                <p className="text-muted-foreground text-xs">12-week progressive programs</p>
              </div>
            </div>
            <div className="space-y-3">
              {twelveWeekPrograms.slice(0, 3).map((program: Program, i: number) => (
                <motion.button
                  key={program.id}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => navigate(`/program/${program.id}`)}
                  className="w-full glass rounded-2xl p-4 flex items-center gap-4 text-left hover:border-primary/20 transition-all group"
                  style={{ boxShadow: "0 4px 20px -8px hsl(174 72% 50% / 0.1)" }}
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-xl shrink-0 group-hover:shadow-lg transition-shadow">
                    {AREA_ICONS[program.target_area] || "🏋️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-display font-semibold text-foreground text-sm truncate">{program.name}</h4>
                    <p className="text-muted-foreground text-xs mt-0.5">12 weeks · {program.target_area} · Progressive</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
                </motion.button>
              ))}
              {twelveWeekPrograms.length > 3 && (
                <button onClick={() => setActiveTab("programs")} className="w-full text-center text-primary text-xs font-medium py-2">
                  View all {twelveWeekPrograms.length} programs →
                </button>
              )}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* ─── QUICK RESETS ─────────────────────────── */}
      {quickResets.length > 0 && (
        <ScrollReveal delay={0.05}>
          <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-display text-base font-bold text-foreground">⚡ Quick Resets</h2>
                <p className="text-muted-foreground text-xs">Targeted relief in 5-10 minutes</p>
              </div>
              <button onClick={() => setActiveTab("programs")} className="text-primary text-xs font-medium">View all →</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {quickResets.slice(0, 6).map((program: Program, i: number) => (
                <motion.button
                  key={program.id}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate(`/player/${program.id}`)}
                  className="glass rounded-2xl p-4 text-left hover:border-primary/20 transition-all group"
                >
                  <div className="text-2xl mb-2">{AREA_ICONS[program.target_area] || "🏋️"}</div>
                  <h4 className="font-display font-semibold text-foreground text-xs leading-tight truncate">{program.name}</h4>
                  <p className="text-[10px] text-muted-foreground mt-1">{program.duration_minutes} min</p>
                </motion.button>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}
    </>
  );
};

// ─── PROGRAMS TAB ────────────────────────────────────
const ProgramsTab = ({ programs, twelveWeekPrograms, categories, selectedCategory, setSelectedCategory, navigate }: any) => {
  const filtered = selectedCategory === "all" ? programs : programs.filter((p: Program) => p.target_area === selectedCategory);
  const quickResets = filtered.filter((p: Program) => p.category_type === "quick_reset" && p.target_area !== "Relax");
  const relaxPrograms = filtered.filter((p: Program) => p.target_area === "Relax");

  return (
    <div className="pt-6">
      <div className="px-5 mb-4 flex items-center gap-3">
        <img src={logoWhite} alt="" className="h-7 w-auto" />
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Programs</h1>
          <p className="text-muted-foreground text-xs">{programs.length + twelveWeekPrograms.length} programs available</p>
        </div>
      </div>

      {/* 12-Week Programs */}
      {twelveWeekPrograms.length > 0 && (
        <div className="px-5 mb-6">
          <h2 className="font-display text-base font-bold text-foreground mb-1">🎯 Pain → Performance</h2>
          <p className="text-xs text-muted-foreground mb-3">12-week progressive rehabilitation programs</p>
          <div className="grid grid-cols-2 gap-3">
            {twelveWeekPrograms.map((program: Program) => (
              <motion.button
                key={program.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/program/${program.id}`)}
                className="glass rounded-xl p-4 text-left hover:border-primary/30 transition-all"
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
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground font-medium">Quick Sessions & Resets</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      {/* Category Filter */}
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat: string) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >{cat === "all" ? "All" : cat}</button>
          ))}
        </div>
      </div>

      {relaxPrograms.length > 0 && <ProgramSection title="🫁 Breathwork & Relax" subtitle="" programs={relaxPrograms} onSelect={(id: string) => navigate(`/player/${id}`)} />}
      {quickResets.length > 0 && <ProgramSection title="⚡ Quick Resets" subtitle="" programs={quickResets} onSelect={(id: string) => navigate(`/player/${id}`)} />}
    </div>
  );
};

// ─── PLAN TAB ────────────────────────────────────
const PlanTab = () => (
  <div className="pt-6 px-5">
    <div className="flex items-center gap-3 mb-4">
      <img src={logoWhite} alt="" className="h-7 w-auto" />
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">My Plan</h1>
        <p className="text-muted-foreground text-xs">Your scheduled wellness activities</p>
      </div>
    </div>
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
    <div className="pt-6 px-5">
      <div className="flex items-center gap-3 mb-4">
        <img src={logoWhite} alt="" className="h-7 w-auto" />
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Activity Tracking</h1>
          <p className="text-muted-foreground text-xs">
            {health.isConnected ? "✅ Syncing live health data" : "Showing simulated data"}
          </p>
        </div>
      </div>

      {health.isConnected && (health.heartRate || health.calories > 0) && (
        <div className="glass rounded-xl p-4 mb-4 flex items-center justify-around">
          {health.heartRate && (
            <div className="text-center">
              <p className="font-display text-xl font-bold text-wellness-coral">{health.heartRate}</p>
              <p className="text-[10px] text-muted-foreground">❤️ BPM</p>
            </div>
          )}
          {health.calories > 0 && (
            <div className="text-center">
              <p className="font-display text-xl font-bold text-wellness-gold">{health.calories}</p>
              <p className="text-[10px] text-muted-foreground">🔥 kcal</p>
            </div>
          )}
        </div>
      )}

      {/* Connect Device - at top */}
      <div className="mb-4 glass rounded-xl p-4 text-center">
        {health.isConnected ? (
          <>
            <p className="text-sm text-foreground mb-2">✅ Wearable connected</p>
            <button onClick={() => health.refresh()} className="px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform">
              🔄 Refresh Data
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-2">Connect your device for real step data</p>
            <button onClick={() => setShowWearableModal(true)} className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium active:scale-95 transition-transform">
              <Footprints className="w-4 h-4 inline mr-1" /> Connect Wearable
            </button>
          </>
        )}
      </div>

      <StepTracker dailySteps={dailySteps} dailyGoal={10000} weeklySteps={weeklySteps} />

      <div className="mt-4 glass rounded-xl p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-2">🏅 Step Rewards</h3>
        <div className="space-y-2">
          {[
            { steps: 5000, emoji: "🥉", label: "Bronze Walker", pts: "+10 XP" },
            { steps: 7500, emoji: "🥈", label: "Silver Strider", pts: "+20 XP" },
            { steps: 10000, emoji: "🥇", label: "Gold Mover", pts: "+30 XP" },
            { steps: 15000, emoji: "💎", label: "Diamond Athlete", pts: "+50 XP" },
          ].map((m) => (
            <div key={m.steps} className={`flex items-center gap-3 p-2 rounded-lg ${dailySteps >= m.steps ? "bg-primary/10" : "bg-secondary/50"}`}>
              <span className="text-lg">{m.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${dailySteps >= m.steps ? "text-primary" : "text-muted-foreground"}`}>{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.steps.toLocaleString()} steps</p>
              </div>
              <span className={`text-xs font-mono ${dailySteps >= m.steps ? "text-wellness-gold" : "text-muted-foreground"}`}>{m.pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6">
        <h2 className="font-display text-base font-semibold text-foreground mb-3">Recent Activity</h2>
        {(!progressHistory || progressHistory.length === 0) ? (
          <div className="glass rounded-xl p-6 text-center">
            <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">Complete your first session to see activity here!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {progressHistory.slice(0, 5).map((entry: any, i: number) => {
              const prog = programs?.find((p: Program) => p.id === entry.program_id);
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-xs">
                    {AREA_ICONS[prog?.target_area || ""] || "🏋️"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{prog?.name || "Session"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.completed_at).toLocaleDateString()}</p>
                  </div>
                  <span className="text-xs font-mono text-wellness-gold">+{entry.points_earned || 0}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showWearableModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center" onClick={() => setShowWearableModal(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25 }} onClick={e => e.stopPropagation()} className="w-full max-w-md glass-strong rounded-t-2xl p-5 safe-bottom">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-1">Connect Wearable</h3>
              <p className="text-xs text-muted-foreground mb-4">Choose your health data source</p>
              <div className="space-y-2">
                {WEARABLES.map(w => (
                  <button key={w.name} onClick={() => handleConnect(w)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-all active:scale-[0.98]">
                    <span className="text-2xl">{w.emoji}</span>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-foreground">{w.name}</p>
                      <p className="text-xs text-muted-foreground">{w.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <button onClick={() => setShowWearableModal(false)} className="w-full mt-4 py-3 rounded-xl bg-secondary text-muted-foreground text-sm font-medium">Cancel</button>
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
    <div className="pt-6 px-5">
      <div className="flex items-center gap-3 mb-4">
        <img src={logoWhite} alt="" className="h-7 w-auto" />
        <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>
      </div>
      <div className="mb-6">
        <h2 className="font-display text-base font-semibold text-foreground mb-3">📅 Calendar & Reminders</h2>
        <CalendarSync />
      </div>

      {/* Book Coaching Call */}
      <div className="mb-6">
        <h2 className="font-display text-base font-semibold text-foreground mb-3">👨🏻‍⚕️ Need to Talk to a Professional?</h2>
        <a
          href="https://calendly.com/drchriszeiter/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full glass rounded-xl p-4 flex items-center gap-3 text-left hover:border-primary/30 transition-all active:scale-[0.98] block"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-lg shrink-0">📞</div>
          <div className="flex-1">
            <h4 className="font-display font-semibold text-foreground text-sm">Book a Coaching Call</h4>
            <p className="text-xs text-muted-foreground">1-on-1 guidance from a wellness professional</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </a>
      </div>

      <button onClick={signOut} className="w-full glass rounded-xl p-4 flex items-center gap-3 text-destructive">
        <LogOut className="w-5 h-5" />
        <span className="font-medium text-sm">Sign Out</span>
      </button>
    </div>
  );
};

// ─── SHARED COMPONENTS ────────────────────────────────────
const StatItem = ({ icon, value, label }: { icon: React.ReactNode; value: number | string; label: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <div>
      <p className="font-display text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  </div>
);

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors relative ${active ? "text-primary" : "text-muted-foreground"}`}>
    {active && <motion.div layoutId="navIndicator" className="absolute -top-0 w-8 h-0.5 rounded-full gradient-primary" />}
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const ProgramSection = ({ title, subtitle, programs, onSelect }: { title: string; subtitle: string; programs: Program[]; onSelect: (id: string) => void }) => (
  <div className="px-5 mb-6">
    <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
    {subtitle && <p className="text-muted-foreground text-xs mb-3">{subtitle}</p>}
    <div className="space-y-2 mt-2">
      {programs.map((program, i) => (
        <motion.button
          key={program.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onSelect(program.id)}
          className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left hover:border-primary/30 transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg shrink-0">
            {AREA_ICONS[program.target_area] || "🏋️"}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-foreground text-sm truncate">{program.name}</h4>
            <p className="text-muted-foreground text-xs">{program.duration_minutes} min · {program.exercise_count} exercises</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>
      ))}
    </div>
  </div>
);

export default WellnessLobby;
