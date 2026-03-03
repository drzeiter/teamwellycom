import { motion } from "framer-motion";
import { Wind, Dumbbell, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ActionHubProps {
  programs: any[];
}

const tiles = [
  {
    id: "reset",
    label: "Reset",
    subtitle: "Breathwork & Mobility",
    icon: <Wind className="w-6 h-6" />,
    gradient: "from-[hsl(174,72%,50%)] to-[hsl(190,80%,40%)]",
    glow: "hsl(174 72% 50% / 0.3)",
    target: "Relax",
    fallback: "quick_reset",
  },
  {
    id: "train",
    label: "Train",
    subtitle: "Program Session",
    icon: <Dumbbell className="w-6 h-6" />,
    gradient: "from-[hsl(45,90%,55%)] to-[hsl(35,85%,45%)]",
    glow: "hsl(45 90% 55% / 0.3)",
    target: null,
    fallback: null,
  },
  {
    id: "recover",
    label: "Recover",
    subtitle: "HRV & Nervous System",
    icon: <Heart className="w-6 h-6" />,
    gradient: "from-[hsl(260,60%,55%)] to-[hsl(280,50%,45%)]",
    glow: "hsl(260 60% 55% / 0.3)",
    target: "Relax",
    fallback: "Relax",
  },
];

const ActionHub = ({ programs }: ActionHubProps) => {
  const navigate = useNavigate();

  const handleTap = (tile: typeof tiles[0]) => {
    if (tile.id === "train") {
      // Navigate to first 12-week program or program list
      const twelveWeek = programs.find((p) => (p.duration_weeks || 0) >= 12);
      if (twelveWeek) navigate(`/program/${twelveWeek.id}`);
      return;
    }
    const match = programs.find((p) =>
      tile.target ? p.target_area === tile.target : p.category_type === tile.fallback
    );
    if (match) navigate(`/player/${match.id}`);
  };

  return (
    <div>
      <h2 className="font-display text-base font-bold text-foreground mb-1">Optimize Your Day</h2>
      <p className="text-xs text-muted-foreground mb-3">Choose your focus</p>
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((tile, i) => (
          <motion.button
            key={tile.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => handleTap(tile)}
            className="relative rounded-2xl p-4 pt-5 flex flex-col items-center gap-2 text-center overflow-hidden group"
            style={{ boxShadow: `0 0 20px -5px ${tile.glow}` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tile.gradient} opacity-15 group-hover:opacity-25 transition-opacity`} />
            <div className="absolute inset-0 glass" />
            <div className="relative z-10">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tile.gradient} flex items-center justify-center text-primary-foreground mb-1`}>
                {tile.icon}
              </div>
              <span className="font-display text-sm font-bold text-foreground block">{tile.label}</span>
              <span className="text-[9px] text-muted-foreground leading-tight">{tile.subtitle}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ActionHub;
