import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";

interface WellyScoreRingProps {
  score: number;
  message: string;
  onInfoTap?: () => void;
}

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

const WellyScoreRing = ({ score, message, onInfoTap }: WellyScoreRingProps) => {
  const size = 180;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Subtle glow */}
        <motion.div
          className="absolute inset-2 rounded-full"
          animate={{
            boxShadow: [
              "0 0 15px 2px hsl(174 72% 50% / 0.1)",
              "0 0 25px 5px hsl(174 72% 50% / 0.18)",
              "0 0 15px 2px hsl(174 72% 50% / 0.1)",
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Background ring */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth={strokeWidth}
          />
        </svg>

        {/* Gradient progress ring */}
        <svg width={size} height={size} className="absolute inset-0 -rotate-90">
          <defs>
            <linearGradient id="wellyScoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(174 72% 50%)" />
              <stop offset="100%" stopColor="hsl(190 80% 40%)" />
            </linearGradient>
          </defs>
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#wellyScoreGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-display text-5xl font-bold text-foreground"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <AnimatedCounter target={score} />
          </motion.span>
          <span className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mt-0.5">
            Welly Score
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/70 text-center">Today's Consistency Score</p>
      <p className="text-sm text-muted-foreground text-center max-w-[260px] leading-relaxed">{message}</p>
      {onInfoTap && (
        <button
          onClick={onInfoTap}
          className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          How is this calculated?
        </button>
      )}
    </div>
  );
};

export default WellyScoreRing;
