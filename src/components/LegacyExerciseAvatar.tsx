import { motion } from "framer-motion";
import { useEffect, useState, useMemo } from "react";

interface Joints {
  head: [number, number]; neck: [number, number]; hip: [number, number];
  lh: [number, number]; rh: [number, number]; lf: [number, number]; rf: [number, number];
  le: [number, number]; re: [number, number]; lk: [number, number]; rk: [number, number];
}
type AnimationFrames = Joints[];

const ANIMATIONS: Record<string, AnimationFrames> = {
  standing: [
    { head:[50,18], neck:[50,26], hip:[50,52], le:[35,36], re:[65,36], lh:[30,46], rh:[70,46], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,17], neck:[50,25], hip:[50,51], le:[35,35], re:[65,35], lh:[30,45], rh:[70,45], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],
  cat_cow: [
    { head:[25,48], neck:[30,42], hip:[65,42], le:[18,42], re:[30,35], lh:[15,55], rh:[30,30], lk:[72,55], rk:[58,55], lf:[78,65], rf:[55,65] },
    { head:[25,35], neck:[30,38], hip:[65,50], le:[18,38], re:[30,42], lh:[15,55], rh:[30,50], lk:[72,60], rk:[58,60], lf:[78,70], rf:[55,70] },
  ],
  bridge: [
    { head:[22,68], neck:[28,67], hip:[50,50], le:[28,60], re:[35,62], lh:[15,72], rh:[15,62], lk:[58,58], rk:[65,58], lf:[68,68], rf:[75,68] },
    { head:[22,68], neck:[28,67], hip:[50,60], le:[28,62], re:[35,64], lh:[15,72], rh:[15,62], lk:[58,65], rk:[65,65], lf:[68,72], rf:[75,72] },
  ],
  plank: [
    { head:[22,50], neck:[28,52], hip:[62,52], le:[22,45], re:[28,48], lh:[15,58], rh:[22,42], lk:[68,60], rk:[62,58], lf:[75,68], rf:[70,65] },
    { head:[22,48], neck:[28,50], hip:[62,54], le:[22,43], re:[28,46], lh:[15,56], rh:[22,40], lk:[68,62], rk:[62,60], lf:[75,70], rf:[70,67] },
  ],
  lunge: [
    { head:[50,22], neck:[50,28], hip:[50,48], le:[38,34], re:[62,34], lh:[32,28], rh:[68,28], lk:[35,62], rk:[65,56], lf:[30,78], rf:[72,72] },
    { head:[50,26], neck:[50,32], hip:[50,52], le:[38,38], re:[62,38], lh:[32,32], rh:[68,32], lk:[33,66], rk:[67,58], lf:[28,80], rf:[74,74] },
  ],
  twist: [
    { head:[48,22], neck:[50,28], hip:[50,52], le:[35,32], re:[62,42], lh:[28,26], rh:[68,50], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[52,22], neck:[50,28], hip:[50,52], le:[38,42], re:[65,32], lh:[32,50], rh:[72,26], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],
  squat: [
    { head:[50,18], neck:[50,26], hip:[50,50], le:[36,34], re:[64,34], lh:[30,38], rh:[70,38], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,28], neck:[50,34], hip:[50,56], le:[36,40], re:[64,40], lh:[30,44], rh:[70,44], lk:[36,68], rk:[64,68], lf:[32,80], rf:[68,80] },
  ],
  seated: [
    { head:[50,22], neck:[50,28], hip:[50,52], le:[36,34], re:[64,34], lh:[30,40], rh:[70,40], lk:[35,58], rk:[65,58], lf:[25,70], rf:[75,70] },
    { head:[50,28], neck:[50,32], hip:[50,52], le:[36,38], re:[64,38], lh:[30,50], rh:[70,50], lk:[35,58], rk:[65,58], lf:[25,70], rf:[75,70] },
  ],
  side_stretch: [
    { head:[48,20], neck:[50,26], hip:[50,52], le:[32,28], re:[68,22], lh:[28,22], rh:[75,15], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[52,20], neck:[50,26], hip:[50,52], le:[32,22], re:[68,28], lh:[25,15], rh:[72,22], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],
  supine: [
    { head:[18,62], neck:[24,62], hip:[55,62], le:[24,55], re:[30,58], lh:[12,68], rh:[12,55], lk:[62,68], rk:[62,55], lf:[70,74], rf:[70,48] },
    { head:[18,62], neck:[24,62], hip:[55,62], le:[24,55], re:[30,56], lh:[12,68], rh:[12,55], lk:[62,65], rk:[58,50], lf:[70,72], rf:[55,42] },
  ],
  arms_up: [
    { head:[50,18], neck:[50,26], hip:[50,52], le:[38,22], re:[62,22], lh:[35,10], rh:[65,10], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,17], neck:[50,25], hip:[50,52], le:[36,18], re:[64,18], lh:[32,8], rh:[68,8], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],
  balance: [
    { head:[50,18], neck:[50,26], hip:[50,52], le:[36,32], re:[64,32], lh:[28,26], rh:[72,26], lk:[50,66], rk:[62,48], lf:[50,80], rf:[70,42] },
    { head:[48,17], neck:[49,25], hip:[49,52], le:[34,30], re:[62,30], lh:[26,24], rh:[70,24], lk:[49,66], rk:[64,46], lf:[49,80], rf:[72,40] },
  ],
  neck: [
    { head:[45,20], neck:[50,26], hip:[50,52], le:[36,38], re:[64,38], lh:[30,46], rh:[70,46], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[55,20], neck:[50,26], hip:[50,52], le:[36,38], re:[64,38], lh:[30,46], rh:[70,46], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,18], neck:[50,26], hip:[50,52], le:[36,38], re:[64,38], lh:[30,46], rh:[70,46], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],
  bird_dog: [
    { head:[28,38], neck:[32,40], hip:[60,44], le:[24,38], re:[32,36], lh:[18,48], rh:[18,32], lk:[68,52], rk:[54,52], lf:[76,60], rf:[48,60] },
    { head:[24,34], neck:[30,38], hip:[60,44], le:[16,30], re:[32,36], lh:[8,24], rh:[18,32], lk:[68,52], rk:[54,52], lf:[82,40], rf:[48,60] },
  ],
  dead_bug: [
    { head:[18,62], neck:[24,62], hip:[55,62], le:[30,52], re:[24,56], lh:[38,42], rh:[12,55], lk:[62,55], rk:[60,56], lf:[70,48], rf:[68,62] },
    { head:[18,62], neck:[24,62], hip:[55,62], le:[24,56], re:[30,52], lh:[12,55], rh:[38,42], lk:[60,56], rk:[62,55], lf:[68,62], rf:[70,48] },
  ],
  circle: [
    { head:[50,18], neck:[50,26], hip:[50,52], le:[35,20], re:[65,20], lh:[28,12], rh:[72,12], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,18], neck:[50,26], hip:[50,52], le:[28,30], re:[72,30], lh:[20,38], rh:[80,38], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,18], neck:[50,26], hip:[50,52], le:[35,42], re:[65,42], lh:[28,50], rh:[72,50], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],
  forward_fold: [
    { head:[50,48], neck:[50,42], hip:[50,52], le:[38,38], re:[62,38], lh:[35,55], rh:[65,55], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,38], neck:[50,36], hip:[50,52], le:[40,32], re:[60,32], lh:[38,42], rh:[62,42], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],
  warrior: [
    { head:[50,20], neck:[50,26], hip:[50,48], le:[32,28], re:[68,28], lh:[20,22], rh:[80,22], lk:[35,62], rk:[68,58], lf:[25,72], rf:[78,72] },
    { head:[50,24], neck:[50,30], hip:[50,52], le:[32,32], re:[68,32], lh:[20,26], rh:[80,26], lk:[33,66], rk:[70,60], lf:[25,76], rf:[78,74] },
  ],
  downward_dog: [
    { head:[28,50], neck:[32,45], hip:[55,28], le:[22,42], re:[34,38], lh:[18,58], rh:[26,52], lk:[60,48], rk:[52,48], lf:[68,68], rf:[48,68] },
    { head:[26,48], neck:[30,43], hip:[55,26], le:[20,40], re:[32,36], lh:[16,56], rh:[24,50], lk:[60,46], rk:[52,46], lf:[68,66], rf:[48,66] },
  ],
};

