import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Flame, Trophy, Zap, ChevronRight, Play, LogOut, TrendingUp, Calendar, Star } from "lucide-react";

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
}

interface ProgressEntry {
  completed_at: string;
  points_earned: number | null;
  program_id: string;
}

const AREA_ICONS: Record<string, string> = {
  "Low Back": "🔻", "Hips": "🦴", "Shoulders": "💪", "Neck": "🦒",
  "Foot/Ankle": "🦶", "Knee": "🦵", "Thoracic Spine": "🔄", "Hamstrings": "🦿",
  "Glutes": "🍑", "Desk": "🖥️", "Full Body": "🧘", "Warm-Up": "🔥",
};

type Tab = "home" | "programs" | "progress" | "points";

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
      if (programsRes.data) setPrograms(programsRes.data);
      if (profileRes.data) setDisplayName(profileRes.data.display_name || "");
      if (progressRes.data) {
        setProgressHistory(progressRes.data);
        setCompletedCount(progressRes.data.length);
      }
    };
    fetchData();
  }, [user]);

  const categories = ["all", ...new Set(programs.map(p => p.target_area))];
  const filtered = selectedCategory === "all" ? programs : programs.filter(p => p.target_area === selectedCategory);
  const quickResets = filtered.filter(p => p.category_type === "quick_reset");
  const performancePrograms = filtered.filter(p => p.category_type === "performance");
  const firstName = displayName?.split(" ")[0] || "there";

  // Level system
  const level = Math.floor(points.total_points / 100) + 1;
  const xpInLevel = points.total_points % 100;

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <HomeTab
          firstName={firstName}
          points={points}
          programs={programs}
          quickResets={quickResets}
          performancePrograms={performancePrograms}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          navigate={navigate}
          level={level}
          xpInLevel={xpInLevel}
          completedCount={completedCount}
          signOut={signOut}
        />;
      case "programs":
        return <ProgramsTab
          programs={programs}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          navigate={navigate}
        />;
      case "progress":
        return <ProgressTab
          progressHistory={progressHistory}
          programs={programs}
          points={points}
          completedCount={completedCount}
        />;
      case "points":
        return <PointsTab points={points} level={level} xpInLevel={xpInLevel} completedCount={completedCount} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong safe-bottom z-40">
        <div className="flex items-center justify-around py-3 max-w-md mx-auto">
          <NavItem icon={<Activity className="w-5 h-5" />} label="Home" active={activeTab === "home"} onClick={() => setActiveTab("home")} />
          <NavItem icon={<Play className="w-5 h-5" />} label="Programs" active={activeTab === "programs"} onClick={() => setActiveTab("programs")} />
          <NavItem icon={<Trophy className="w-5 h-5" />} label="Progress" active={activeTab === "progress"} onClick={() => setActiveTab("progress")} />
          <NavItem icon={<Zap className="w-5 h-5" />} label="Points" active={activeTab === "points"} onClick={() => setActiveTab("points")} />
        </div>
      </div>
    </div>
  );
};

