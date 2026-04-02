import { motion } from "framer-motion";
import { Play } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

const AREA_ICONS: Record<string, string> = {
  "Low Back": "🔻", "Hips": "🦴", "Shoulders": "💪", "Neck": "🦒",
  "Desk": "🖥️", "Full Body": "🧘", "Warm-Up": "🔥", "Relax": "🫁",
};

interface QuickResetsTabProps {
  programs: any[];
  navigate: any;
}

export default function QuickResetsTab({ programs, navigate }: QuickResetsTabProps) {
  // Filter to quick reset type programs
  const resets = programs.filter(p =>
    p.category_type === "quick_reset" ||
    p.duration_minutes <= 10 ||
    p.target_area === "Desk" ||
    p.target_area === "Relax"
  );

  return (
    <div className="pt-6 px-5">
      <div className="flex items-center gap-3 mb-2">
        <img src={logoWhite} alt="" className="h-7 w-auto" />
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Quick Resets</h1>
          <p className="text-muted-foreground text-xs">5-minute guided sessions</p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-5">Tap to start a quick movement session. Perfect for breaks throughout your day.</p>

      {resets.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">No quick sessions available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {resets.map((program, i) => (
            <motion.button
              key={program.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/player/${program.id}`)}
              className="glass rounded-2xl p-5 text-left hover:border-primary/20 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-primary/5 -translate-y-4 translate-x-4" />
              <div className="text-3xl mb-3">{AREA_ICONS[program.target_area] || "🏋️"}</div>
              <h4 className="font-display font-bold text-foreground text-sm leading-tight mb-1">{program.name}</h4>
              <p className="text-[10px] text-muted-foreground mb-3">{program.duration_minutes} min · {program.exercise_count} exercises</p>
              <div className="flex items-center gap-1 text-[10px] font-medium text-primary">
                <Play className="w-3 h-3" fill="currentColor" /> Start
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
