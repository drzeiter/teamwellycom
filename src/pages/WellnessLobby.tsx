import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Activity, Flame, Trophy, Zap, ChevronRight, Play, LogOut } from "lucide-react";

interface WellyPointsData {
  total_points: number;
  current_streak: number;
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

const AREA_ICONS: Record<string, string> = {
  "Low Back": "🔻", "Hips": "🦴", "Shoulders": "💪", "Neck": "🦒",
  "Foot/Ankle": "🦶", "Knee": "🦵", "Thoracic Spine": "🔄", "Hamstrings": "🦿",
  "Glutes": "🍑", "Desk": "🖥️", "Full Body": "🧘", "Warm-Up": "🔥",
};

const WellnessLobby = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState<WellyPointsData>({ total_points: 0, current_streak: 0 });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const [pointsRes, programsRes, profileRes] = await Promise.all([
        supabase.from("welly_points").select("*").eq("user_id", user.id).single(),
        supabase.from("programs").select("*").order("sort_order"),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
      ]);

      if (pointsRes.data) setPoints(pointsRes.data);
      if (programsRes.data) setPrograms(programsRes.data);
      if (profileRes.data) setDisplayName(profileRes.data.display_name || "");
    };

    fetchData();
  }, [user]);

  const categories = ["all", ...new Set(programs.map(p => p.target_area))];
  const filtered = selectedCategory === "all"
    ? programs
    : programs.filter(p => p.target_area === selectedCategory);

  const quickResets = filtered.filter(p => p.category_type === "quick_reset");
  const performancePrograms = filtered.filter(p => p.category_type === "performance");

  const firstName = displayName?.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-sm">Welcome back</p>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Hey, {firstName} 👋
            </h1>
          </div>
          <button
            onClick={signOut}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
          >
            <LogOut className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-4 flex items-center justify-between"
        >
          <StatItem icon={<Zap className="w-4 h-4 text-wellness-gold" />} value={points.total_points} label="WellyPoints" />
          <div className="w-px h-8 bg-border" />
          <StatItem icon={<Flame className="w-4 h-4 text-wellness-coral" />} value={points.current_streak} label="Day Streak" />
          <div className="w-px h-8 bg-border" />
          <StatItem icon={<Trophy className="w-4 h-4 text-primary" />} value={programs.length} label="Programs" />
        </motion.div>
      </div>

      {/* Daily Suggestion */}
      <div className="px-5 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gradient-primary rounded-2xl p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-foreground/5 -translate-y-8 translate-x-8" />
          <p className="text-primary-foreground/70 text-xs font-medium uppercase tracking-wider mb-1">
            Today's Suggestion
          </p>
          <h3 className="font-display text-lg font-bold text-primary-foreground mb-1">
            5-Min Desk Reset
          </h3>
          <p className="text-primary-foreground/70 text-sm mb-3">
            Quick relief for sitting all day
          </p>
          <button
            onClick={() => {
              const desk = programs.find(p => p.target_area === "Desk" && p.duration_minutes === 5);
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
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Resets */}
      {quickResets.length > 0 && (
        <ProgramSection
          title="⚡ Quick Resets"
          subtitle="5 or 15 minute targeted routines"
          programs={quickResets}
          onSelect={(id) => navigate(`/player/${id}`)}
        />
      )}

      {/* Performance Programs */}
      {performancePrograms.length > 0 && (
        <ProgramSection
          title="🏆 Performance Programs"
          subtitle="12-week progressive plans"
          programs={performancePrograms}
          onSelect={(id) => navigate(`/player/${id}`)}
        />
      )}

      {/* Empty state */}
      {programs.length === 0 && (
        <div className="px-5 text-center py-16">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            Programs Coming Soon
          </h3>
          <p className="text-muted-foreground text-sm">
            Your personalized wellness programs are being prepared. Check back soon!
          </p>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong safe-bottom">
        <div className="flex items-center justify-around py-3 max-w-md mx-auto">
          <NavItem icon={<Activity className="w-5 h-5" />} label="Home" active />
          <NavItem icon={<Play className="w-5 h-5" />} label="Programs" onClick={() => {}} />
          <NavItem icon={<Trophy className="w-5 h-5" />} label="Progress" onClick={() => {}} />
          <NavItem icon={<Zap className="w-5 h-5" />} label="Points" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
};

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
  <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? "text-primary" : "text-muted-foreground"}`}>
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const ProgramSection = ({
  title, subtitle, programs, onSelect,
}: {
  title: string; subtitle: string; programs: Program[]; onSelect: (id: string) => void;
}) => (
  <div className="px-5 mb-6">
    <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
    <p className="text-muted-foreground text-xs mb-3">{subtitle}</p>
    <div className="space-y-3">
      {programs.map((program, i) => (
        <motion.button
          key={program.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(program.id)}
          className="w-full glass rounded-xl p-4 flex items-center gap-4 text-left hover:border-primary/30 transition-all"
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