// HOME TAB
const HomeTab = ({ firstName, points, programs, quickResets, performancePrograms, categories, selectedCategory, setSelectedCategory, navigate, level, xpInLevel, completedCount, signOut }: any) => (
  <>
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-muted-foreground text-sm">Welcome back</p>
          <h1 className="font-display text-2xl font-bold text-foreground">Hey, {firstName} 👋</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full gradient-primary text-primary-foreground text-xs font-bold">
            Lv.{level}
          </div>
          <button onClick={signOut} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 flex items-center justify-between">
        <StatItem icon={<Zap className="w-4 h-4 text-wellness-gold" />} value={points.total_points} label="WellyPoints" />
        <div className="w-px h-8 bg-border" />
        <StatItem icon={<Flame className="w-4 h-4 text-wellness-coral" />} value={points.current_streak} label="Day Streak" />
        <div className="w-px h-8 bg-border" />
        <StatItem icon={<Trophy className="w-4 h-4 text-primary" />} value={completedCount} label="Sessions" />
      </motion.div>
    </div>

    {/* Level Progress */}
    <div className="px-5 mb-4">
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

    {/* Daily Suggestion */}
    <div className="px-5 mb-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="gradient-primary rounded-2xl p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-foreground/5 -translate-y-8 translate-x-8" />
        <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider mb-1">Today's Suggestion</p>
        <h3 className="font-display text-lg font-bold text-primary-foreground mb-1">5-Min Desk Reset</h3>
        <p className="text-primary-foreground/70 text-sm mb-3">Quick relief for sitting all day</p>
        <button
          onClick={() => {
            const desk = programs.find((p: Program) => p.target_area === "Desk" && p.duration_minutes === 5);
            if (desk) navigate(`/player/${desk.id}`);
          }}
          className="flex items-center gap-2 bg-primary-foreground/20 backdrop-blur-sm rounded-lg px-4 py-2 text-primary-foreground text-sm font-medium"
        >
          <Play className="w-4 h-4" /> Start Now
        </button>
      </motion.div>
    </div>

    {/* Category Filter */}
    <div className="px-5 mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat: string) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
          >
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>
    </div>

    {quickResets.length > 0 && <ProgramSection title="⚡ Quick Resets" subtitle="5 or 15 minute targeted routines" programs={quickResets} onSelect={(id: string) => navigate(`/player/${id}`)} />}
    {performancePrograms.length > 0 && <ProgramSection title="🏆 Performance Programs" subtitle="12-week progressive plans" programs={performancePrograms} onSelect={(id: string) => navigate(`/player/${id}`)} />}
  </>
);

// PROGRAMS TAB
const ProgramsTab = ({ programs, categories, selectedCategory, setSelectedCategory, navigate }: any) => {
  const filtered = selectedCategory === "all" ? programs : programs.filter((p: Program) => p.target_area === selectedCategory);
  const quickResets = filtered.filter((p: Program) => p.category_type === "quick_reset");
  const performance = filtered.filter((p: Program) => p.category_type === "performance");

  return (
    <div className="pt-6">
      <div className="px-5 mb-4">
        <h1 className="font-display text-2xl font-bold text-foreground mb-1">Programs</h1>
        <p className="text-muted-foreground text-sm">{programs.length} programs available</p>
      </div>
      <div className="px-5 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat: string) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
            >{cat === "all" ? "All" : cat}</button>
          ))}
        </div>
      </div>
      {quickResets.length > 0 && <ProgramSection title="⚡ Quick Resets" subtitle="" programs={quickResets} onSelect={(id: string) => navigate(`/player/${id}`)} />}
      {performance.length > 0 && <ProgramSection title="🏆 Performance" subtitle="" programs={performance} onSelect={(id: string) => navigate(`/player/${id}`)} />}
    </div>
  );
};