// Target muscle region map for glow highlights
const EXERCISE_MUSCLES: Record<string, { cx: number; cy: number; rx: number; ry: number }[]> = {
  cat_cow: [{ cx: 47, cy: 38, rx: 6, ry: 12 }], // spine
  bridge: [{ cx: 50, cy: 52, rx: 8, ry: 5 }, { cx: 50, cy: 62, rx: 6, ry: 6 }], // glutes + hamstrings
  plank: [{ cx: 50, cy: 42, rx: 7, ry: 8 }], // core
  lunge: [{ cx: 50, cy: 58, rx: 6, ry: 8 }, { cx: 46, cy: 48, rx: 4, ry: 4 }], // quads + hip flexors
  twist: [{ cx: 47, cy: 38, rx: 5, ry: 10 }], // spine
  squat: [{ cx: 50, cy: 56, rx: 8, ry: 8 }, { cx: 50, cy: 52, rx: 8, ry: 5 }], // quads + glutes
  forward_fold: [{ cx: 50, cy: 62, rx: 6, ry: 8 }], // hamstrings
  warrior: [{ cx: 50, cy: 58, rx: 6, ry: 8 }, { cx: 50, cy: 48, rx: 4, ry: 4 }],
  side_stretch: [{ cx: 44, cy: 40, rx: 4, ry: 8 }], // obliques
  neck: [{ cx: 50, cy: 22, rx: 6, ry: 4 }], // neck/traps
  downward_dog: [{ cx: 50, cy: 62, rx: 6, ry: 8 }, { cx: 50, cy: 28, rx: 6, ry: 4 }],
  bird_dog: [{ cx: 50, cy: 42, rx: 7, ry: 8 }, { cx: 50, cy: 52, rx: 6, ry: 4 }],
};

