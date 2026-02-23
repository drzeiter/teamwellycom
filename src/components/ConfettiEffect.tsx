import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CONFETTI_COLORS = [
  "hsl(174, 72%, 50%)", // primary teal
  "hsl(340, 75%, 55%)", // coral
  "hsl(45, 90%, 55%)",  // gold
  "hsl(260, 60%, 55%)", // purple
  "hsl(150, 60%, 45%)", // green
];

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
}

const ConfettiEffect = ({ trigger }: { trigger: boolean }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.8,
    }));
    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 3000);
    return () => clearTimeout(timer);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ x: `${p.x}vw`, y: "-10vh", rotate: 0, opacity: 1 }}
            animate={{
              y: "110vh",
              rotate: p.rotation + 720,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 + Math.random(), ease: "easeIn" }}
            style={{
              position: "absolute",
              width: `${8 * p.scale}px`,
              height: `${12 * p.scale}px`,
              backgroundColor: p.color,
              borderRadius: "2px",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ConfettiEffect;
