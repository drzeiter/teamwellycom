import { motion } from "framer-motion";

interface BodyMapProps {
  overloadedTight: string[];
  underactiveWeak: string[];
  symptomRisk: string[];
}

// Map region names from AI to SVG body part positions
const REGION_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  // Head / Neck
  head: { x: 50, y: 8, label: "Head" },
  neck: { x: 50, y: 14, label: "Neck" },
  deep_neck_flexors: { x: 50, y: 14, label: "Deep Neck Flexors" },
  left_scm: { x: 44, y: 14, label: "L SCM" },
  right_scm: { x: 56, y: 14, label: "R SCM" },
  // Shoulders / Upper
  left_upper_trap: { x: 38, y: 18, label: "L Upper Trap" },
  right_upper_trap: { x: 62, y: 18, label: "R Upper Trap" },
  upper_trapezius: { x: 50, y: 18, label: "Upper Trap" },
  left_levator_scapulae: { x: 40, y: 20, label: "L Levator Scap" },
  right_levator_scapulae: { x: 60, y: 20, label: "R Levator Scap" },
  levator_scapulae: { x: 50, y: 20, label: "Levator Scap" },
  left_scalenes: { x: 42, y: 16, label: "L Scalenes" },
  right_scalenes: { x: 58, y: 16, label: "R Scalenes" },
  scalenes: { x: 50, y: 16, label: "Scalenes" },
  left_shoulder: { x: 30, y: 22, label: "L Shoulder" },
  right_shoulder: { x: 70, y: 22, label: "R Shoulder" },
  shoulders: { x: 50, y: 22, label: "Shoulders" },
  serratus_anterior: { x: 50, y: 30, label: "Serratus Anterior" },
  left_serratus: { x: 32, y: 30, label: "L Serratus" },
  right_serratus: { x: 68, y: 30, label: "R Serratus" },
  lower_trapezius: { x: 50, y: 28, label: "Lower Trap" },
  left_lower_trap: { x: 40, y: 28, label: "L Lower Trap" },
  right_lower_trap: { x: 60, y: 28, label: "R Lower Trap" },
  scapular_stabilizers: { x: 50, y: 26, label: "Scap Stabilizers" },
  rhomboids: { x: 50, y: 26, label: "Rhomboids" },
  // Chest / Pecs
  pectorals: { x: 50, y: 26, label: "Pecs" },
  left_pec: { x: 38, y: 26, label: "L Pec" },
  right_pec: { x: 62, y: 26, label: "R Pec" },
  // Core / Trunk
  core: { x: 50, y: 38, label: "Core" },
  core_stabilizers: { x: 50, y: 38, label: "Core Stabilizers" },
  deep_core: { x: 50, y: 40, label: "Deep Core" },
  obliques: { x: 50, y: 36, label: "Obliques" },
  left_obliques: { x: 36, y: 36, label: "L Obliques" },
  right_obliques: { x: 64, y: 36, label: "R Obliques" },
  abdominals: { x: 50, y: 36, label: "Abs" },
  // Back
  erector_spinae: { x: 50, y: 34, label: "Erector Spinae" },
  left_erector_spinae: { x: 44, y: 34, label: "L Erector Spinae" },
  right_erector_spinae: { x: 56, y: 34, label: "R Erector Spinae" },
  left_ql: { x: 38, y: 40, label: "L QL" },
  right_ql: { x: 62, y: 40, label: "R QL" },
  ql: { x: 50, y: 40, label: "QL" },
  lats: { x: 50, y: 32, label: "Lats" },
  low_back: { x: 50, y: 42, label: "Low Back" },
  left_low_back: { x: 44, y: 42, label: "L Low Back" },
  right_low_back: { x: 56, y: 42, label: "R Low Back" },
  thoracic: { x: 50, y: 30, label: "Thoracic" },
  // Hip
  hip_flexors: { x: 50, y: 46, label: "Hip Flexors" },
  left_hip_flexor: { x: 40, y: 46, label: "L Hip Flexor" },
  right_hip_flexor: { x: 60, y: 46, label: "R Hip Flexor" },
  left_hip: { x: 38, y: 48, label: "L Hip" },
  right_hip: { x: 62, y: 48, label: "R Hip" },
  left_glute_med: { x: 34, y: 50, label: "L Glute Med" },
  right_glute_med: { x: 66, y: 50, label: "R Glute Med" },
  glute_med: { x: 50, y: 50, label: "Glute Med" },
  left_glute_max: { x: 38, y: 52, label: "L Glute Max" },
  right_glute_max: { x: 62, y: 52, label: "R Glute Max" },
  glute_max: { x: 50, y: 52, label: "Glute Max" },
  glutes: { x: 50, y: 50, label: "Glutes" },
  tfl: { x: 50, y: 48, label: "TFL" },
  left_tfl: { x: 34, y: 48, label: "L TFL" },
  right_tfl: { x: 66, y: 48, label: "R TFL" },
  piriformis: { x: 50, y: 52, label: "Piriformis" },
  // Thigh
  adductors: { x: 50, y: 56, label: "Adductors" },
  left_adductor: { x: 44, y: 56, label: "L Adductor" },
  right_adductor: { x: 56, y: 56, label: "R Adductor" },
  hamstrings: { x: 50, y: 60, label: "Hamstrings" },
  left_hamstring: { x: 42, y: 60, label: "L Hamstring" },
  right_hamstring: { x: 58, y: 60, label: "R Hamstring" },
  quadriceps: { x: 50, y: 58, label: "Quads" },
  it_band: { x: 50, y: 58, label: "IT Band" },
  // Knee
  left_knee: { x: 42, y: 66, label: "L Knee" },
  right_knee: { x: 58, y: 66, label: "R Knee" },
  knee: { x: 50, y: 66, label: "Knee" },
  // Lower leg
  calves: { x: 50, y: 74, label: "Calves" },
  left_calf: { x: 42, y: 74, label: "L Calf" },
  right_calf: { x: 58, y: 74, label: "R Calf" },
  soleus: { x: 50, y: 76, label: "Soleus" },
  gastrocnemius: { x: 50, y: 72, label: "Gastroc" },
  tibialis_anterior: { x: 50, y: 70, label: "Tib Anterior" },
  shin: { x: 50, y: 70, label: "Shin" },
  // Ankle / Foot
  left_ankle: { x: 42, y: 82, label: "L Ankle" },
  right_ankle: { x: 58, y: 82, label: "R Ankle" },
  ankles: { x: 50, y: 82, label: "Ankles" },
  foot: { x: 50, y: 88, label: "Foot" },
  foot_intrinsics: { x: 50, y: 88, label: "Foot Intrinsics" },
};

