import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Each pose is defined by joint positions: head, neck, hip, leftHand, rightHand, leftFoot, rightFoot, leftElbow, rightElbow, leftKnee, rightKnee
interface Joints {
  head: [number, number];
  neck: [number, number];
  hip: [number, number];
  lh: [number, number]; // left hand
  rh: [number, number]; // right hand
  lf: [number, number]; // left foot
  rf: [number, number]; // right foot
  le: [number, number]; // left elbow
  re: [number, number]; // right elbow
  lk: [number, number]; // left knee
  rk: [number, number]; // right knee
}

type AnimationFrames = Joints[];

// ─── ANIMATION DEFINITIONS ─────────────────────────────────
// Each exercise maps to 2-4 keyframes the avatar cycles through

const ANIMATIONS: Record<string, AnimationFrames> = {
  // STANDING (idle breathing)
  standing: [
    { head:[50,18], neck:[50,26], hip:[50,52], le:[35,36], re:[65,36], lh:[30,46], rh:[70,46], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,17], neck:[50,25], hip:[50,51], le:[35,35], re:[65,35], lh:[30,45], rh:[70,45], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],

  // CAT-COW: alternates between arched and rounded back on all fours
  cat_cow: [
    // Cat (rounded)
    { head:[25,48], neck:[30,42], hip:[65,42], le:[18,42], re:[30,35], lh:[15,55], rh:[30,30], lk:[72,55], rk:[58,55], lf:[78,65], rf:[55,65] },
    // Cow (arched)
    { head:[25,35], neck:[30,38], hip:[65,50], le:[18,38], re:[30,42], lh:[15,55], rh:[30,50], lk:[72,60], rk:[58,60], lf:[78,70], rf:[55,70] },
  ],

  // CHILD'S POSE: gentle rocking
  childs_pose: [
    { head:[35,58], neck:[40,55], hip:[68,52], le:[28,55], re:[40,48], lh:[22,65], rh:[35,62], lk:[72,62], rk:[65,60], lf:[78,68], rf:[62,68] },
    { head:[33,60], neck:[38,56], hip:[68,50], le:[26,56], re:[38,48], lh:[20,67], rh:[33,64], lk:[72,60], rk:[65,58], lf:[78,66], rf:[62,66] },
  ],

  // FORWARD FOLD: bending down and coming back up slightly
  forward_fold: [
    { head:[50,48], neck:[50,42], hip:[50,52], le:[38,38], re:[62,38], lh:[35,55], rh:[65,55], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,38], neck:[50,36], hip:[50,52], le:[40,32], re:[60,32], lh:[38,42], rh:[62,42], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],

  // LUNGE: alternating depth
  lunge: [
    { head:[50,22], neck:[50,28], hip:[50,48], le:[38,34], re:[62,34], lh:[32,28], rh:[68,28], lk:[35,62], rk:[65,56], lf:[30,78], rf:[72,72] },
    { head:[50,26], neck:[50,32], hip:[50,52], le:[38,38], re:[62,38], lh:[32,32], rh:[68,32], lk:[33,66], rk:[67,58], lf:[28,80], rf:[74,74] },
  ],

  // BRIDGE: hips going up and down
  bridge: [
    // Hips up
    { head:[22,68], neck:[28,67], hip:[50,50], le:[28,60], re:[35,62], lh:[15,72], rh:[15,62], lk:[58,58], rk:[65,58], lf:[68,68], rf:[75,68] },
    // Hips down
    { head:[22,68], neck:[28,67], hip:[50,60], le:[28,62], re:[35,64], lh:[15,72], rh:[15,62], lk:[58,65], rk:[65,65], lf:[68,72], rf:[75,72] },
  ],

  // PLANK: slight body wave
  plank: [
    { head:[22,50], neck:[28,52], hip:[62,52], le:[22,45], re:[28,48], lh:[15,58], rh:[22,42], lk:[68,60], rk:[62,58], lf:[75,68], rf:[70,65] },
    { head:[22,48], neck:[28,50], hip:[62,54], le:[22,43], re:[28,46], lh:[15,56], rh:[22,40], lk:[68,62], rk:[62,60], lf:[75,70], rf:[70,67] },
  ],

  // SIDE STRETCH: leaning side to side
  side_stretch: [
    { head:[48,20], neck:[50,26], hip:[50,52], le:[32,28], re:[68,22], lh:[28,22], rh:[75,15], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[52,20], neck:[50,26], hip:[50,52], le:[32,22], re:[68,28], lh:[25,15], rh:[72,22], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],

  // TWIST: rotating torso
  twist: [
    { head:[48,22], neck:[50,28], hip:[50,52], le:[35,32], re:[62,42], lh:[28,26], rh:[68,50], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[52,22], neck:[50,28], hip:[50,52], le:[38,42], re:[65,32], lh:[32,50], rh:[72,26], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],

  // SUPINE (lying on back): gentle knee pull
  supine: [
    { head:[18,62], neck:[24,62], hip:[55,62], le:[24,55], re:[30,58], lh:[12,68], rh:[12,55], lk:[62,68], rk:[62,55], lf:[70,74], rf:[70,48] },
    { head:[18,62], neck:[24,62], hip:[55,62], le:[24,55], re:[30,56], lh:[12,68], rh:[12,55], lk:[62,65], rk:[58,50], lf:[70,72], rf:[55,42] },
  ],

  // SQUAT: going up and down
  squat: [
    // Standing
    { head:[50,18], neck:[50,26], hip:[50,50], le:[36,34], re:[64,34], lh:[30,38], rh:[70,38], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    // Squatted
    { head:[50,28], neck:[50,34], hip:[50,56], le:[36,40], re:[64,40], lh:[30,44], rh:[70,44], lk:[36,68], rk:[64,68], lf:[32,80], rf:[68,80] },
  ],

  // SEATED: gentle forward lean
  seated: [
    { head:[50,22], neck:[50,28], hip:[50,52], le:[36,34], re:[64,34], lh:[30,40], rh:[70,40], lk:[35,58], rk:[65,58], lf:[25,70], rf:[75,70] },
    { head:[50,28], neck:[50,32], hip:[50,52], le:[36,38], re:[64,38], lh:[30,50], rh:[70,50], lk:[35,58], rk:[65,58], lf:[25,70], rf:[75,70] },
  ],

  // ARMS UP: reaching overhead alternating
  arms_up: [
    { head:[50,18], neck:[50,26], hip:[50,52], le:[38,22], re:[62,22], lh:[35,10], rh:[65,10], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,17], neck:[50,25], hip:[50,52], le:[36,18], re:[64,18], lh:[32,8], rh:[68,8], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],

  // BALANCE: wobbling on one leg
  balance: [
    { head:[50,18], neck:[50,26], hip:[50,52], le:[36,32], re:[64,32], lh:[28,26], rh:[72,26], lk:[50,66], rk:[62,48], lf:[50,80], rf:[70,42] },
    { head:[48,17], neck:[49,25], hip:[49,52], le:[34,30], re:[62,30], lh:[26,24], rh:[70,24], lk:[49,66], rk:[64,46], lf:[49,80], rf:[72,40] },
    { head:[52,18], neck:[51,26], hip:[51,52], le:[38,32], re:[66,32], lh:[30,26], rh:[74,26], lk:[51,66], rk:[60,50], lf:[51,80], rf:[68,44] },
  ],

  // WARRIOR: sinking deeper and rising
  warrior: [
    { head:[50,20], neck:[50,26], hip:[50,48], le:[32,28], re:[68,28], lh:[20,22], rh:[80,22], lk:[35,62], rk:[68,58], lf:[25,72], rf:[78,72] },
    { head:[50,24], neck:[50,30], hip:[50,52], le:[32,32], re:[68,32], lh:[20,26], rh:[80,26], lk:[33,66], rk:[70,60], lf:[25,76], rf:[78,74] },
  ],

  // NECK: tilting head side to side
  neck: [
    { head:[45,20], neck:[50,26], hip:[50,52], le:[36,38], re:[64,38], lh:[30,46], rh:[70,46], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[55,20], neck:[50,26], hip:[50,52], le:[36,38], re:[64,38], lh:[30,46], rh:[70,46], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,18], neck:[50,26], hip:[50,52], le:[36,38], re:[64,38], lh:[30,46], rh:[70,46], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],

  // FOAM ROLL: rolling back and forth
  foam_roll: [
    { head:[25,55], neck:[30,57], hip:[52,57], le:[25,50], re:[32,52], lh:[18,60], rh:[20,50], lk:[58,62], rk:[58,52], lf:[65,68], rf:[65,46] },
    { head:[30,55], neck:[35,57], hip:[57,57], le:[30,50], re:[37,52], lh:[23,60], rh:[25,50], lk:[63,62], rk:[63,52], lf:[70,68], rf:[70,46] },
  ],

  // JUMPING: full jump cycle
  jumping: [
    // Crouch
    { head:[50,28], neck:[50,34], hip:[50,56], le:[36,40], re:[64,40], lh:[28,36], rh:[72,36], lk:[38,68], rk:[62,68], lf:[34,80], rf:[66,80] },
    // Jump
    { head:[50,10], neck:[50,18], hip:[50,40], le:[32,14], re:[68,14], lh:[24,8], rh:[76,8], lk:[40,54], rk:[60,54], lf:[36,66], rf:[64,66] },
    // Land
    { head:[50,22], neck:[50,28], hip:[50,50], le:[36,34], re:[64,34], lh:[28,28], rh:[72,28], lk:[42,64], rk:[58,64], lf:[38,78], rf:[62,78] },
  ],

  // CIRCLE (arm circles, hip circles, etc): rotating arms
  circle: [
    { head:[50,18], neck:[50,26], hip:[50,52], le:[35,20], re:[65,20], lh:[28,12], rh:[72,12], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,18], neck:[50,26], hip:[50,52], le:[28,30], re:[72,30], lh:[20,38], rh:[80,38], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,18], neck:[50,26], hip:[50,52], le:[35,42], re:[65,42], lh:[28,50], rh:[72,50], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    { head:[50,18], neck:[50,26], hip:[50,52], le:[40,30], re:[60,30], lh:[35,20], rh:[65,20], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
  ],

  // CLAMSHELL: opening and closing top knee while lying on side
  clamshell: [
    { head:[20,55], neck:[26,57], hip:[50,57], le:[20,50], re:[28,52], lh:[14,60], rh:[14,50], lk:[58,62], rk:[58,52], lf:[66,68], rf:[66,48] },
    { head:[20,55], neck:[26,57], hip:[50,57], le:[20,50], re:[28,52], lh:[14,60], rh:[14,50], lk:[58,62], rk:[58,42], lf:[66,68], rf:[66,38] },
  ],

  // BIRD DOG: extending opposite arm/leg
  bird_dog: [
    { head:[28,38], neck:[32,40], hip:[60,44], le:[24,38], re:[32,36], lh:[18,48], rh:[18,32], lk:[68,52], rk:[54,52], lf:[76,60], rf:[48,60] },
    { head:[24,34], neck:[30,38], hip:[60,44], le:[16,30], re:[32,36], lh:[8,24], rh:[18,32], lk:[68,52], rk:[54,52], lf:[82,40], rf:[48,60] },
  ],

  // DEAD BUG: alternating arm/leg extensions while supine
  dead_bug: [
    { head:[18,62], neck:[24,62], hip:[55,62], le:[30,52], re:[24,56], lh:[38,42], rh:[12,55], lk:[62,55], rk:[60,56], lf:[70,48], rf:[68,62] },
    { head:[18,62], neck:[24,62], hip:[55,62], le:[24,56], re:[30,52], lh:[12,55], rh:[38,42], lk:[60,56], rk:[62,55], lf:[68,62], rf:[70,48] },
  ],

  // STEP UP: stepping up onto platform
  step_up: [
    { head:[50,18], neck:[50,26], hip:[50,50], le:[36,34], re:[64,34], lh:[30,38], rh:[70,38], lk:[42,66], rk:[58,60], lf:[38,80], rf:[62,68] },
    { head:[50,12], neck:[50,20], hip:[50,44], le:[36,28], re:[64,28], lh:[30,32], rh:[70,32], lk:[42,58], rk:[58,56], lf:[38,68], rf:[58,68] },
  ],

  // INCHWORM: walking hands out and back
  inchworm: [
    // Standing fold
    { head:[50,48], neck:[50,42], hip:[50,52], le:[38,38], re:[62,38], lh:[35,55], rh:[65,55], lk:[42,66], rk:[58,66], lf:[38,80], rf:[62,80] },
    // Hands walked out to plank
    { head:[22,50], neck:[28,52], hip:[58,52], le:[22,45], re:[28,48], lh:[15,58], rh:[22,42], lk:[64,60], rk:[60,58], lf:[70,68], rf:[65,65] },
  ],

  // DOWNWARD DOG: inverted V hold with gentle movement
  downward_dog: [
    { head:[28,50], neck:[32,45], hip:[55,28], le:[22,42], re:[34,38], lh:[18,58], rh:[26,52], lk:[60,48], rk:[52,48], lf:[68,68], rf:[48,68] },
    { head:[26,48], neck:[30,43], hip:[55,26], le:[20,40], re:[32,36], lh:[16,56], rh:[24,50], lk:[60,46], rk:[52,46], lf:[68,66], rf:[48,66] },
  ],
};

// Map exercise names to animation keys
function getAnimationKey(exerciseName: string): string {
  const n = exerciseName.toLowerCase();

  if (n.includes("cat") || n.includes("cow")) return "cat_cow";
  if (n.includes("child")) return "childs_pose";
  if (n.includes("bridge") || n.includes("thrust")) return "bridge";
  if (n.includes("plank") || n.includes("push") || n.includes("scapular")) return "plank";
  if (n.includes("fold") || n.includes("toe touch")) return "forward_fold";
  if (n.includes("lunge") || n.includes("pigeon") || n.includes("hip flexor")) return "lunge";
  if (n.includes("twist") || n.includes("thread") || n.includes("open book") || n.includes("sphinx")) return "twist";
  if (n.includes("dead bug")) return "dead_bug";
  if (n.includes("supine") || n.includes("knees to chest") || n.includes("lying")) return "supine";
  if (n.includes("squat") || n.includes("cossack") || n.includes("wall sit")) return "squat";
  if (n.includes("butterfly") || n.includes("straddle") || n.includes("frog") || n.includes("seated") || n.includes("prayer")) return "seated";
  if (n.includes("sun") || n.includes("overhead") || n.includes("angel") || n.includes("y raise") || n.includes("face pull")) return "arms_up";
  if (n.includes("balance") || n.includes("single leg") || n.includes("deadlift") || n.includes("figure")) return "balance";
  if (n.includes("warrior") || n.includes("triangle")) return "warrior";
  if (n.includes("neck") || n.includes("chin") || n.includes("trap") || n.includes("scm") || n.includes("levator") || n.includes("flexion") || n.includes("extension")) return "neck";
  if (n.includes("foam") || n.includes("it band")) return "foam_roll";
  if (n.includes("jump") || n.includes("high knee")) return "jumping";
  if (n.includes("clam")) return "clamshell";
  if (n.includes("bird") || n.includes("dog") && !n.includes("down")) return "bird_dog";
  if (n.includes("downward") || n.includes("down dog")) return "downward_dog";
  if (n.includes("step")) return "step_up";
  if (n.includes("inchworm") || n.includes("walkout")) return "inchworm";
  if (n.includes("circle") || n.includes("shrug") || n.includes("pull") || n.includes("band")) return "circle";
  if (n.includes("curl") || n.includes("crunch") || n.includes("mcgill")) return "supine";
  if (n.includes("rotation") || n.includes("thoracic")) return "twist";
  if (n.includes("stretch") || n.includes("side") || n.includes("lateral")) return "side_stretch";
  if (n.includes("raise") || n.includes("calf")) return "arms_up";
  if (n.includes("good morning") || n.includes("hinge")) return "forward_fold";
  if (n.includes("toe") || n.includes("ankle") || n.includes("alphabet") || n.includes("tibialis")) return "circle";
  if (n.includes("towel") || n.includes("eversion") || n.includes("inversion")) return "seated";
  if (n.includes("nordic")) return "lunge";
  if (n.includes("quad set") || n.includes("isometric")) return "standing";
  if (n.includes("wrist")) return "circle";
  if (n.includes("chest") || n.includes("clasp") || n.includes("opener")) return "side_stretch";
  if (n.includes("eagle")) return "squat";
  if (n.includes("cross") || n.includes("doorway")) return "side_stretch";

  return "standing";
}

interface ExerciseAvatarProps {
  exerciseName: string;
  side?: "left" | "right" | null;
  isPlaying: boolean;
  className?: string;
}

const ExerciseAvatar = ({ exerciseName, side, isPlaying, className = "" }: ExerciseAvatarProps) => {
  const animKey = getAnimationKey(exerciseName);
  const frames = ANIMATIONS[animKey] || ANIMATIONS.standing;
  const [frameIdx, setFrameIdx] = useState(0);

  // Cycle through frames when playing
  useEffect(() => {
    if (!isPlaying) { setFrameIdx(0); return; }
    const interval = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % frames.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  // Also animate when not playing (slower idle)
  useEffect(() => {
    if (isPlaying) return;
    const interval = setInterval(() => {
      setFrameIdx(prev => (prev + 1) % frames.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPlaying, frames.length]);

  const pose = frames[frameIdx];
  const dur = isPlaying ? 0.8 : 1.5;

  return (
    <div className={`relative ${className}`}>
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, transparent 70%)" }}
        animate={isPlaying ? { scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] } : { opacity: 0.3 }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}
      >
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--border))" strokeWidth="0.8" opacity="0.2" />

        {/* HEAD */}
        <motion.circle
          animate={{ cx: pose.head[0], cy: pose.head[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          r="6" fill="hsl(var(--primary))" opacity="0.9"
        />
        {/* Eye dots */}
        <motion.circle
          animate={{ cx: pose.head[0] - 2, cy: pose.head[1] - 1 }}
          transition={{ duration: dur, ease: "easeInOut" }}
          r="0.8" fill="hsl(var(--primary-foreground))"
        />
        <motion.circle
          animate={{ cx: pose.head[0] + 2, cy: pose.head[1] - 1 }}
          transition={{ duration: dur, ease: "easeInOut" }}
          r="0.8" fill="hsl(var(--primary-foreground))"
        />

        {/* TORSO: neck → hip */}
        <motion.line
          animate={{ x1: pose.neck[0], y1: pose.neck[1], x2: pose.hip[0], y2: pose.hip[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
        />

        {/* LEFT ARM: neck → elbow → hand */}
        <motion.line
          animate={{ x1: pose.neck[0], y1: pose.neck[1], x2: pose.le[0], y2: pose.le[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"
        />
        <motion.line
          animate={{ x1: pose.le[0], y1: pose.le[1], x2: pose.lh[0], y2: pose.lh[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"
        />
        {/* Left hand dot */}
        <motion.circle
          animate={{ cx: pose.lh[0], cy: pose.lh[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          r="2" fill="hsl(var(--primary))"
        />

        {/* RIGHT ARM: neck → elbow → hand */}
        <motion.line
          animate={{ x1: pose.neck[0], y1: pose.neck[1], x2: pose.re[0], y2: pose.re[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"
        />
        <motion.line
          animate={{ x1: pose.re[0], y1: pose.re[1], x2: pose.rh[0], y2: pose.rh[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"
        />
        {/* Right hand dot */}
        <motion.circle
          animate={{ cx: pose.rh[0], cy: pose.rh[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          r="2" fill="hsl(var(--primary))"
        />

        {/* LEFT LEG: hip → knee → foot */}
        <motion.line
          animate={{ x1: pose.hip[0], y1: pose.hip[1], x2: pose.lk[0], y2: pose.lk[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          stroke="hsl(var(--primary))" strokeWidth="2.8" strokeLinecap="round"
        />
        <motion.line
          animate={{ x1: pose.lk[0], y1: pose.lk[1], x2: pose.lf[0], y2: pose.lf[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          stroke="hsl(var(--primary))" strokeWidth="2.8" strokeLinecap="round"
        />
        {/* Left foot */}
        <motion.circle
          animate={{ cx: pose.lf[0], cy: pose.lf[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          r="2.5" fill="hsl(var(--primary))" opacity="0.8"
        />

        {/* RIGHT LEG: hip → knee → foot */}
        <motion.line
          animate={{ x1: pose.hip[0], y1: pose.hip[1], x2: pose.rk[0], y2: pose.rk[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          stroke="hsl(var(--primary))" strokeWidth="2.8" strokeLinecap="round"
        />
        <motion.line
          animate={{ x1: pose.rk[0], y1: pose.rk[1], x2: pose.rf[0], y2: pose.rf[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          stroke="hsl(var(--primary))" strokeWidth="2.8" strokeLinecap="round"
        />
        {/* Right foot */}
        <motion.circle
          animate={{ cx: pose.rf[0], cy: pose.rf[1] }}
          transition={{ duration: dur, ease: "easeInOut" }}
          r="2.5" fill="hsl(var(--primary))" opacity="0.8"
        />

        {/* Breathing ring when playing */}
        {isPlaying && (
          <motion.circle
            cx="50" cy="50" r="46"
            fill="none" stroke="hsl(var(--primary))" strokeWidth="0.5"
            animate={{ r: [44, 47, 44], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </svg>

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

export default ExerciseAvatar;
