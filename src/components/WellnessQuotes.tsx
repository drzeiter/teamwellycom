import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Brain, Sparkles, Quote } from "lucide-react";

const QUOTES = [
  { text: "The body achieves what the mind believes.", author: "Napoleon Hill", icon: <Brain className="w-4 h-4" /> },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn", icon: <Heart className="w-4 h-4" /> },
  { text: "Movement is a medicine for creating change in a person's physical, emotional, and mental states.", author: "Carol Welch", icon: <Sparkles className="w-4 h-4" /> },
  { text: "The greatest wealth is health.", author: "Virgil", icon: <Heart className="w-4 h-4" /> },
  { text: "Happiness is the highest form of health.", author: "Dalai Lama", icon: <Brain className="w-4 h-4" /> },
  { text: "A healthy outside starts from the inside.", author: "Robert Urich", icon: <Sparkles className="w-4 h-4" /> },
  { text: "Physical fitness is the first requisite of happiness.", author: "Joseph Pilates", icon: <Heart className="w-4 h-4" /> },
  { text: "He who has health, has hope; and he who has hope, has everything.", author: "Thomas Carlyle", icon: <Brain className="w-4 h-4" /> },
];

const WellnessQuotes = () => {
  const [index, setIndex] = useState(() => new Date().getMinutes() % QUOTES.length);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % QUOTES.length);
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  const quote = QUOTES[index];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <Quote className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-foreground leading-relaxed italic">"{quote.text}"</p>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              {quote.icon}
              <span>— {quote.author}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WellnessQuotes;