function getAnimationKey(exerciseName: string): string {
  const n = exerciseName.toLowerCase();
  if (n.includes("cat") || n.includes("cow")) return "cat_cow";
  if (n.includes("bridge") || n.includes("thrust")) return "bridge";
  if (n.includes("plank") || n.includes("push") || n.includes("scapular")) return "plank";
  if (n.includes("fold") || n.includes("toe touch")) return "forward_fold";
  if (n.includes("lunge") || n.includes("pigeon") || n.includes("hip flexor")) return "lunge";
  if (n.includes("twist") || n.includes("thread") || n.includes("open book")) return "twist";
  if (n.includes("dead bug")) return "dead_bug";
  if (n.includes("supine") || n.includes("lying")) return "supine";
  if (n.includes("squat") || n.includes("cossack")) return "squat";
  if (n.includes("seated") || n.includes("frog")) return "seated";
  if (n.includes("overhead") || n.includes("angel") || n.includes("y raise")) return "arms_up";
  if (n.includes("balance") || n.includes("single leg") || n.includes("deadlift")) return "balance";
  if (n.includes("warrior")) return "warrior";
  if (n.includes("neck") || n.includes("chin") || n.includes("trap")) return "neck";
  if (n.includes("bird") || (n.includes("dog") && !n.includes("down"))) return "bird_dog";
  if (n.includes("downward") || n.includes("down dog")) return "downward_dog";
  if (n.includes("circle") || n.includes("band") || n.includes("pull")) return "circle";
  if (n.includes("rotation") || n.includes("thoracic")) return "twist";
  if (n.includes("stretch") || n.includes("side") || n.includes("lateral")) return "side_stretch";
  if (n.includes("hinge") || n.includes("good morning")) return "forward_fold";
  return "standing";
}

interface LegacyExerciseAvatarProps {
  exerciseName: string;
  side?: "left" | "right" | null;
  isPlaying: boolean;
  className?: string;
}

// Helper: build a rounded body-segment path between two points with given width
function bodySegmentPath(from: [number, number], to: [number, number], w: number): string {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const hw = w / 2;
  const x1 = from[0] + nx * hw;
  const y1 = from[1] + ny * hw;
  const x2 = from[0] - nx * hw;
  const y2 = from[1] - ny * hw;
  const x3 = to[0] - nx * hw;
  const y3 = to[1] - ny * hw;
  const x4 = to[0] + nx * hw;
  const y4 = to[1] + ny * hw;
  return `M${x1},${y1} Q${(x1+x4)/2 + nx*1},${(y1+y4)/2 + ny*1} ${x4},${y4} L${x3},${y3} Q${(x2+x3)/2 - nx*1},${(y2+y3)/2 - ny*1} ${x2},${y2} Z`;
}