function normalizeRegion(region: string): string {
  return region.toLowerCase().replace(/[\s\/\-]+/g, "_").replace(/[()]/g, "");
}

function getPosition(region: string): { x: number; y: number; label: string } | null {
  const normalized = normalizeRegion(region);
  // Direct match
  if (REGION_POSITIONS[normalized]) return REGION_POSITIONS[normalized];
  // Partial match
  for (const [key, val] of Object.entries(REGION_POSITIONS)) {
    if (normalized.includes(key) || key.includes(normalized)) return val;
  }
  // Keyword fallback
  if (normalized.includes("trap")) return REGION_POSITIONS.upper_trapezius;
  if (normalized.includes("glute") && normalized.includes("med")) return REGION_POSITIONS.glute_med;
  if (normalized.includes("glute")) return REGION_POSITIONS.glute_max;
  if (normalized.includes("neck") || normalized.includes("cervical")) return REGION_POSITIONS.neck;
  if (normalized.includes("shoulder")) return REGION_POSITIONS.shoulders;
  if (normalized.includes("hip")) return REGION_POSITIONS.left_hip;
  if (normalized.includes("back") || normalized.includes("lumbar")) return REGION_POSITIONS.low_back;
  if (normalized.includes("core") || normalized.includes("abdom")) return REGION_POSITIONS.core;
  if (normalized.includes("knee")) return REGION_POSITIONS.knee;
  if (normalized.includes("ankle")) return REGION_POSITIONS.ankles;
  if (normalized.includes("calf") || normalized.includes("gastro") || normalized.includes("soleus")) return REGION_POSITIONS.calves;
  return null;
}

