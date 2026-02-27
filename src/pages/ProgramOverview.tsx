import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Clock, Target, ChevronRight, Check, Lock, Zap, Plus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import logoWhite from "@/assets/logo-white.png";

interface Program {
  id: string;
  name: string;
  target_area: string;
  description: string | null;
  duration_weeks: number;
  region: string | null;
  equipment_needed: string[] | null;
  category: string;
}

interface WeeklyModule {
  id: string;
  week_number: number;
  focus_text: string | null;
}

interface ModuleExercise {
  id: string;
  sequence_label: string;
  sets: string | null;
  reps: string | null;
  frequency: string | null;
  notes: string | null;
  exercise_id: string;
}

interface CanonicalExercise {
  id: string;
  name: string;
  category: string;
  description: string | null;
  is_bilateral: boolean | null;
}

const REGION_EMOJI: Record<string, string> = {
  foot_ankle: "🦶", hip: "🦴", knee: "🦵",
  low_back: "🔻", neck: "🦒", shoulder: "💪",
};

const ProgramOverview = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [weeks, setWeeks] = useState<WeeklyModule[]>([]);
  const [exercisesByModule, setExercisesByModule] = useState<Record<string, (ModuleExercise & { exercise: CanonicalExercise })[]>>({});
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!programId || !user) return;
    const fetchData = async () => {
      const [progRes, weeksRes] = await Promise.all([
        supabase.from("programs").select("*").eq("id", programId).single(),
        supabase.from("weekly_modules").select("*").eq("program_id", programId).order("week_number"),
      ]);
      if (progRes.data) setProgram(progRes.data as Program);
      if (weeksRes.data) {
        setWeeks(weeksRes.data);
        // Fetch exercises for all modules
        const moduleIds = weeksRes.data.map(w => w.id);
        if (moduleIds.length > 0) {
          const { data: modExData } = await supabase
            .from("module_exercises")
            .select("*")
            .in("module_id", moduleIds);
          if (modExData) {
            const exerciseIds = [...new Set(modExData.map(me => me.exercise_id))];
            const { data: exData } = await supabase
              .from("canonical_exercises")
              .select("*")
              .in("id", exerciseIds);
            const exMap = Object.fromEntries((exData || []).map(e => [e.id, e]));
            const grouped: Record<string, any[]> = {};
            modExData.forEach(me => {
              if (!grouped[me.module_id]) grouped[me.module_id] = [];
              grouped[me.module_id].push({ ...me, exercise: exMap[me.exercise_id] });
            });
            // Sort by sequence_label
            Object.values(grouped).forEach(arr => arr.sort((a, b) => a.sequence_label.localeCompare(b.sequence_label)));
            setExercisesByModule(grouped);
          }
        }
      }
      // Get completed progress
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("completed_at")
        .eq("user_id", user.id)
        .eq("program_id", programId);
      if (progressData) {
        setCompletedWeeks(new Set(progressData.map((_, i) => i + 1)));
      }
      // Check enrollment
      const { data: enrollData } = await (supabase as any)
        .from("user_enrolled_programs")
        .select("id")
        .eq("user_id", user.id)
        .eq("program_id", programId)
        .eq("is_active", true);
      if (enrollData && enrollData.length > 0) setIsEnrolled(true);
      setLoading(false);
    };
    fetchData();
  }, [programId, user]);

  const currentWeek = completedWeeks.size + 1;

  const handleEnroll = async () => {
    if (!user || !programId) return;
    setEnrolling(true);
    const { error } = await (supabase as any)
      .from("user_enrolled_programs")
      .upsert({ user_id: user.id, program_id: programId, is_active: true }, { onConflict: "user_id,program_id" });
    if (!error) {
      setIsEnrolled(true);
      toast({ title: "Added to My Plan! ✅", description: "This program is now in your Plan tab." });
    } else {
      toast({ title: "Error", description: "Could not add to plan.", variant: "destructive" });
    }
    setEnrolling(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <img src={logoWhite} alt="Team Welly" className="h-8 w-auto mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading program...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Program not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-strong">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={logoWhite} alt="Team Welly" className="h-6 w-auto" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-base font-bold text-foreground truncate">{program.name}</h1>
            <p className="text-xs text-muted-foreground">Week {Math.min(currentWeek, 12)} of 12</p>
          </div>
          <span className="text-2xl">{REGION_EMOJI[program.region || ""] || "🏋️"}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Program Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 space-y-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-3xl shrink-0">
              {REGION_EMOJI[program.region || ""] || "🏋️"}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-bold text-foreground">{program.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{program.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="font-display text-sm font-bold text-foreground">12 weeks</p>
              <p className="text-[10px] text-muted-foreground">Duration</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Target className="w-4 h-4 text-wellness-coral mx-auto mb-1" />
              <p className="font-display text-sm font-bold text-foreground">{program.target_area}</p>
              <p className="text-[10px] text-muted-foreground">Target</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <Zap className="w-4 h-4 text-wellness-gold mx-auto mb-1" />
              <p className="font-display text-sm font-bold text-foreground">Progressive</p>
              <p className="text-[10px] text-muted-foreground">Difficulty</p>
            </div>
          </div>

          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Overall Progress</span>
              <span className="text-primary font-mono font-bold">{Math.round((completedWeeks.size / 12) * 100)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full gradient-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedWeeks.size / 12) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Week Cards */}
        <div className="space-y-3">
          <h3 className="font-display text-base font-bold text-foreground">Weekly Modules</h3>
          {weeks.map((week, i) => {
            const isCompleted = completedWeeks.has(week.week_number);
            const isCurrent = week.week_number === currentWeek;
            const isLocked = week.week_number > currentWeek;
            const isExpanded = expandedWeek === week.week_number;
            const moduleExercises = exercisesByModule[week.id] || [];

            return (
              <motion.div
                key={week.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <button
                  onClick={() => setExpandedWeek(isExpanded ? null : week.week_number)}
                  className={`w-full text-left rounded-xl border transition-all ${
                    isCurrent
                      ? "border-primary/50 bg-primary/5 glow-primary"
                      : isCompleted
                      ? "border-wellness-green/30 bg-wellness-green/5"
                      : isLocked
                      ? "border-border/30 bg-secondary/20 opacity-60"
                      : "border-border bg-card/40"
                  } p-4`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-wellness-green/20"
                        : isCurrent
                        ? "gradient-primary"
                        : "bg-secondary"
                    }`}>
                      {isCompleted ? (
                        <Check className="w-5 h-5 text-wellness-green" />
                      ) : isLocked ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <span className="font-display text-sm font-bold text-foreground">{week.week_number}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground">
                        Week {week.week_number}
                        {isCurrent && <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full gradient-primary text-primary-foreground">CURRENT</span>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{week.focus_text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{moduleExercises.length} exercises</span>
                      <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                    </div>
                  </div>
                </button>

                {/* Expanded exercise list */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 ml-6 space-y-2"
                  >
                    {moduleExercises.map((me) => (
                      <button
                        key={me.id}
                        onClick={() => navigate(`/exercise/${me.exercise?.id}`, { state: { moduleExercise: me, weekNumber: week.week_number, programId } })}
                        className="w-full text-left glass rounded-lg p-3 flex items-center gap-3 hover:border-primary/30 transition-all active:scale-[0.98]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="font-display text-xs font-bold text-primary">{me.sequence_label}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{me.exercise?.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {[me.sets && `${me.sets} sets`, me.reps && `${me.reps}`, me.frequency].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    ))}

                    {isCurrent && !isLocked && (
                      <Button
                        onClick={() => navigate(`/player/${programId}`)}
                        className="w-full gradient-primary text-primary-foreground font-display glow-primary mt-2"
                      >
                        Start Week {week.week_number}
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Add to Plan button */}
      <div className="fixed bottom-6 left-4 z-40">
        <button
          onClick={isEnrolled ? undefined : handleEnroll}
          disabled={enrolling || isEnrolled}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-display font-semibold transition-all active:scale-95 ${
            isEnrolled
              ? "bg-wellness-green/20 text-wellness-green border border-wellness-green/30"
              : "gradient-primary text-primary-foreground glow-primary"
          }`}
        >
          {isEnrolled ? (
            <><CheckCircle className="w-4 h-4" /> In My Plan</>
          ) : (
            <><Plus className="w-4 h-4" /> {enrolling ? "Adding..." : "Add to My Plan"}</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProgramOverview;