const LegacyExerciseAvatar = ({ exerciseName, side, isPlaying, className = "" }: LegacyExerciseAvatarProps) => {
  const animKey = getAnimationKey(exerciseName);
  const frames = ANIMATIONS[animKey] || ANIMATIONS.standing;
  const [frameIdx, setFrameIdx] = useState(0);
  const muscles = EXERCISE_MUSCLES[animKey] || [];

  // Breath phase (alternates with frames for cat_cow / breathing exercises)
  const isInhale = frameIdx % 2 === 0;

  useEffect(() => {
    const speed = isPlaying ? 1200 : 2500;
    const interval = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % frames.length);
    }, speed);
    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  const pose = frames[frameIdx];
  const dur = isPlaying ? 0.8 : 1.5;
  const ease: [number, number, number, number] = [0.4, 0, 0.2, 1];

  // Compute torso path for the filled silhouette
  const torsoPath = useMemo(() => {
    const sl = pose.le; // left shoulder (elbow stand-in)
    const sr = pose.re;
    const n = pose.neck;
    const h = pose.hip;
    return `M${sl[0]},${sl[1]} Q${n[0]},${n[1]-3} ${sr[0]},${sr[1]} L${(sr[0]+h[0]*0.6+pose.rk[0]*0.4)/2},${(sr[1]+h[1])/2} L${h[0]+8},${h[1]} Q${h[0]},${h[1]+2} ${h[0]-8},${h[1]} L${(sl[0]+h[0]*0.6+pose.lk[0]*0.4)/2},${(sl[1]+h[1])/2} Z`;
  }, [pose]);

  // Spine path for glow
  const spinePath = `M${pose.head[0]},${pose.head[1]+5} Q${pose.neck[0]},${pose.neck[1]} ${(pose.neck[0]+pose.hip[0])/2},${(pose.neck[1]+pose.hip[1])/2} T${pose.hip[0]},${pose.hip[1]}`;

  // Chest expansion for breath
  const chestScale = isPlaying ? (isInhale ? 1.04 : 0.97) : 1;

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)" }}
        animate={isPlaying ? { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] } : { opacity: 0.2 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}>
        <defs>
          <linearGradient id="spineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          <filter id="bodyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="muscleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.15" />

        {/* Target muscle highlights */}
        {isPlaying && muscles.map((m, i) => (
          <motion.ellipse
            key={i}
            cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry}
            fill="hsl(var(--primary))"
            filter="url(#muscleGlow)"
            animate={{ opacity: [0.08, 0.2, 0.08] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
          />
        ))}

        {/* Torso fill (silhouette body shape) */}
        <motion.path
          animate={{ d: torsoPath, scaleY: chestScale }}
          transition={{ duration: dur, ease }}
          fill="hsl(var(--foreground))"
          opacity={0.07}
          style={{ transformOrigin: `${pose.neck[0]}px ${pose.neck[1]}px` }}
        />

        {/* Spine glow line */}
        <motion.path
          animate={{ d: spinePath }}
          transition={{ duration: dur, ease }}
          stroke="url(#spineGlow)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity={isPlaying ? 0.6 : 0.2}
        />

        {/* ─── HEAD ─── */}
        <motion.circle
          animate={{ cx: pose.head[0], cy: pose.head[1] }}
          transition={{ duration: dur, ease }}
          r="6.5"
          fill="hsl(var(--foreground))"
          opacity={0.08}
        />
        <motion.circle
          animate={{ cx: pose.head[0], cy: pose.head[1] }}
          transition={{ duration: dur, ease }}
          r="6"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
          opacity={0.75}
          filter="url(#bodyGlow)"
        />

        {/* ─── TORSO (neck to hip) ─── */}
        <motion.line
          animate={{ x1: pose.neck[0], y1: pose.neck[1], x2: pose.hip[0], y2: pose.hip[1] }}
          transition={{ duration: dur, ease }}
          stroke="hsl(var(--foreground))"
          strokeWidth="5"
          strokeLinecap="round"
          opacity={0.7}
          filter="url(#bodyGlow)"
        />

        {/* ─── LEFT ARM (upper) ─── */}
        <motion.line
          animate={{ x1: pose.neck[0], y1: pose.neck[1], x2: pose.le[0], y2: pose.le[1] }}
          transition={{ duration: dur, ease }}
          stroke="hsl(var(--foreground))"
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* LEFT ARM (forearm) */}
        <motion.line
          animate={{ x1: pose.le[0], y1: pose.le[1], x2: pose.lh[0], y2: pose.lh[1] }}
          transition={{ duration: dur, ease }}
          stroke="hsl(var(--foreground))"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity={0.65}
        />
        {/* Left hand */}
        <motion.circle
          animate={{ cx: pose.lh[0], cy: pose.lh[1] }}
          transition={{ duration: dur, ease }}
          r="2.5"
          fill="hsl(var(--foreground))"
          opacity={0.55}
        />

        {/* ─── RIGHT ARM (upper) ─── */}
        <motion.line
          animate={{ x1: pose.neck[0], y1: pose.neck[1], x2: pose.re[0], y2: pose.re[1] }}
          transition={{ duration: dur, ease }}
          stroke="hsl(var(--foreground))"
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* RIGHT ARM (forearm) */}
        <motion.line
          animate={{ x1: pose.re[0], y1: pose.re[1], x2: pose.rh[0], y2: pose.rh[1] }}
          transition={{ duration: dur, ease }}
          stroke="hsl(var(--foreground))"
          strokeWidth="3.2"
          strokeLinecap="round"
          opacity={0.65}
        />
        {/* Right hand */}
        <motion.circle
          animate={{ cx: pose.rh[0], cy: pose.rh[1] }}
          transition={{ duration: dur, ease }}
          r="2.5"
          fill="hsl(var(--foreground))"
          opacity={0.55}
        />

        {/* ─── LEFT LEG (thigh) ─── */}
        <motion.line
          animate={{ x1: pose.hip[0], y1: pose.hip[1], x2: pose.lk[0], y2: pose.lk[1] }}
          transition={{ duration: dur, ease }}
          stroke="hsl(var(--foreground))"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* LEFT LEG (shin) */}
        <motion.line
          animate={{ x1: pose.lk[0], y1: pose.lk[1], x2: pose.lf[0], y2: pose.lf[1] }}
          transition={{ duration: dur, ease }}
          stroke="hsl(var(--foreground))"
          strokeWidth="3.8"
          strokeLinecap="round"
          opacity={0.65}
        />
        {/* Left foot */}
        <motion.circle
          animate={{ cx: pose.lf[0], cy: pose.lf[1] }}
          transition={{ duration: dur, ease }}
          r="3"
          fill="hsl(var(--foreground))"
          opacity={0.5}
        />

        {/* ─── RIGHT LEG (thigh) ─── */}
        <motion.line
          animate={{ x1: pose.hip[0], y1: pose.hip[1], x2: pose.rk[0], y2: pose.rk[1] }}
          transition={{ duration: dur, ease }}
          stroke="hsl(var(--foreground))"
          strokeWidth="4.5"
          strokeLinecap="round"
          opacity={0.7}
        />
        {/* RIGHT LEG (shin) */}
        <motion.line
          animate={{ x1: pose.rk[0], y1: pose.rk[1], x2: pose.rf[0], y2: pose.rf[1] }}
          transition={{ duration: dur, ease }}
          stroke="hsl(var(--foreground))"
          strokeWidth="3.8"
          strokeLinecap="round"
          opacity={0.65}
        />
        {/* Right foot */}
        <motion.circle
          animate={{ cx: pose.rf[0], cy: pose.rf[1] }}
          transition={{ duration: dur, ease }}
          r="3"
          fill="hsl(var(--foreground))"
          opacity={0.5}
        />

        {/* Joint highlights at knees and elbows */}
        {[pose.le, pose.re, pose.lk, pose.rk].map((j, i) => (
          <motion.circle
            key={`joint-${i}`}
            animate={{ cx: j[0], cy: j[1] }}
            transition={{ duration: dur, ease }}
            r="1.8"
            fill="hsl(var(--primary))"
            opacity={0.35}
          />
        ))}

        {/* Breathing ring */}
        {isPlaying && (
          <motion.circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="0.6"
            animate={{
              r: isInhale ? [44, 47, 44] : [47, 44, 47],
              opacity: [0.05, 0.18, 0.05],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </svg>
      {side && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
          {side}
        </motion.div>
      )}
    </div>
  );
};

export default LegacyExerciseAvatar;