type DotColor = "red" | "blue" | "yellow";

function Dot({ x, y, color, label, delay }: { x: number; y: number; color: DotColor; label: string; delay: number }) {
  const colors: Record<DotColor, { fill: string; ring: string; text: string }> = {
    red: { fill: "fill-red-500", ring: "stroke-red-400/40", text: "text-red-400" },
    blue: { fill: "fill-blue-500", ring: "stroke-blue-400/40", text: "text-blue-400" },
    yellow: { fill: "fill-yellow-500", ring: "stroke-yellow-400/40", text: "text-yellow-400" },
  };
  const c = colors[color];
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <circle cx={x} cy={y} r="3.5" className={`${c.ring}`} strokeWidth="6" fill="none" opacity="0.3">
        <animate attributeName="r" values="3.5;6;3.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r="2.5" className={c.fill} />
      <text x={x} y={y - 5} textAnchor="middle" className={`${c.text} text-[2.5px] font-medium`} fill="currentColor">
        {label.length > 14 ? label.slice(0, 12) + "…" : label}
      </text>
    </motion.g>
  );
}

export default function BodyMap({ overloadedTight, underactiveWeak, symptomRisk }: BodyMapProps) {
  if (!overloadedTight.length && !underactiveWeak.length && !symptomRisk.length) return null;

  const dots: { x: number; y: number; color: DotColor; label: string }[] = [];
  const usedPositions = new Set<string>();

  const addDots = (regions: string[], color: DotColor) => {
    for (const region of regions) {
      const pos = getPosition(region);
      if (!pos) continue;
      const key = `${Math.round(pos.x)}-${Math.round(pos.y)}-${color}`;
      if (usedPositions.has(key)) continue;
      usedPositions.add(key);
      dots.push({ x: pos.x, y: pos.y, color, label: pos.label });
    }
  };

  addDots(overloadedTight, "red");
  addDots(underactiveWeak, "blue");
  addDots(symptomRisk, "yellow");

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-display font-semibold text-foreground text-sm mb-3">Body Map</h3>
      <div className="flex gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-[10px] text-muted-foreground">Tight / Overloaded</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-[10px] text-muted-foreground">Weak / Underactive</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="text-[10px] text-muted-foreground">Symptom Risk</span>
        </div>
      </div>
      <svg viewBox="0 0 100 95" className="w-full max-w-[220px] mx-auto">
        {/* Simple body silhouette */}
        <g opacity="0.15" fill="currentColor" className="text-foreground">
          {/* Head */}
          <circle cx="50" cy="8" r="5" />
          {/* Neck */}
          <rect x="48" y="13" width="4" height="4" rx="1" />
          {/* Torso */}
          <path d="M36 17 L64 17 Q68 17 68 21 L68 45 Q68 49 64 49 L36 49 Q32 49 32 45 L32 21 Q32 17 36 17 Z" />
          {/* Left arm */}
          <rect x="24" y="18" width="7" height="26" rx="3" />
          {/* Right arm */}
          <rect x="69" y="18" width="7" height="26" rx="3" />
          {/* Pelvis */}
          <path d="M34 49 L66 49 L62 56 L38 56 Z" />
          {/* Left leg */}
          <rect x="38" y="56" width="9" height="28" rx="4" />
          {/* Right leg */}
          <rect x="53" y="56" width="9" height="28" rx="4" />
          {/* Feet */}
          <ellipse cx="42" cy="87" rx="5" ry="2.5" />
          <ellipse cx="58" cy="87" rx="5" ry="2.5" />
        </g>
        {/* Dots */}
        {dots.map((dot, i) => (
          <Dot key={`${dot.x}-${dot.y}-${dot.color}`} {...dot} delay={i * 0.05} />
        ))}
      </svg>
    </div>
  );
}
