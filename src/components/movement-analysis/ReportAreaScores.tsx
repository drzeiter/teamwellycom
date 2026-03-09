import { motion } from "framer-motion";
import { Activity } from "lucide-react";

const AREA_LABELS: Record<string, string> = {
  ankles: "Ankles", knees: "Knees", hips: "Hips", core: "Core", shoulders: "Shoulders",
  head_neck: "Head & Neck", thoracic: "Thoracic", lumbar: "Lumbar", pelvis: "Pelvis",
  foot_strike: "Foot Strike", knee_mechanics: "Knee Mechanics", hip_stability: "Hip Stability",
  trunk_control: "Trunk Control", arm_mechanics: "Arm Mechanics", symmetry: "Symmetry",
};

const AREA_EMOJIS: Record<string, string> = {
  ankles: "🦶", knees: "🦵", hips: "🦴", core: "🧘", shoulders: "💪",
  head_neck: "🧠", thoracic: "🫁", lumbar: "🔙", pelvis: "⚖️",
  foot_strike: "👟", knee_mechanics: "🦵", hip_stability: "🦴", trunk_control: "🧘", arm_mechanics: "💪", symmetry: "⚖️",
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  return "text-destructive";
};

export default function ReportAreaScores({ areaScores }: { areaScores: Record<string, number> }) {
  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" /> Area Scores
      </h3>
      <div className="space-y-3">
        {Object.entries(areaScores).map(([key, score]) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-lg">{AREA_EMOJIS[key] || "🏋️"}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{AREA_LABELS[key] || key}</span>
                <span className={`text-xs font-bold ${scoreColor(score)}`}>{score}</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full rounded-full"
                  style={{
                    background: score >= 80 ? "hsl(150, 60%, 45%)" : score >= 60 ? "hsl(45, 90%, 50%)" : "hsl(0, 72%, 51%)"
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
