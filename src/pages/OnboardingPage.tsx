import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Target, MapPin, Zap, AlertTriangle, Clock, Briefcase,
  Calendar, Timer, Wrench, ArrowRight, ArrowLeft, Check
} from "lucide-react";

const STEPS = [
  { id: "goal", title: "What's your main goal?", icon: Target },
  { id: "area", title: "Choose your primary area", icon: MapPin },
  { id: "fitness", title: "How would you describe yourself?", icon: Zap },
  { id: "challenge", title: "What's most challenging?", icon: AlertTriangle },
  { id: "pain", title: "Rate any pain or discomfort", icon: AlertTriangle },
  { id: "duration", title: "How long has this been going on?", icon: Clock },
  { id: "routine", title: "Your typical daily routine", icon: Briefcase },
  { id: "days", title: "How many days per week?", icon: Calendar },
  { id: "session", title: "Session duration preference", icon: Timer },
  { id: "equipment", title: "Equipment access", icon: Wrench },
];

const GOALS = [
  { value: "pain_relief", label: "Pain Relief", emoji: "🩹" },
  { value: "flexibility", label: "Flexibility & Mobility", emoji: "🧘" },
  { value: "posture", label: "Posture Correction", emoji: "🏋️" },
  { value: "strength", label: "Strength & Performance", emoji: "💪" },
  { value: "stress", label: "Stress Reduction", emoji: "🧠" },
];

const AREAS = [
  "Head/Neck", "Shoulders", "Upper Back", "Lower Back",
  "Hips", "Knees", "Ankles/Feet", "Full Body",
];

const FITNESS_LEVELS = [
  { value: "beginner", label: "Just Getting Started", desc: "I want to start moving again" },
  { value: "intermediate", label: "Building Consistency", desc: "I'm active but need structure" },
  { value: "advanced", label: "Training Regularly", desc: "I want to push my performance" },
];

const CHALLENGES = [
  { value: "pain_at_work", label: "Pain during work" },
  { value: "stress", label: "Stress/energy" },
  { value: "consistency", label: "Staying consistent" },
  { value: "none", label: "None of the above" },
];

const PAIN_DURATIONS = [
  { value: "acute", label: "0-4 weeks (Acute)" },
  { value: "subacute", label: "4-12 weeks (Subacute)" },
  { value: "chronic", label: "Over 12 weeks (Chronic)" },
  { value: "unsure", label: "Not sure" },
];

const ROUTINES = [
  { value: "sitting", label: "Mostly sitting", emoji: "🪑" },
  { value: "standing", label: "Mostly standing", emoji: "🧍" },
  { value: "physical", label: "Heavy lifting/physical", emoji: "🏗️" },
  { value: "mixed", label: "Mixed activities", emoji: "🔄" },
];

const SESSION_DURATIONS = [
  { value: "5min_daily", label: "5-min daily resets" },
  { value: "15min", label: "15-minute sessions" },
  { value: "main_only", label: "Just main program" },
  { value: "mix", label: "Mix of both" },
];

