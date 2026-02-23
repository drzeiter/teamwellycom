import { motion } from "framer-motion";

// Maps exercise names to stick figure poses
const POSE_MAP: Record<string, string> = {
  // Standing poses
  "standing": "M50,20 A8,8 0 1,1 50,19.99 M50,28 L50,55 M50,55 L35,80 M50,55 L65,80 M50,38 L30,48 M50,38 L70,48",
  // Cat-Cow (on all fours, arched back)
  "cat_cow": "M30,40 A6,6 0 1,1 30,39.99 M30,46 L30,55 M30,55 L20,70 M30,55 L40,55 M40,55 C45,48 55,48 60,55 M60,55 L70,70 M60,55 L60,65",
  // Child's Pose
  "childs_pose": "M65,55 A6,6 0 1,1 65,54.99 M60,58 L45,60 M45,60 L35,70 M45,60 L35,65 M60,58 L70,70 M60,58 L55,70",
  // Forward fold
  "forward_fold": "M50,45 A6,6 0 1,1 50,44.99 M50,50 L50,55 M50,55 L40,75 M50,55 L60,75 M50,50 L40,62 M50,50 L60,62",
  // Lunge
  "lunge": "M50,25 A6,6 0 1,1 50,24.99 M50,31 L50,50 M50,50 L35,75 M35,75 L35,80 M50,50 L65,65 M65,65 L70,80 M50,40 L35,35 M50,40 L65,35",
  // Bridge (lying on back, hips up)
  "bridge": "M25,70 A6,6 0 1,1 25,69.99 M30,70 L45,70 M45,70 L50,55 M50,55 L60,55 M60,55 L65,70 M65,70 L75,70",
  // Plank
  "plank": "M25,55 A6,6 0 1,1 25,54.99 M30,58 L65,58 M65,58 L75,75 M30,58 L20,75 M65,58 L65,65",
  // Side stretch
  "side_stretch": "M50,20 A6,6 0 1,1 50,19.99 M50,26 L50,55 M50,55 L40,80 M50,55 L60,80 M50,36 L30,30 M50,36 L75,25",
  // Twist/rotation
  "twist": "M50,22 A6,6 0 1,1 50,21.99 M50,28 L50,55 M50,55 L40,78 M50,55 L60,78 M50,38 L35,30 M50,38 L65,50",
  // Lying on back
  "supine": "M20,65 A6,6 0 1,1 20,64.99 M26,65 L60,65 M60,65 L70,75 M60,65 L70,55 M35,65 L25,75 M35,65 L25,55",
  // Squat
  "squat": "M50,25 A6,6 0 1,1 50,24.99 M50,31 L50,50 M50,50 L35,60 M35,60 L30,78 M50,50 L65,60 M65,60 L70,78 M50,38 L35,35 M50,38 L65,35",
  // Seated
  "seated": "M50,25 A6,6 0 1,1 50,24.99 M50,31 L50,55 M50,55 L35,58 M35,58 L30,75 M50,55 L65,58 M65,58 L70,75 M50,38 L35,42 M50,38 L65,42",
  // Arms overhead
  "arms_up": "M50,20 A6,6 0 1,1 50,19.99 M50,26 L50,55 M50,55 L40,78 M50,55 L60,78 M50,36 L40,15 M50,36 L60,15",
  // Balance (one leg)
  "balance": "M50,20 A6,6 0 1,1 50,19.99 M50,26 L50,55 M50,55 L50,80 M50,55 L65,50 M50,36 L35,30 M50,36 L65,30",
  // Warrior pose
  "warrior": "M50,22 A6,6 0 1,1 50,21.99 M50,28 L50,50 M50,50 L30,70 M30,70 L25,72 M50,50 L70,65 M70,65 L75,80 M50,35 L30,28 M50,35 L70,28",
  // Neck tilt
  "neck": "M52,22 A6,6 0 1,1 52,21.99 M50,28 L50,55 M50,55 L40,78 M50,55 L60,78 M50,38 L35,45 M50,38 L65,45",
  // Rolling/foam roll
  "foam_roll": "M30,60 A6,6 0 1,1 30,59.99 M35,63 L55,63 M55,63 L65,55 M55,63 L65,73 M45,73 A5,5 0 1,1 45,72.99",
  // Jumping
  "jumping": "M50,15 A6,6 0 1,1 50,14.99 M50,21 L50,45 M50,45 L35,65 M50,45 L65,65 M50,32 L30,22 M50,32 L70,22",
};

function getExercisePose(exerciseName: string): string {
  const name = exerciseName.toLowerCase();
  
  if (name.includes("cat") || name.includes("cow")) return POSE_MAP.cat_cow;
  if (name.includes("child")) return POSE_MAP.childs_pose;
  if (name.includes("bridge") || name.includes("thrust")) return POSE_MAP.bridge;
  if (name.includes("plank") || name.includes("push")) return POSE_MAP.plank;
  if (name.includes("fold") || name.includes("toe touch") || name.includes("forward")) return POSE_MAP.forward_fold;
  if (name.includes("lunge") || name.includes("pigeon")) return POSE_MAP.lunge;
  if (name.includes("twist") || name.includes("rotation") || name.includes("thread") || name.includes("open book")) return POSE_MAP.twist;
  if (name.includes("supine") || name.includes("dead bug") || name.includes("lying") || name.includes("knees to chest")) return POSE_MAP.supine;
  if (name.includes("squat") || name.includes("cossack") || name.includes("wall sit")) return POSE_MAP.squat;
  if (name.includes("seated") || name.includes("butterfly") || name.includes("straddle") || name.includes("frog")) return POSE_MAP.seated;
  if (name.includes("sun") || name.includes("arms up") || name.includes("overhead") || name.includes("angel")) return POSE_MAP.arms_up;
  if (name.includes("balance") || name.includes("single leg") || name.includes("deadlift") || name.includes("figure")) return POSE_MAP.balance;
  if (name.includes("warrior") || name.includes("triangle")) return POSE_MAP.warrior;
  if (name.includes("neck") || name.includes("chin") || name.includes("trap") || name.includes("scm") || name.includes("levator")) return POSE_MAP.neck;
  if (name.includes("roll") || name.includes("foam")) return POSE_MAP.foam_roll;
  if (name.includes("jump") || name.includes("high knee")) return POSE_MAP.jumping;
  if (name.includes("stretch") || name.includes("side")) return POSE_MAP.side_stretch;
  if (name.includes("circle") || name.includes("shrug") || name.includes("pull") || name.includes("raise")) return POSE_MAP.arms_up;
  if (name.includes("bird") || name.includes("dog")) return POSE_MAP.cat_cow;
  
  return POSE_MAP.standing;
}

interface ExerciseAvatarProps {
  exerciseName: string;
  side?: "left" | "right" | null;
  isPlaying: boolean;
  className?: string;
}

const ExerciseAvatar = ({ exerciseName, side, isPlaying, className = "" }: ExerciseAvatarProps) => {
  const pose = getExercisePose(exerciseName);
  
  return (
    <div className={`relative ${className}`}>
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ 
          background: "radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)" 
        }}
        animate={isPlaying ? { scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        style={{ transform: side === "right" ? "scaleX(-1)" : undefined }}
      >
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" fill="none" stroke="hsl(var(--border))" strokeWidth="1" opacity="0.3" />
        
        {/* Avatar stick figure */}
        <motion.path
          d={pose}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
        
        {/* Breathing/pulsing effect when playing */}
        {isPlaying && (
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
            opacity="0.2"
            animate={{ r: [44, 47, 44], opacity: [0.1, 0.3, 0.1] }}
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
