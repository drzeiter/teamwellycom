import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { TrendingUp, Heart, Flame, Wind, ChevronDown } from "lucide-react";

interface Insight {
  id: string;
  icon: React.ReactNode;
  title: string;
  detail: string;
  trend: number[];
  color: string;
}

const MicroChart = ({ data, color }: { data: number[]; color: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 80 + 10},${40 - ((v - min) / range) * 30}`).join(" ");

  return (
    <svg width="90" height="48" viewBox="0 0 100 48" className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
};

const INSIGHTS: Insight[] = [
  {
    id: "hrv",
    icon: <Heart className="w-4 h-4" />,
    title: "Your HRV dipped at 2pm. Consider a 3-min breath reset.",
    detail: "Heart rate variability dropped 15% below your baseline this afternoon. A brief parasympathetic activation exercise can help restore balance. Try box breathing: 4s inhale, 4s hold, 4s exhale, 4s hold.",
    trend: [42, 45, 48, 44, 38, 35, 40],
    color: "hsl(340, 75%, 55%)",
  },
  {
    id: "mobility",
    icon: <TrendingUp className="w-4 h-4" />,
    title: "Mobility is trending upward this week.",
    detail: "Your mobility score has improved 12% over the past 7 days. The consistency of your daily resets is paying off. Keep focusing on hip and thoracic spine work for continued gains.",
    trend: [60, 62, 65, 63, 68, 72, 75],
    color: "hsl(174, 72%, 50%)",
  },
  {
    id: "streak",
    icon: <Flame className="w-4 h-4" />,
    title: "You've hit a 4-day streak. Keep building.",
    detail: "Consistency is the strongest predictor of long-term outcomes. Users who maintain 5+ day streaks see 40% faster recovery progress. One more day to hit your next milestone!",
    trend: [1, 2, 3, 4, 4, 4, 4],
    color: "hsl(45, 90%, 55%)",
  },
  {
    id: "stress",
    icon: <Wind className="w-4 h-4" />,
    title: "Elevated stress detected. Try a recovery session.",
    detail: "Based on your activity patterns, your nervous system load is above average today. A 5-minute breathwork session can lower cortisol by up to 25% and improve focus for the rest of the day.",
    trend: [30, 35, 42, 55, 60, 58, 52],
    color: "hsl(260, 60%, 55%)",
  },
];

const InsightCard = ({ insight, index }: { insight: Insight; index: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.button
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08 }}
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left glass rounded-2xl p-4 hover:border-primary/20 transition-all active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${insight.color}20`, color: insight.color }}>
          {insight.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground leading-snug">{insight.title}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <MicroChart data={insight.trend} color={insight.color} />
          <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50 leading-relaxed">
              {insight.detail}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const InsightsFeed = () => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="font-display text-base font-bold text-foreground">Today's Insights</h2>
        <p className="text-xs text-muted-foreground">Powered by your data</p>
      </div>
      <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">AI</span>
    </div>
    {INSIGHTS.map((insight, i) => (
      <InsightCard key={insight.id} insight={insight} index={i} />
    ))}
  </div>
);

export default InsightsFeed;
