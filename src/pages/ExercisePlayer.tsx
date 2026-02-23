import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Play, Pause, SkipForward, RotateCcw,
  Trophy, Zap, ChevronLeft, ChevronRight, Check,
} from "lucide-react";

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
}

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

  useEffect(() => {
    if (!programId) return;
    const fetch = async () => {
      const [progRes, exRes] = await Promise.all([
        supabase.from("programs").select("*").eq("id", programId).single(),
        supabase.from("exercises").select("*").eq("program_id", programId).order("sequence_order"),
      ]);
      if (progRes.data) setProgram(progRes.data);
      if (exRes.data && exRes.data.length > 0) {
        setExercises(exRes.data);
        const first = exRes.data[0];
        setTimeLeft(first.is_bilateral ? Math.floor(first.duration_seconds / 2) : first.duration_seconds);
        setSide(first.is_bilateral ? "left" : null);
      }
    };
    fetch();
  }, [programId]);

  const currentExercise = exercises[currentIndex];

  const moveToNext = useCallback(() => {
    if (!currentExercise) return;

    // Handle bilateral - switch sides
    if (currentExercise.is_bilateral && side === "left") {
      setSide("right");
      setTimeLeft(Math.floor(currentExercise.duration_seconds / 2));
      return;
    }

    const pointsForExercise = 5;
    setTotalPoints(p => p + pointsForExercise);

    if (currentIndex < exercises.length - 1) {
      const next = exercises[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setTimeLeft(next.is_bilateral ? Math.floor(next.duration_seconds / 2) : next.duration_seconds);
      setSide(next.is_bilateral ? "left" : null);
    } else {
      // Program complete!
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
    const bonusPoints = totalPoints + 10; // completion bonus
    try {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        program_id: programId,
        session_duration_seconds: program?.duration_minutes ? program.duration_minutes * 60 : 0,
        points_earned: bonusPoints,
      });

      // Update welly points
      const { data: current } = await supabase
        .from("welly_points")
        .select("*")
        .eq("user_id", user.id)
        .single();

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-24 h-24 rounded-full gradient-gold flex items-center justify-center mb-6"
        >
          <Trophy className="w-12 h-12 text-primary-foreground" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-display text-3xl font-bold text-foreground mb-2"
        >
          Great Job! 🎉
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-8"
        >
          You completed {program?.name}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass rounded-2xl p-6 w-full max-w-xs text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-6 h-6 text-wellness-gold" />
            <span className="font-display text-3xl font-bold text-gradient-gold">+{totalPoints}</span>
          </div>
          <p className="text-muted-foreground text-sm">WellyPoints Earned</p>
        </motion.div>
        <Button
          onClick={() => navigate("/")}
          className="gradient-primary text-primary-foreground font-display w-full max-w-xs h-12"
        >
          Return to Lobby
        </Button>
      </div>
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

  const progressPercent = ((currentIndex + 1) / exercises.length) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate("/")} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{program.name}</p>
          <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
            <motion.div
              className="h-full gradient-primary rounded-full"
              animate={{ width: `${progressPercent}%` }}
            />
          </div>
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center w-full"
          >
            {/* Exercise visualization placeholder */}
            <div className="w-48 h-48 rounded-full bg-secondary/50 border-2 border-primary/20 flex items-center justify-center mx-auto mb-8 relative">
              <div className="absolute inset-0 rounded-full animate-pulse-glow border border-primary/10" />
              <span className="text-5xl">
                {currentExercise ? "🧘" : ""}
              </span>
            </div>

            {/* Exercise name */}
            <h2 className="font-display text-xl font-bold text-foreground mb-1">
              {currentExercise?.name}
            </h2>
            {side && (
              <p className="text-primary text-sm font-medium mb-2">
                {side === "left" ? "Left Side" : "Right Side"}
              </p>
            )}
            {currentExercise?.instruction_text && (
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
                {currentExercise.instruction_text}
              </p>
            )}

            {/* Timer */}
            <div className="relative w-40 h-40 mx-auto mb-8">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--secondary))" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - timeLeft / (currentExercise?.is_bilateral ? currentExercise.duration_seconds / 2 : currentExercise?.duration_seconds || 1))}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display text-4xl font-bold text-foreground">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
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

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center glow-primary"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 text-primary-foreground" />
            ) : (
              <Play className="w-6 h-6 text-primary-foreground ml-0.5" />
            )}
          </button>

          <button
            onClick={moveToNext}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExercisePlayer;
