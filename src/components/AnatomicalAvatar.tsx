import { motion } from "framer-motion";
import { useState, useEffect, useMemo, useCallback } from "react";
import type { JointPose, MovementPhase, ExerciseMovementSpec, BreathPhase } from "@/data/exerciseMovementSpecs";

// ─── MUSCLE GROUP POSITIONS (relative to body center) ─────
const MUSCLE_HIGHLIGHTS: Record<string, { cx: number; cy: number; rx: number; ry: number; opacity: number }> = {
  gluteus_maximus: { cx: 50, cy: 52, rx: 8, ry: 5, opacity: 0.25 },
  gluteus_medius: { cx: 44, cy: 48, rx: 5, ry: 3, opacity: 0.2 },
  hamstrings: { cx: 50, cy: 62, rx: 6, ry: 8, opacity: 0.2 },
  quadriceps: { cx: 50, cy: 58, rx: 6, ry: 8, opacity: 0.2 },
  rectus_abdominis: { cx: 50, cy: 38, rx: 5, ry: 8, opacity: 0.2 },
  transverse_abdominis: { cx: 50, cy: 40, rx: 7, ry: 6, opacity: 0.15 },
  obliques: { cx: 44, cy: 40, rx: 4, ry: 6, opacity: 0.2 },
  erector_spinae: { cx: 50, cy: 34, rx: 3, ry: 10, opacity: 0.2 },
  multifidus: { cx: 50, cy: 38, rx: 2, ry: 6, opacity: 0.15 },
  deep_neck_flexors: { cx: 50, cy: 18, rx: 3, ry: 3, opacity: 0.2 },
  longus_colli: { cx: 50, cy: 20, rx: 2, ry: 3, opacity: 0.2 },
  upper_trapezius: { cx: 50, cy: 22, rx: 8, ry: 3, opacity: 0.2 },
  lower_trapezius: { cx: 50, cy: 28, rx: 7, ry: 4, opacity: 0.2 },
  rhomboids: { cx: 50, cy: 28, rx: 5, ry: 5, opacity: 0.15 },
  serratus_anterior: { cx: 42, cy: 32, rx: 3, ry: 5, opacity: 0.2 },
  latissimus_dorsi: { cx: 44, cy: 34, rx: 6, ry: 8, opacity: 0.2 },
  pectoralis_major: { cx: 50, cy: 26, rx: 7, ry: 4, opacity: 0.2 },
  pectoralis_minor: { cx: 48, cy: 24, rx: 4, ry: 3, opacity: 0.15 },
  infraspinatus: { cx: 56, cy: 26, rx: 4, ry: 3, opacity: 0.2 },
  teres_minor: { cx: 58, cy: 26, rx: 3, ry: 2, opacity: 0.15 },
  posterior_deltoid: { cx: 62, cy: 24, rx: 3, ry: 3, opacity: 0.2 },
  diaphragm: { cx: 50, cy: 32, rx: 7, ry: 3, opacity: 0.25 },
  intercostals: { cx: 46, cy: 30, rx: 5, ry: 4, opacity: 0.15 },
  iliopsoas: { cx: 46, cy: 48, rx: 4, ry: 5, opacity: 0.2 },
  rectus_femoris: { cx: 48, cy: 56, rx: 4, ry: 6, opacity: 0.2 },
  adductors: { cx: 50, cy: 58, rx: 4, ry: 6, opacity: 0.2 },
  quadratus_lumborum: { cx: 46, cy: 40, rx: 3, ry: 4, opacity: 0.2 },
  tibialis_anterior: { cx: 44, cy: 72, rx: 2, ry: 4, opacity: 0.2 },
  gastrocnemius: { cx: 50, cy: 72, rx: 3, ry: 5, opacity: 0.2 },
  soleus: { cx: 50, cy: 76, rx: 2, ry: 3, opacity: 0.15 },
  forearm_extensors: { cx: 68, cy: 42, rx: 2, ry: 4, opacity: 0.2 },
  hip_flexors: { cx: 46, cy: 48, rx: 4, ry: 4, opacity: 0.2 },
  hip_internal_rotators: { cx: 48, cy: 50, rx: 3, ry: 3, opacity: 0.15 },
  tensor_fasciae_latae: { cx: 42, cy: 50, rx: 2, ry: 3, opacity: 0.15 },
  levator_scapulae: { cx: 56, cy: 20, rx: 2, ry: 3, opacity: 0.2 },
  peroneals: { cx: 56, cy: 74, rx: 2, ry: 3, opacity: 0.15 },
};