const EQUIPMENT = [
  "Chair", "Wall space", "Foam roller", "Resistance band",
  "Dumbbells", "Yoga mat", "Yoga Blocks", "None needed",
];

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    goal: "", area: "", fitness: "", challenge: "",
    pain: 0, painDuration: "", routine: "", days: 3,
    session: "", equipment: [] as string[],
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  const updateField = (field: string, value: any) => setData(p => ({ ...p, [field]: value }));

  const toggleEquipment = (item: string) => {
    setData(p => ({
      ...p,
      equipment: p.equipment.includes(item)
        ? p.equipment.filter(e => e !== item)
        : [...p.equipment, item],
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 0: return !!data.goal;
      case 1: return !!data.area;
      case 2: return !!data.fitness;
      case 3: return !!data.challenge;
      case 4: return true;
      case 5: return !!data.painDuration;
      case 6: return !!data.routine;
      case 7: return data.days > 0;
      case 8: return !!data.session;
      case 9: return data.equipment.length > 0;
      default: return false;
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from("profiles").update({
        main_goal: data.goal,
        primary_area: data.area,
        fitness_level: data.fitness,
        current_challenge: data.challenge,
        pain_score: data.pain,
        pain_duration: data.painDuration,
        daily_routine: data.routine,
        weekly_days: data.days,
        session_duration: data.session,
        equipment: data.equipment,
        onboarding_completed: true,
      }).eq("user_id", user.id);

      if (error) throw error;
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleNext = () => {
    if (step === STEPS.length - 1) {
      handleComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3">
            {GOALS.map(g => (
              <OptionCard
                key={g.value}
                selected={data.goal === g.value}
                onClick={() => updateField("goal", g.value)}
                label={`${g.emoji} ${g.label}`}
              />
            ))}
          </div>
        );
      case 1:
        return (
          <div className="grid grid-cols-2 gap-3">
            {AREAS.map(a => (
              <OptionCard
                key={a}
                selected={data.area === a}
                onClick={() => updateField("area", a)}
                label={a}
                compact
              />
            ))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-3">
            {FITNESS_LEVELS.map(f => (
              <OptionCard
                key={f.value}
                selected={data.fitness === f.value}
                onClick={() => updateField("fitness", f.value)}
                label={f.label}
                description={f.desc}
              />
            ))}
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            {CHALLENGES.map(c => (
              <OptionCard
                key={c.value}
                selected={data.challenge === c.value}
                onClick={() => updateField("challenge", c.value)}
                label={c.label}
              />
            ))}
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="font-display text-5xl font-bold text-primary">{data.pain}</span>
              <p className="text-muted-foreground text-sm mt-1">
                {data.pain === 0 ? "No pain" : data.pain <= 3 ? "Mild" : data.pain <= 6 ? "Moderate" : "Severe"}
              </p>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              value={data.pain}
              onChange={e => updateField("pain", Number(e.target.value))}
              className="w-full accent-primary h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span><span>5</span><span>10</span>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-3">
            {PAIN_DURATIONS.map(d => (
              <OptionCard
                key={d.value}
                selected={data.painDuration === d.value}
                onClick={() => updateField("painDuration", d.value)}
                label={d.label}
              />
            ))}
          </div>
        );
      case 6:
        return (
          <div className="space-y-3">
            {ROUTINES.map(r => (
              <OptionCard
                key={r.value}
                selected={data.routine === r.value}
                onClick={() => updateField("routine", r.value)}
                label={`${r.emoji} ${r.label}`}
              />
            ))}
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <span className="font-display text-5xl font-bold text-primary">{data.days}</span>
              <p className="text-muted-foreground text-sm mt-1">days per week</p>
            </div>
            <input
              type="range"
              min={1}
              max={7}
              value={data.days}
              onChange={e => updateField("days", Number(e.target.value))}
              className="w-full accent-primary h-2 rounded-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span><span>4</span><span>7</span>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-3">
            {SESSION_DURATIONS.map(s => (
              <OptionCard
                key={s.value}
                selected={data.session === s.value}
                onClick={() => updateField("session", s.value)}
                label={s.label}
              />
            ))}
          </div>
        );
      case 9:
        return (
          <div className="grid grid-cols-2 gap-3">
            {EQUIPMENT.map(e => (
              <OptionCard
                key={e}
                selected={data.equipment.includes(e)}
                onClick={() => toggleEquipment(e)}
                label={e}
                compact
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col safe-top">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-3 mb-4">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="text-muted-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full gradient-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {step + 1}/{STEPS.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex flex-col"
          >
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              {STEPS[step].title}
            </h2>
            <div className="flex-1">{renderStep()}</div>
          </motion.div>
        </AnimatePresence>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          className="w-full h-12 gradient-primary text-primary-foreground font-display font-semibold mt-6 glow-primary disabled:opacity-40"
        >
          {step === STEPS.length - 1 ? (
            <>Complete Setup <Check className="w-4 h-4 ml-2" /></>
          ) : (
            <>Continue <ArrowRight className="w-4 h-4 ml-2" /></>
          )}
        </Button>
      </div>
    </div>
  );
};

const OptionCard = ({
  selected, onClick, label, description, compact,
}: {
  selected: boolean; onClick: () => void; label: string;
  description?: string; compact?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left rounded-xl border transition-all duration-200 ${
      compact ? "p-3" : "p-4"
    } ${
      selected
        ? "border-primary bg-primary/10 glow-primary"
        : "border-border bg-secondary/50 hover:border-primary/30"
    }`}
  >
    <span className={`font-medium text-foreground ${compact ? "text-sm" : ""}`}>{label}</span>
    {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
  </button>
);

export default OnboardingPage;
