import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { TrendingUp, Heart, Brain } from "lucide-react";

interface WellyScoreRingProps {
  score: number;
  recovery: number;
  mobility: number;
  stress: number;
}

const MiniRing = ({ value, label, color, icon, delay }: { value: number; label: string; color: string; icon: React.ReactNode; delay: number }) => {
  const circumference = 2 * Math.PI * 22;
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={() => setExpanded(!expanded)}
      className="flex flex-col items-center gap-1 active:scale-95 transition-transform"
    >
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="22" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
          <motion.circle
            cx="24" cy="24" r="22" fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (value / 100) * circumference }}
            transition={{ duration: 1.2, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {icon}
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">{label}</span>
      <span className="text-xs font-display font-bold text-foreground">{value}</span>
    </motion.button>
  );
};

const AnimatedCounter = ({ target }: { target: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, { duration: 1.5, ease: "easeOut" });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => { controls.stop(); unsub(); };
  }, [target]);

  return <>{display}</>;
};

const WellyScoreRing = ({ score, recovery, mobility, stress }: WellyScoreRingProps) => {
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="flex flex-col items-center">
      {/* Main ring */}
      <div className="relative w-36 h-36 mb-5">
        {/* Glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ boxShadow: ["0 0 20px 4px hsl(174 72% 50% / 0.15)", "0 0 35px 8px hsl(174 72% 50% / 0.25)", "0 0 20px 4px hsl(174 72% 50% / 0.15)"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke="url(#scoreGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.3 }}
          />
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(174, 72%, 50%)" />
              <stop offset="100%" stopColor="hsl(190, 80%, 40%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-display text-4xl font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            <AnimatedCounter target={score} />
          </motion.span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Welly Score</span>
        </div>
      </div>

      {/* Mini rings */}
      <div className="flex items-center justify-center gap-8">
        <MiniRing value={recovery} label="Recovery" color="hsl(150, 60%, 45%)" icon={<Heart className="w-4 h-4 text-wellness-green" />} delay={0.4} />
        <MiniRing value={mobility} label="Mobility" color="hsl(174, 72%, 50%)" icon={<TrendingUp className="w-4 h-4 text-primary" />} delay={0.5} />
        <MiniRing value={100 - stress} label="Calm" color="hsl(260, 60%, 55%)" icon={<Brain className="w-4 h-4 text-wellness-purple" />} delay={0.6} />
      </div>
    </div>
  );
};

export default WellyScoreRing;
