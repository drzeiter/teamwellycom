import { useState } from "react";
import { motion } from "framer-motion";
import { Footprints, Trophy, TrendingUp, Zap } from "lucide-react";

interface StepTrackerProps {
  dailySteps: number;
  dailyGoal: number;
  weeklySteps: number[];
}

const STEP_MILESTONES = [
  { steps: 5000, emoji: "🥉", label: "Bronze Walker", points: 10 },
  { steps: 7500, emoji: "🥈", label: "Silver Strider", points: 20 },
  { steps: 10000, emoji: "🥇", label: "Gold Mover", points: 30 },
  { steps: 15000, emoji: "💎", label: "Diamond Athlete", points: 50 },
];

const StepTracker = ({ dailySteps, dailyGoal, weeklySteps }: StepTrackerProps) => {
  const progress = Math.min((dailySteps / dailyGoal) * 100, 100);
  const nextMilestone = STEP_MILESTONES.find(m => dailySteps < m.steps);
  const achieved = STEP_MILESTONES.filter(m => dailySteps >= m.steps);
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const maxWeekly = Math.max(...weeklySteps, dailyGoal);

  return (
    <div className="space-y-4">
      {/* Daily progress circle */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - progress / 100) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Footprints className="w-4 h-4 text-primary mb-0.5" />
              <p className="text-xs font-bold text-foreground font-mono">{Math.round(progress)}%</p>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-display text-2xl font-bold text-foreground">{dailySteps.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">of {dailyGoal.toLocaleString()} step goal</p>
            {nextMilestone && (
              <p className="text-xs text-primary mt-1">
                {nextMilestone.emoji} {(nextMilestone.steps - dailySteps).toLocaleString()} to {nextMilestone.label}
              </p>
            )}
          </div>
        </div>

        {/* Achieved milestones */}
        {achieved.length > 0 && (
          <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
            {achieved.map((m, i) => (
              <motion.div
                key={m.steps}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-xs"
              >
                <span>{m.emoji}</span>
                <span className="text-wellness-gold font-mono">+{m.points}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly chart */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium text-foreground">This Week</p>
        </div>
        <div className="flex items-end gap-1.5 h-16">
          {weeklySteps.map((steps, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <motion.div
                className="w-full rounded-t-sm"
                style={{ background: steps >= dailyGoal ? "hsl(var(--primary))" : "hsl(var(--secondary))" }}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max((steps / maxWeekly) * 100, 5)}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              />
              <span className="text-[9px] text-muted-foreground">{dayLabels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StepTracker;
