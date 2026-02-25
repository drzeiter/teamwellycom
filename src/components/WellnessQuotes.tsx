import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import { getSessionTips, CATEGORY_META, type WellnessTip } from "@/data/wellnessContent";

// Quotes mode shows the more inspirational / premium / mindset tips as "quotes"
const QUOTE_CATEGORIES = ["premium", "mindset", "performance", "breath"] as const;

const WellnessQuotes = () => {
  const quotes = useMemo(() => {
    // Pull from premium + mindset + performance + breath categories
    const all = QUOTE_CATEGORIES.flatMap(cat => getSessionTips(3, cat as any));
    // Shuffle
    return all.sort(() => Math.random() - 0.5).slice(0, 10);
  }, []);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % quotes.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  const quote = quotes[index];
  if (!quote) return null;

  const meta = CATEGORY_META[quote.category];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={quote.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground leading-relaxed italic">
              "{quote.text}"
            </p>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase tracking-wider font-medium">
              {meta.label}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WellnessQuotes;
