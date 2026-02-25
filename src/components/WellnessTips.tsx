import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wind, Brain, Flame, Lightbulb, Heart, Sparkles, Activity,
  BarChart3, BookOpen, Zap, Target,
} from "lucide-react";
import {
  getSessionTips, CATEGORY_META, ALL_TIPS,
  type TipCategory, type WellnessTip,
} from "@/data/wellnessContent";

const ICON_MAP: Record<string, React.ElementType> = {
  Wind, Brain, Flame, Lightbulb, Heart, Sparkles, Activity, BarChart3, BookOpen, Zap, Target,
};

const FILTER_CATEGORIES: (TipCategory | "all")[] = [
  "all", "breath", "nervous", "performance", "desk", "action", "hrv", "education", "premium", "mindset", "integration",
];

const WellnessTips = () => {
  const [filter, setFilter] = useState<TipCategory | "all">("all");
  const [tipIndex, setTipIndex] = useState(0);

  const tips = useMemo(
    () => getSessionTips(12, filter === "all" ? undefined : filter),
    [filter]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % tips.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [tips.length]);

  useEffect(() => setTipIndex(0), [filter]);

  const tip = tips[tipIndex];
  if (!tip) return null;

  const meta = CATEGORY_META[tip.category];
  const IconComp = ICON_MAP[meta.iconName] || Sparkles;

  return (
    <div>
      {/* Category pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar mb-2">
        {FILTER_CATEGORIES.map(cat => {
          const active = filter === cat;
          const label = cat === "all" ? "All" : CATEGORY_META[cat].label;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${
                active
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tip.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className={`glass rounded-xl p-4 ${tip.isAction ? "border-primary/30" : ""}`}
        >
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 ${meta.color}`}>
              <IconComp className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                {tip.isAction ? "⚡ Do This Now" : meta.label}
              </p>
              <p className={`text-sm leading-relaxed ${tip.isAction ? "text-primary font-medium" : "text-foreground"}`}>
                {tip.text}
              </p>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-1 mt-3">
            {tips.map((_, i) => (
              <button
                key={i}
                onClick={() => setTipIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === tipIndex ? "bg-primary w-4" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WellnessTips;
