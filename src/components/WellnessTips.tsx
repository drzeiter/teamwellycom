import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Heart, Brain, Flame } from "lucide-react";

const TIPS = [
  { icon: <Lightbulb className="w-4 h-4" />, category: "Posture", text: "Every 30 minutes, stand up and do a 30-second shoulder roll. Your spine will thank you.", color: "text-wellness-gold" },
  { icon: <Heart className="w-4 h-4" />, category: "Health", text: "Drinking water before meals helps digestion and can reduce calorie intake by 13%.", color: "text-wellness-coral" },
  { icon: <Brain className="w-4 h-4" />, category: "Mindset", text: "\"The body achieves what the mind believes.\" — Napoleon Hill", color: "text-primary" },
  { icon: <Lightbulb className="w-4 h-4" />, category: "Posture", text: "Keep your screen at eye level. Looking down at your phone creates 60 lbs of pressure on your neck.", color: "text-wellness-gold" },
  { icon: <Heart className="w-4 h-4" />, category: "Health", text: "Just 5 minutes of stretching a day can improve flexibility by 30% in 4 weeks.", color: "text-wellness-coral" },
  { icon: <Brain className="w-4 h-4" />, category: "Mindset", text: "\"Take care of your body. It's the only place you have to live.\" — Jim Rohn", color: "text-primary" },
  { icon: <Flame className="w-4 h-4" />, category: "Move", text: "Sitting for more than 8 hours a day increases health risks. Break it up with micro-movements.", color: "text-wellness-purple" },
  { icon: <Heart className="w-4 h-4" />, category: "Health", text: "Deep breathing for 2 minutes can lower cortisol levels by 23%.", color: "text-wellness-coral" },
  { icon: <Lightbulb className="w-4 h-4" />, category: "Posture", text: "The ideal sitting posture: feet flat, knees at 90°, back supported, shoulders relaxed.", color: "text-wellness-gold" },
  { icon: <Brain className="w-4 h-4" />, category: "Mindset", text: "\"Movement is a medicine for creating change in a person's physical, emotional, and mental states.\" — Carol Welch", color: "text-primary" },
  { icon: <Flame className="w-4 h-4" />, category: "Move", text: "Walking 10,000 steps daily reduces risk of cardiovascular disease by 35%.", color: "text-wellness-purple" },
  { icon: <Heart className="w-4 h-4" />, category: "Health", text: "Your hip flexors shorten when you sit. A 60-second hip stretch every hour makes a big difference.", color: "text-wellness-coral" },
];

const WellnessTips = () => {
  const [tipIndex, setTipIndex] = useState(() => {
    const day = new Date().getDate();
    return day % TIPS.length;
  });

  // Rotate every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const tip = TIPS[tipIndex];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tipIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="glass rounded-xl p-4"
      >
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 ${tip.color}`}>{tip.icon}</div>
          <div className="flex-1">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">{tip.category}</p>
            <p className="text-sm text-foreground leading-relaxed">{tip.text}</p>
          </div>
        </div>
        <div className="flex justify-center gap-1 mt-3">
          {TIPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setTipIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === tipIndex ? "bg-primary w-4" : "bg-muted-foreground/30"}`}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WellnessTips;
