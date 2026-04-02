import { motion } from "framer-motion";
import { ChevronRight, Play } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

const AREA_ICONS: Record<string, string> = {
  "Low Back": "🔻", "Hips": "🦴", "Shoulders": "💪", "Neck": "🦒",
  "Foot/Ankle": "🦶", "Knee": "🦵",
};

interface ProgramsTabProps {
  programs: any[];
  navigate: any;
}

export default function ProgramsTab({ programs, navigate }: ProgramsTabProps) {
  return (
    <div className="pt-6 px-5">
      <div className="flex items-center gap-3 mb-6">
        <img src={logoWhite} alt="" className="h-7 w-auto" />
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Programs</h1>
          <p className="text-muted-foreground text-xs">12-week progressive programs</p>
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center">
          <p className="text-muted-foreground text-sm">No programs available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((program, i) => (
            <motion.button
              key={program.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/program/${program.id}`)}
              className="w-full glass rounded-2xl p-5 text-left hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-2xl shrink-0 group-hover:shadow-lg transition-shadow">
                  {AREA_ICONS[program.target_area] || "🏋️"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-foreground text-base truncate">{program.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {program.description ? program.description.slice(0, 50) : "Reduce pain and restore movement."}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">12 weeks</span>
                    <span className="text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{program.target_area}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}