// ─── BREATH INDICATOR COLORS ─────
const BREATH_COLORS: Record<BreathPhase, string> = {
  inhale: "hsl(var(--wellness-green))",
  exhale: "hsl(var(--primary))",
  hold: "hsl(var(--wellness-gold))",
  natural: "hsl(var(--muted-foreground))",
};

interface AnatomicalAvatarProps {
  spec: ExerciseMovementSpec;
  isPlaying: boolean;
  showMuscles?: boolean;
  showJointMarkers?: boolean;
  showBreathIndicator?: boolean;
  side?: "left" | "right" | null;
  className?: string;
  onCueChange?: (cue: string | null) => void;
}

const AnatomicalAvatar = ({
  spec,
  isPlaying,
  showMuscles = true,
  showJointMarkers = false,
  showBreathIndicator = true,
  side,
  className = "",
  onCueChange,
}: AnatomicalAvatarProps) => {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const phases = spec.phases;
  const currentPhase = phases[phaseIdx] || phases[0];

  useEffect(() => {
    onCueChange?.(isPlaying && currentPhase.cue ? currentPhase.cue : null);
  }, [isPlaying, currentPhase.cue, onCueChange]);

  useEffect(() => {
    if (!isPlaying) {
      setPhaseIdx(0);
      return;
    }
    const timer = setTimeout(() => {
      setPhaseIdx(prev => (prev + 1) % phases.length);
    }, currentPhase.duration * 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, phaseIdx, phases, currentPhase.duration]);

  const pose = currentPhase.pose;
  const dur = currentPhase.duration;
  const easing = Array.isArray(currentPhase.easing)
    ? currentPhase.easing
    : currentPhase.easing === "linear" ? [0, 0, 1, 1] as [number, number, number, number]
    : currentPhase.easing === "easeIn" ? [0.4, 0, 1, 1] as [number, number, number, number]
    : currentPhase.easing === "easeOut" ? [0, 0, 0.2, 1] as [number, number, number, number]
    : [0.4, 0, 0.2, 1] as [number, number, number, number];

  const transition = { duration: Math.min(dur, 4), ease: easing, type: "tween" as const };

  const activeMusclesToShow = useMemo(() => {
    if (!showMuscles || !currentPhase.muscles) return [];
    return currentPhase.muscles.filter(m => m in MUSCLE_HIGHLIGHTS);
  }, [showMuscles, currentPhase.muscles]);

  // Premium body segment with rounded stroke
  const Segment = useCallback(({ from, to, width = 4, opacity = 0.75 }: { from: [number, number]; to: [number, number]; width?: number; opacity?: number }) => (
    <motion.line
      animate={{ x1: from[0], y1: from[1], x2: to[0], y2: to[1] }}
      transition={transition}
      stroke="hsl(var(--foreground))"
      strokeWidth={width}
      strokeLinecap="round"
      opacity={opacity}
      filter="url(#bodyGlow)"
    />
  ), [transition]);

  const JointDot = useCallback(({ pos, r = 1.8 }: { pos: [number, number]; r?: number }) => (
    <motion.circle
      animate={{ cx: pos[0], cy: pos[1] }}
      transition={transition}
      r={r}
      fill="hsl(var(--primary))"
      opacity={0.4}
    />
  ), [transition]);

  // Spine glow path
  const spinePathD = useMemo(() => {
    return `M${pose.skull[0]},${pose.skull[1]} Q${pose.c_spine[0]},${pose.c_spine[1]} ${pose.t_spine[0]},${pose.t_spine[1]} Q${pose.l_spine[0]},${pose.l_spine[1]} ${pose.pelvis[0]},${pose.pelvis[1]}`;
  }, [pose]);

  // Breath-based chest expansion
  const chestScale = currentPhase.breath === "inhale" ? 1.04 : currentPhase.breath === "exhale" ? 0.97 : 1;

  return (
    <div className={`relative ${className}`}>
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)" }}
        animate={isPlaying
          ? { scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }
          : { opacity: 0.2 }
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}
      >
        <defs>
          <linearGradient id="anatomicalSpineGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.7" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
          </linearGradient>
          <filter id="bodyGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="muscleGlowAnat" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        {/* Background */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.15" />

        {/* ─── MUSCLE HIGHLIGHTS ─── */}
        {activeMusclesToShow.map(muscle => {
          const m = MUSCLE_HIGHLIGHTS[muscle];
          return (
            <motion.ellipse
              key={muscle}
              cx={m.cx} cy={m.cy} rx={m.rx} ry={m.ry}
              fill="hsl(var(--primary))"
              filter="url(#muscleGlowAnat)"
              initial={{ opacity: 0 }}
              animate={{ opacity: isPlaying ? [m.opacity * 0.4, m.opacity * 0.9, m.opacity * 0.4] : 0 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}

        {/* ─── TORSO SILHOUETTE (filled body shape) ─── */}
        <motion.path
          animate={{
            d: `M ${pose.shoulder_l[0]},${pose.shoulder_l[1]}
                Q ${pose.sternum[0]},${pose.sternum[1] - 3} ${pose.shoulder_r[0]},${pose.shoulder_r[1]}
                L ${pose.hip_r[0]+2},${pose.hip_r[1]}
                Q ${pose.pelvis[0]},${pose.pelvis[1] + 2} ${pose.hip_l[0]-2},${pose.hip_l[1]}
                Z`,
            scaleY: chestScale,
          }}
          transition={transition}
          fill="hsl(var(--foreground))"
          opacity={0.08}
          style={{ transformOrigin: `${pose.sternum[0]}px ${pose.sternum[1]}px` }}
        />

        {/* ─── SPINE GLOW ─── */}
        <motion.path
          animate={{ d: spinePathD }}
          transition={transition}
          stroke="url(#anatomicalSpineGlow)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          opacity={isPlaying ? 0.7 : 0.25}
        />

        {/* ─── SPINE (segmented, thicker) ─── */}
        <Segment from={pose.skull} to={pose.c_spine} width={3} />
        <Segment from={pose.c_spine} to={pose.t_spine} width={3.5} />
        <Segment from={pose.t_spine} to={pose.l_spine} width={4} />
        <Segment from={pose.l_spine} to={pose.pelvis} width={4} />

        {/* Shoulder girdle */}
        <Segment from={pose.shoulder_l} to={pose.sternum} width={3} opacity={0.55} />
        <Segment from={pose.sternum} to={pose.shoulder_r} width={3} opacity={0.55} />

        {/* Pelvis */}
        <Segment from={pose.hip_l} to={pose.pelvis} width={3.5} opacity={0.65} />
        <Segment from={pose.pelvis} to={pose.hip_r} width={3.5} opacity={0.65} />

        {/* ─── LEFT ARM ─── */}
        <Segment from={pose.shoulder_l} to={pose.elbow_l} width={3.5} />
        <Segment from={pose.elbow_l} to={pose.wrist_l} width={2.8} />
        <Segment from={pose.wrist_l} to={pose.hand_l} width={2} opacity={0.6} />

        {/* ─── RIGHT ARM ─── */}
        <Segment from={pose.shoulder_r} to={pose.elbow_r} width={3.5} />
        <Segment from={pose.elbow_r} to={pose.wrist_r} width={2.8} />
        <Segment from={pose.wrist_r} to={pose.hand_r} width={2} opacity={0.6} />

        {/* ─── LEFT LEG ─── */}
        <Segment from={pose.hip_l} to={pose.knee_l} width={4.2} />
        <Segment from={pose.knee_l} to={pose.ankle_l} width={3.5} />
        <Segment from={pose.ankle_l} to={pose.forefoot_l} width={2.5} opacity={0.6} />

        {/* ─── RIGHT LEG ─── */}
        <Segment from={pose.hip_r} to={pose.knee_r} width={4.2} />
        <Segment from={pose.knee_r} to={pose.ankle_r} width={3.5} />
        <Segment from={pose.ankle_r} to={pose.forefoot_r} width={2.5} opacity={0.6} />

        {/* ─── HEAD ─── */}
        <motion.circle
          animate={{ cx: pose.skull[0], cy: pose.skull[1] }}
          transition={transition}
          r="6"
          fill="hsl(var(--foreground))"
          opacity={0.1}
        />
        <motion.circle
          animate={{ cx: pose.skull[0], cy: pose.skull[1] }}
          transition={transition}
          r="5.5"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="2.5"
          opacity={0.75}
          filter="url(#bodyGlow)"
        />

        {/* ─── JOINT MARKERS (optional) ─── */}
        {showJointMarkers && (
          <>
            <JointDot pos={pose.c_spine} />
            <JointDot pos={pose.t_spine} />
            <JointDot pos={pose.l_spine} />
            <JointDot pos={pose.shoulder_l} />
            <JointDot pos={pose.shoulder_r} />
            <JointDot pos={pose.elbow_l} />
            <JointDot pos={pose.elbow_r} />
            <JointDot pos={pose.wrist_l} />
            <JointDot pos={pose.wrist_r} />
            <JointDot pos={pose.hip_l} />
            <JointDot pos={pose.hip_r} />
            <JointDot pos={pose.knee_l} />
            <JointDot pos={pose.knee_r} />
            <JointDot pos={pose.ankle_l} />
            <JointDot pos={pose.ankle_r} />
          </>
        )}

        {/* Joint accent dots at key joints */}
        {[pose.elbow_l, pose.elbow_r, pose.knee_l, pose.knee_r, pose.shoulder_l, pose.shoulder_r].map((j, i) => (
          <motion.circle
            key={`accent-${i}`}
            animate={{ cx: j[0], cy: j[1] }}
            transition={transition}
            r="1.5"
            fill="hsl(var(--primary))"
            opacity={0.3}
          />
        ))}

        {/* Hand dots */}
        <motion.circle animate={{ cx: pose.hand_l[0], cy: pose.hand_l[1] }} transition={transition} r="2.5" fill="hsl(var(--foreground))" opacity={0.55} />
        <motion.circle animate={{ cx: pose.hand_r[0], cy: pose.hand_r[1] }} transition={transition} r="2.5" fill="hsl(var(--foreground))" opacity={0.55} />

        {/* Foot dots */}
        <motion.circle animate={{ cx: pose.forefoot_l[0], cy: pose.forefoot_l[1] }} transition={transition} r="3" fill="hsl(var(--foreground))" opacity={0.45} />
        <motion.circle animate={{ cx: pose.forefoot_r[0], cy: pose.forefoot_r[1] }} transition={transition} r="3" fill="hsl(var(--foreground))" opacity={0.45} />

        {/* ─── RIB CAGE BREATHING VISUALIZATION ─── */}
        {showBreathIndicator && isPlaying && (
          <motion.ellipse
            animate={{
              cx: (pose.rib_l[0] + pose.rib_r[0]) / 2,
              cy: (pose.rib_l[1] + pose.rib_r[1]) / 2,
              rx: Math.abs(pose.rib_r[0] - pose.rib_l[0]) / 2 + 3,
              ry: currentPhase.breath === "inhale" ? 6 : 4,
              opacity: currentPhase.breath === "inhale" ? [0.05, 0.18, 0.05] : [0.08, 0.05, 0.08],
            }}
            transition={{ duration: currentPhase.breath === "inhale" ? 3 : 4, repeat: Infinity, ease: "easeInOut" }}
            fill={BREATH_COLORS[currentPhase.breath]}
          />
        )}

        {/* ─── BREATHING RING ─── */}
        {isPlaying && (
          <motion.circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke={BREATH_COLORS[currentPhase.breath]}
            strokeWidth="0.6"
            animate={{
              r: currentPhase.breath === "inhale" ? [44, 47, 44]
                : currentPhase.breath === "exhale" ? [47, 44, 47]
                : [45, 46, 45],
              opacity: [0.05, 0.2, 0.05],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </svg>

      {/* Breath phase indicator */}
      {isPlaying && showBreathIndicator && (
        <motion.div
          key={`breath-${phaseIdx}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-0 right-0"
        >
          <span
            className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
            style={{
              color: BREATH_COLORS[currentPhase.breath],
              backgroundColor: `${BREATH_COLORS[currentPhase.breath]}20`,
            }}
          >
            {currentPhase.breath === "natural" ? "" : currentPhase.breath}
          </span>
        </motion.div>
      )}

      {/* Side indicator */}
      {side && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider"
        >
          {side}
        </motion.div>
      )}
    </div>
  );
};

export default AnatomicalAvatar;
