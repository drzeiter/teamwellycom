import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Check, Target, Repeat, AlertTriangle, Tag, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExerciseAvatar from "@/components/ExerciseAvatar";
import logoWhite from "@/assets/logo-white.png";

interface CanonicalExercise {
  id: string;
  name: string;
  category: string;
  description: string | null;
  cues: any;
  common_mistakes: any;
  regressions: string | null;
  progressions: string | null;
  media_spec: any;
  tags: string[] | null;
  is_bilateral: boolean | null;
}

const CATEGORY_COLORS: Record<string, string> = {
  mobility: "bg-wellness-green/10 text-wellness-green",
  stability: "bg-primary/10 text-primary",
  strength: "bg-wellness-gold/10 text-wellness-gold",
  power: "bg-wellness-coral/10 text-wellness-coral",
};

const ExerciseDetail = () => {
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [exercise, setExercise] = useState<CanonicalExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [currentCue, setCurrentCue] = useState<string | null>(null);

  const handleCueChange = useCallback((cue: string | null) => {
    setCurrentCue(cue);
  }, []);

  const moduleExercise = location.state?.moduleExercise;
  const weekNumber = location.state?.weekNumber;
  const programId = location.state?.programId;

  useEffect(() => {
    if (!exerciseId) return;
    supabase
      .from("canonical_exercises")
      .select("*")
      .eq("id", exerciseId)
      .single()
      .then(({ data }) => {
        if (data) setExercise(data as CanonicalExercise);
        setLoading(false);
      });
  }, [exerciseId]);

  const handleMarkComplete = async () => {
    if (!user || !programId) return;
    try {
      await supabase.from("user_progress").insert({
        user_id: user.id,
        program_id: programId,
        exercise_id: exerciseId,
        points_earned: 5,
        session_duration_seconds: 0,
      });
      setCompleted(true);
      toast({ title: "Exercise completed! ✅", description: "+5 WellyPoints earned" });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Exercise not found</p>
      </div>
    );
  }

  const cues = Array.isArray(exercise.cues) ? exercise.cues : [];
  const mistakes = Array.isArray(exercise.common_mistakes) ? exercise.common_mistakes : [];
  const mediaSpec = exercise.media_spec && typeof exercise.media_spec === "object" ? exercise.media_spec : {};
  const tags = exercise.tags || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-strong">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img src={logoWhite} alt="Team Welly" className="h-6 w-auto" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-base font-bold text-foreground truncate">{exercise.name}</h1>
            {weekNumber && <p className="text-xs text-muted-foreground">Week {weekNumber}</p>}
          </div>
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${CATEGORY_COLORS[exercise.category] || "bg-secondary text-muted-foreground"}`}>
            {exercise.category}
          </span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Avatar Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-6 flex flex-col items-center gap-4"
        >
          <ExerciseAvatar
            exerciseName={exercise.name}
            isPlaying={isPlaying}
            side={exercise.is_bilateral ? "left" : null}
            className="w-48 h-48"
            onCueChange={handleCueChange}
          />
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isPlaying ? "bg-secondary text-foreground" : "gradient-primary text-primary-foreground glow-primary"
            }`}
          >
            <Play className="w-4 h-4" />
            {isPlaying ? "Pause Demo" : "Play Demo"}
          </button>
          {/* Cue text - visible below the button */}
          <AnimatePresence mode="wait">
            {currentCue && (
              <motion.div
                key={currentCue}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="w-full text-center"
              >
                <p className="text-xs font-medium text-primary bg-primary/10 rounded-lg px-4 py-2">
                  {currentCue}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Description */}
        {exercise.description && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-2">About</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{exercise.description}</p>
          </motion.div>
        )}

        {/* Prescription — enhanced with timer-style UI */}
        {moduleExercise && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">📋 Your Prescription</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {moduleExercise.sets && (
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <p className="font-display text-2xl font-bold text-primary">{moduleExercise.sets}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Sets</p>
                </div>
              )}
              {moduleExercise.reps && (
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <p className="font-display text-2xl font-bold text-primary">{moduleExercise.reps}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Reps</p>
                </div>
              )}
              {moduleExercise.hold_duration && (
                <div className="bg-secondary/50 rounded-xl p-3 text-center">
                  <p className="font-display text-2xl font-bold text-wellness-coral">{moduleExercise.hold_duration}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Hold</p>
                </div>
              )}
            </div>
            {moduleExercise.frequency && (
              <div className="bg-primary/5 rounded-xl p-3 flex items-center gap-2 mb-2">
                <span className="text-primary text-sm">🔁</span>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Frequency</p>
                  <p className="font-display text-sm font-bold text-foreground">{moduleExercise.frequency}</p>
                </div>
              </div>
            )}
            {moduleExercise.notes && (
              <div className="bg-wellness-gold/5 rounded-xl p-3 flex items-start gap-2">
                <span className="text-sm mt-0.5">💡</span>
                <p className="text-xs text-muted-foreground italic leading-relaxed">{moduleExercise.notes}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Cues */}
        {cues.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Key Cues
            </h3>
            <ul className="space-y-2">
              {cues.map((cue: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{cue}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Media Spec - Movement Details */}
        {Object.keys(mediaSpec).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-3">🔬 Movement Spec</h3>
            <div className="space-y-3">
              {mediaSpec.starting_position && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Starting Position</p>
                  <p className="text-sm text-foreground">{mediaSpec.starting_position}</p>
                </div>
              )}
              {mediaSpec.joint_actions && Array.isArray(mediaSpec.joint_actions) && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Joint Actions</p>
                  <div className="flex flex-wrap gap-1.5">
                    {mediaSpec.joint_actions.map((action: string, i: number) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-medium">{action}</span>
                    ))}
                  </div>
                </div>
              )}
              {mediaSpec.tempo && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tempo</p>
                  <p className="text-sm text-foreground">{mediaSpec.tempo}</p>
                </div>
              )}
              {mediaSpec.rom_constraints && Array.isArray(mediaSpec.rom_constraints) && (
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">ROM Constraints</p>
                  {mediaSpec.rom_constraints.map((c: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-wellness-coral">
                      <AlertTriangle className="w-3 h-3" /> {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Common Mistakes */}
        {mistakes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-wellness-coral" /> Common Mistakes
            </h3>
            <ul className="space-y-1.5">
              {mistakes.map((m: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-wellness-coral">•</span> {m}
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Regressions / Progressions */}
        {(exercise.regressions || exercise.progressions) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-5">
            <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Repeat className="w-4 h-4 text-wellness-purple" /> Progressions
            </h3>
            {exercise.regressions && (
              <div className="mb-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Regression</p>
                <p className="text-sm text-foreground">{exercise.regressions}</p>
              </div>
            )}
            {exercise.progressions && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Progression</p>
                <p className="text-sm text-foreground">{exercise.progressions}</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary text-muted-foreground text-[11px]">
                <Tag className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Mark Complete */}
        <div className="pb-8">
          <Button
            onClick={handleMarkComplete}
            disabled={completed}
            className={`w-full h-12 font-display font-semibold ${
              completed
                ? "bg-wellness-green/20 text-wellness-green border border-wellness-green/30"
                : "gradient-primary text-primary-foreground glow-primary"
            }`}
          >
            {completed ? (
              <><Check className="w-5 h-5 mr-2" /> Completed!</>
            ) : (
              <><Check className="w-5 h-5 mr-2" /> Mark Complete</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExerciseDetail;