// PROGRESS TAB
const ProgressTab = ({ progressHistory, programs, points, completedCount }: any) => (
  <div className="pt-6 px-5">
    <h1 className="font-display text-2xl font-bold text-foreground mb-4">Your Progress</h1>
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="glass rounded-xl p-4 text-center">
        <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
        <p className="font-display text-2xl font-bold text-foreground">{completedCount}</p>
        <p className="text-xs text-muted-foreground">Sessions</p>
      </div>
      <div className="glass rounded-xl p-4 text-center">
        <Flame className="w-5 h-5 text-wellness-coral mx-auto mb-1" />
        <p className="font-display text-2xl font-bold text-foreground">{points.current_streak}</p>
        <p className="text-xs text-muted-foreground">Day Streak</p>
      </div>
      <div className="glass rounded-xl p-4 text-center">
        <Star className="w-5 h-5 text-wellness-gold mx-auto mb-1" />
        <p className="font-display text-2xl font-bold text-foreground">{points.longest_streak}</p>
        <p className="text-xs text-muted-foreground">Best Streak</p>
      </div>
      <div className="glass rounded-xl p-4 text-center">
        <Zap className="w-5 h-5 text-wellness-purple mx-auto mb-1" />
        <p className="font-display text-2xl font-bold text-foreground">{points.total_points}</p>
        <p className="text-xs text-muted-foreground">Total XP</p>
      </div>
    </div>

    <h2 className="font-display text-lg font-semibold text-foreground mb-3">Recent Activity</h2>
    {progressHistory.length === 0 ? (
      <div className="glass rounded-xl p-6 text-center">
        <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Complete your first session to see activity here!</p>
      </div>
    ) : (
      <div className="space-y-2">
        {progressHistory.map((entry: any, i: number) => {
          const prog = programs.find((p: Program) => p.id === entry.program_id);
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
);

// POINTS TAB
const PointsTab = ({ points, level, xpInLevel, completedCount }: any) => (
  <div className="pt-6 px-5">
    <h1 className="font-display text-2xl font-bold text-foreground mb-6">WellyPoints</h1>
    
    <div className="glass rounded-2xl p-6 text-center mb-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4"
      >
        <Zap className="w-10 h-10 text-primary-foreground" />
      </motion.div>
      <p className="font-display text-4xl font-bold text-gradient-gold mb-1">{points.total_points}</p>
      <p className="text-muted-foreground text-sm">Total WellyPoints</p>
    </div>

    <div className="glass rounded-xl p-4 mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-foreground font-medium">Level {level}</span>
        <span className="text-sm text-primary font-mono">{xpInLevel}/100 XP to Level {level + 1}</span>
      </div>
      <div className="h-3 bg-secondary rounded-full overflow-hidden">
        <motion.div className="h-full gradient-primary rounded-full" animate={{ width: `${xpInLevel}%` }} />
      </div>
    </div>

    <h2 className="font-display text-lg font-semibold text-foreground mb-3">How to Earn Points</h2>
    <div className="space-y-2">
      {[
        { emoji: "✅", text: "Complete an exercise", pts: "+5" },
        { emoji: "🏆", text: "Finish a full program", pts: "+10 bonus" },
        { emoji: "🔥", text: "Maintain daily streak", pts: "Streak multiplier" },
      ].map((item, i) => (
        <div key={i} className="glass rounded-xl p-3 flex items-center gap-3">
          <span className="text-xl">{item.emoji}</span>
          <span className="flex-1 text-sm text-foreground">{item.text}</span>
          <span className="text-xs font-mono text-wellness-gold">{item.pts}</span>
        </div>
      ))}
    </div>
  </div>
);

const StatItem = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <div className="flex items-center gap-2">
    {icon}
    <div>
      <p className="font-display text-lg font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  </div>
);

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
    {active && <motion.div layoutId="navIndicator" className="absolute -top-0 w-8 h-0.5 rounded-full gradient-primary" />}
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const ProgramSection = ({ title, subtitle, programs, onSelect }: { title: string; subtitle: string; programs: Program[]; onSelect: (id: string) => void }) => (
  <div className="px-5 mb-6">
    <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
    {subtitle && <p className="text-muted-foreground text-xs mb-3">{subtitle}</p>}
    <div className="space-y-3 mt-2">
      {programs.map((program, i) => (
        <motion.button
          key={program.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          onClick={() => onSelect(program.id)}
          className="w-full glass rounded-xl p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all active:scale-[0.98]"
        >
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-xl shrink-0">
            {AREA_ICONS[program.target_area] || "🏋️"}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-foreground text-sm truncate">{program.name}</h4>
            <p className="text-muted-foreground text-xs">
              {program.duration_minutes} min · {program.exercise_count} exercises · {program.difficulty}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        </motion.button>
      ))}
    </div>
  </div>
);

export default WellnessLobby;
