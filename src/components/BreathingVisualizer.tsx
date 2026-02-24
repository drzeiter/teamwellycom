import { motion } from "framer-motion";

interface BreathingVisualizerProps {
  exerciseName: string;
  isPlaying: boolean;
}

/**
 * A circular breathing guide that expands/contracts to guide the user.
 * Replaces the stick figure avatar for breathwork & meditation exercises.
 */
const BreathingVisualizer = ({ exerciseName, isPlaying }: BreathingVisualizerProps) => {
  const n = exerciseName.toLowerCase();

  // Determine breathing pattern
  let inhale = 4, hold1 = 0, exhale = 4, hold2 = 0, label = "Breathe";
  if (n.includes("4-7-8") || n.includes("sleep")) {
    inhale = 4; hold1 = 7; exhale = 8; hold2 = 0; label = "4-7-8";
  } else if (n.includes("box")) {
    inhale = 4; hold1 = 4; exhale = 4; hold2 = 4; label = "Box";
  } else if (n.includes("emergency") || n.includes("calm")) {
    inhale = 4; hold1 = 2; exhale = 8; hold2 = 0; label = "Calm";
  } else if (n.includes("diaphragm")) {
    inhale = 5; hold1 = 0; exhale = 5; hold2 = 0; label = "Belly";
  } else if (n.includes("alternate") || n.includes("nostril")) {
    inhale = 4; hold1 = 2; exhale = 4; hold2 = 2; label = "Alternate";
  }

  const totalCycle = inhale + hold1 + exhale + hold2;
  const isBreathwork = n.includes("breath") || n.includes("4-7-8") || n.includes("box") || n.includes("calm") || n.includes("diaphragm") || n.includes("nostril") || n.includes("alternate");

  // For meditation exercises, show a calm pulsing orb
  if (!isBreathwork) {
    return (
      <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
        <motion.div
          className="absolute w-32 h-32 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--wellness-purple) / 0.3) 0%, transparent 70%)" }}
          animate={isPlaying ? { scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] } : { scale: 1, opacity: 0.3 }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute w-20 h-20 rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, transparent 70%)" }}
          animate={isPlaying ? { scale: [1.2, 1, 1.2], opacity: [0.5, 0.8, 0.5] } : { scale: 1.1, opacity: 0.4 }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="text-4xl z-10">🧘</span>
      </div>
    );
  }

  // Breathing animation: circle expands on inhale, holds, contracts on exhale
  return (
    <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
      {/* Outer glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
          width: "160px",
          height: "160px",
        }}
        animate={isPlaying ? {
          scale: [0.6, 1, 1, 0.6, 0.6],
          opacity: [0.3, 0.6, 0.6, 0.3, 0.3],
        } : { scale: 0.8, opacity: 0.3 }}
        transition={isPlaying ? {
          duration: totalCycle,
          times: [0, inhale / totalCycle, (inhale + hold1) / totalCycle, (inhale + hold1 + exhale) / totalCycle, 1],
          repeat: Infinity,
          ease: "easeInOut",
        } : {}}
      />

      {/* Main breathing circle */}
      <motion.div
        className="absolute rounded-full border-2 border-primary/40"
        style={{ background: "hsl(var(--primary) / 0.15)" }}
        animate={isPlaying ? {
          width: ["60px", "120px", "120px", "60px", "60px"],
          height: ["60px", "120px", "120px", "60px", "60px"],
        } : { width: "80px", height: "80px" }}
        transition={isPlaying ? {
          duration: totalCycle,
          times: [0, inhale / totalCycle, (inhale + hold1) / totalCycle, (inhale + hold1 + exhale) / totalCycle, 1],
          repeat: Infinity,
          ease: "easeInOut",
        } : {}}
      />

      {/* Phase text */}
      <motion.div className="z-10 text-center">
        <motion.p
          className="text-xs font-medium text-primary uppercase tracking-wider"
          animate={isPlaying ? {
            opacity: [1, 1, 0.7, 0.7, 1],
          } : { opacity: 1 }}
          transition={isPlaying ? {
            duration: totalCycle,
            times: [0, inhale / totalCycle, (inhale + hold1) / totalCycle, (inhale + hold1 + exhale) / totalCycle, 1],
            repeat: Infinity,
          } : {}}
        >
          {label}
        </motion.p>
        <p className="text-lg">🫁</p>
      </motion.div>
    </div>
  );
};

export default BreathingVisualizer;
