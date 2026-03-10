import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import ExerciseAvatar from "@/components/ExerciseAvatar";
import BreathingVisualizer from "@/components/BreathingVisualizer";
import ConfettiEffect from "@/components/ConfettiEffect";
import {
  ArrowLeft, Play, Pause, SkipForward,
  Trophy, Zap, ChevronLeft, ChevronRight, Check, Flame, Plus, CheckCircle,
} from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

interface Exercise {
  id: string;
  name: string;
  duration_seconds: number;
  is_bilateral: boolean;
  sequence_order: number;
  instruction_text: string | null;
}

interface ProgramInfo {
  id: string;
  name: string;
  target_area: string;
  duration_minutes: number;
  exercise_count: number;
  category: string;
}

const MOTIVATIONAL_MESSAGES = [
  "You're crushing it! 💪",
  "Keep going, warrior! 🔥",
  "Almost there! 🎯",
  "Feel that stretch! 🧘",
  "Your body thanks you! ✨",
  "Breathe deep... 🌊",
  "Stay present 🧠",
  "Great form! 👏",
];

const ExercisePlayer = () => {
  const { programId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [program, setProgram] = useState<ProgramInfo | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [side, setSide] = useState<"left" | "right" | null>(null);
  const [completed, setCompleted] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showMotivation, setShowMotivation] = useState("");
  const [exerciseXP, setExerciseXP] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!programId) return;
    const fetchData = async () => {
      const [progRes, exRes] = await Promise.all([
        supabase.from("programs").select("*").eq("id", programId).single(),
        supabase.from("exercises").select("*").eq("program_id", programId).order("sequence_order"),
      ]);
      if (progRes.data) setProgram(progRes.data);
      // Check enrollment
      if (user) {
        const { data: enrollData } = await (supabase as any)
          .from("user_enrolled_programs")
          .select("id")
          .eq("user_id", user.id)
          .eq("program_id", programId)
          .eq("is_active", true);
        if (enrollData && enrollData.length > 0) setIsEnrolled(true);
      }
      if (exRes.data && exRes.data.length > 0) {
        setExercises(exRes.data);
        const first = exRes.data[0];
        setTimeLeft(first.is_bilateral ? Math.floor(first.duration_seconds / 2) : first.duration_seconds);
        setSide(first.is_bilateral ? "left" : null);
      }
    };
    fetchData();
  }, [programId, user]);

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

  const currentExercise = exercises[currentIndex];

  // Show random motivation every 30 seconds
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      const msg = MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];
      setShowMotivation(msg);
      setTimeout(() => setShowMotivation(""), 2500);
    }, 15000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const moveToNext = useCallback(() => {
    if (!currentExercise) return;

    if (currentExercise.is_bilateral && side === "left") {
      setSide("right");
      setTimeLeft(Math.floor(currentExercise.duration_seconds / 2));
      return;
    }

    const pointsForExercise = 5;
    setTotalPoints(p => p + pointsForExercise);
    setExerciseXP(pointsForExercise);
    setTimeout(() => setExerciseXP(0), 1500);

    if (currentIndex < exercises.length - 1) {
      const next = exercises[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(next.is_bilateral ? Math.floor(next.duration_seconds / 2) : next.duration_seconds);
      setSide(next.is_bilateral ? "left" : null);
    } else {
      setIsPlaying(false);
      setCompleted(true);
      saveProgress();
    }
  }, [currentExercise, side, currentIndex, exercises]);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          moveToNext();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, moveToNext]);

  const saveProgress = async () => {
    if (!user || !programId) return;
    const bonusPoints = totalPoints + 10;
    try {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        program_id: programId,
        session_duration_seconds: program?.duration_minutes ? program.duration_minutes * 60 : 0,
        points_earned: bonusPoints,
      });

      const { data: current } = await supabase
        .from("welly_points").select("*").eq("user_id", user.id).single();

      if (current) {
        const today = new Date().toISOString().split("T")[0];
        const lastDate = current.last_activity_date;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        const newStreak = lastDate === yesterday ? current.current_streak + 1 : lastDate === today ? current.current_streak : 1;

        await supabase.from("welly_points").update({
          total_points: current.total_points + bonusPoints,
          current_streak: newStreak,
          longest_streak: Math.max(current.longest_streak, newStreak),
          last_activity_date: today,
        }).eq("user_id", user.id);
      }
      setTotalPoints(bonusPoints);
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  if (completed) {
    return (
      <>
        <ConfettiEffect trigger={true} />
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-28 h-28 rounded-full gradient-gold flex items-center justify-center mb-6 glow-primary"
          >
            <Trophy className="w-14 h-14 text-primary-foreground" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-display text-3xl font-bold text-foreground mb-2"
          >
            Incredible Work! 🎉
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground mb-2"
          >
            You completed {program?.name}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2 text-wellness-coral text-sm font-medium mb-8"
          >
            <Flame className="w-4 h-4" /> Streak maintained!
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass rounded-2xl p-6 w-full max-w-xs text-center mb-4"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-wellness-gold" />
              <motion.span
                className="font-display text-4xl font-bold text-gradient-gold"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.3, 1] }}
                transition={{ delay: 1, duration: 0.5 }}
              >
                +{totalPoints}
              </motion.span>
            </div>
            <p className="text-muted-foreground text-sm">WellyPoints Earned</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="glass rounded-2xl p-4 w-full max-w-xs text-center mb-8"
          >
            <p className="text-sm text-muted-foreground">
              {exercises.length} exercises completed · {program?.duration_minutes} min
            </p>
          </motion.div>
          <Button
            onClick={() => navigate("/")}
            className="gradient-primary text-primary-foreground font-display w-full max-w-xs h-12 glow-primary"
          >
            Return to Lobby
          </Button>
        </div>
      </>
    );
  }

  if (!program || exercises.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading program...</p>
        </div>
      </div>
    );
  }

  const progressPercent = ((currentIndex + (side === "right" ? 0.5 : 0)) / exercises.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalDuration = currentExercise?.is_bilateral ? currentExercise.duration_seconds / 2 : currentExercise?.duration_seconds || 1;
  const timerProgress = 1 - timeLeft / totalDuration;
  const isLowTime = timeLeft <= 5 && timeLeft > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top">
      {/* XP Popup */}
      <AnimatePresence>
        {exerciseXP > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -20, scale: 1 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-16 right-6 z-50 flex items-center gap-1 px-3 py-1.5 rounded-full gradient-gold text-primary-foreground font-display font-bold text-sm"
          >
            <Zap className="w-3 h-3" /> +{exerciseXP} XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Motivation Toast */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full glass text-sm font-medium text-foreground"
          >
            {showMotivation}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <img src={logoWhite} alt="Team Welly" className="h-5 w-auto" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{program.name}</p>
          <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full gradient-primary rounded-full"
              animate={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-wellness-gold" />
          <span className="text-xs text-wellness-gold font-mono font-bold">{totalPoints}</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {currentIndex + 1}/{exercises.length}
        </span>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentIndex}-${side}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center w-full"
          >
            {/* Avatar or Breathing Visualizer */}
            {program?.target_area === "Relax" ? (
              <BreathingVisualizer
                exerciseName={currentExercise?.name || ""}
                isPlaying={isPlaying}
              />
            ) : (
              <ExerciseAvatar
                exerciseName={currentExercise?.name || ""}
                side={side}
                isPlaying={isPlaying}
                className="w-44 h-44 mx-auto mb-6"
              />
            )}

            {/* Exercise name + prescription */}
            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              {currentExercise?.name}
            </h2>

            {/* Side indicator */}
            {side && (
              <span className="inline-block px-3 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                {side} side
              </span>
            )}

            {currentExercise?.instruction_text && (
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-3">
                {currentExercise.instruction_text}
              </p>
            )}

            {/* Duration & rep info bar */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80">
                <Play className="w-3 h-3 text-primary" />
                <span className="text-xs font-medium text-foreground">
                  {currentExercise?.duration_seconds
                    ? currentExercise.duration_seconds >= 60
                      ? `${Math.floor(currentExercise.duration_seconds / 60)}m ${currentExercise.duration_seconds % 60 > 0 ? `${currentExercise.duration_seconds % 60}s` : ""}`
                      : `${currentExercise.duration_seconds}s`
                    : "--"}
                </span>
              </div>
              {currentExercise?.is_bilateral && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80">
                  <span className="text-xs font-medium text-foreground">⟷ Both Sides</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/80">
                <span className="text-xs text-muted-foreground">{currentIndex + 1} of {exercises.length}</span>
              </div>
            </div>

            {/* Timer */}
            <div className="relative w-36 h-36 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                <motion.circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke={isLowTime ? "hsl(var(--wellness-coral))" : "hsl(var(--primary))"}
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - timerProgress)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  className={`font-display text-3xl font-bold ${isLowTime ? "text-wellness-coral" : "text-foreground"}`}
                  animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
                >
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </motion.span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="px-6 pb-8 safe-bottom">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => {
              if (currentIndex > 0) {
                const prev = exercises[currentIndex - 1];
                setCurrentIndex(currentIndex - 1);
                setTimeLeft(prev.is_bilateral ? Math.floor(prev.duration_seconds / 2) : prev.duration_seconds);
                setSide(prev.is_bilateral ? "left" : null);
                setIsPlaying(false);
              }
            }}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground disabled:opacity-30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <motion.button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center glow-primary"
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
            )}
          </motion.button>

          <button
            onClick={moveToNext}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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

export default ExercisePlayer;
