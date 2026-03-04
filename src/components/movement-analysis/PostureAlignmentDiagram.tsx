import { motion } from "framer-motion";

interface PostureDeviation {
  landmark: string;
  direction: string;
  offset_cm_approx: number;
}

interface PostureLandmarks {
  side_view?: {
    ideal_plumb_line?: string;
    user_deviations?: PostureDeviation[];
  };
  front_view?: {
    ideal_alignment?: string;
    user_deviations?: PostureDeviation[];
  };
}

interface Props {
  landmarks: PostureLandmarks;
  jointMeasurements: Record<string, any>;
}

// Canonical side-view landmark Y positions (proportion of figure height)
const SIDE_LANDMARKS: Record<string, { y: number; label: string }> = {
  ear: { y: 0.08, label: "Ear" },
  shoulder: { y: 0.22, label: "Shoulder" },
  hip: { y: 0.48, label: "Hip" },
  knee: { y: 0.72, label: "Knee" },
  ankle: { y: 0.94, label: "Ankle" },
};

// Canonical front-view landmark positions
const FRONT_LANDMARKS: Record<string, { x: number; y: number; label: string }> = {
  left_shoulder: { x: 0.32, y: 0.22, label: "L Shoulder" },
  right_shoulder: { x: 0.68, y: 0.22, label: "R Shoulder" },
  left_hip: { x: 0.38, y: 0.48, label: "L Hip" },
  right_hip: { x: 0.62, y: 0.48, label: "R Hip" },
  left_knee: { x: 0.38, y: 0.72, label: "L Knee" },
  right_knee: { x: 0.62, y: 0.72, label: "R Knee" },
};

const SCALE = 3; // pixels per cm offset

function SideViewDiagram({ deviations, jointMeasurements }: { deviations: PostureDeviation[]; jointMeasurements: Record<string, any> }) {
  const w = 160;
  const h = 280;
  const idealX = w * 0.45;
  const padTop = 16;
  const figH = h - padTop * 2;

  const devMap: Record<string, PostureDeviation> = {};
  deviations.forEach((d) => { devMap[d.landmark] = d; });

  const idealPoints = Object.entries(SIDE_LANDMARKS).map(([, v]) => ({
    x: idealX,
    y: padTop + v.y * figH,
  }));

  const userPoints = Object.entries(SIDE_LANDMARKS).map(([key, v]) => {
    const dev = devMap[key];
    let offsetX = 0;
    if (dev) {
      const px = dev.offset_cm_approx * SCALE;
      if (dev.direction === "forward") offsetX = px;
      else if (dev.direction === "backward") offsetX = -px;
    }
    return {
      x: idealX + offsetX,
      y: padTop + v.y * figH,
      label: v.label,
      hasDeviation: !!dev && dev.offset_cm_approx > 0,
      dev,
    };
  });

  const idealPath = idealPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const userPath = userPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Side View</p>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Grid lines */}
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <line key={f} x1={0} y1={padTop + f * figH} x2={w} y2={padTop + f * figH} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.08} strokeDasharray="2 4" />
        ))}

        {/* Ideal line (green) */}
        <motion.path
          d={idealPath}
          fill="none"
          stroke="hsl(150, 60%, 45%)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="6 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* User line (red/primary) */}
        <motion.path
          d={userPath}
          fill="none"
          stroke="hsl(0, 72%, 55%)"
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        {/* Ideal dots */}
        {idealPoints.map((p, i) => (
          <circle key={`ideal-${i}`} cx={p.x} cy={p.y} r={3} fill="hsl(150, 60%, 45%)" opacity={0.6} />
        ))}

        {/* User dots + labels */}
        {userPoints.map((p, i) => (
          <g key={`user-${i}`}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={p.hasDeviation ? 5 : 3.5}
              fill={p.hasDeviation ? "hsl(0, 72%, 55%)" : "hsl(150, 60%, 45%)"}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            />
            <text
              x={p.x + (p.x > idealX ? 10 : -10)}
              y={p.y + 3}
              textAnchor={p.x > idealX ? "start" : "end"}
              fill="hsl(var(--foreground))"
              fontSize={8}
              fontWeight={p.hasDeviation ? 700 : 400}
              opacity={0.8}
            >
              {p.label}
            </text>
            {p.hasDeviation && p.dev && (
              <text
                x={p.x + (p.x > idealX ? 10 : -10)}
                y={p.y + 13}
                textAnchor={p.x > idealX ? "start" : "end"}
                fill="hsl(0, 72%, 55%)"
                fontSize={7}
              >
                {p.dev.direction} ~{p.dev.offset_cm_approx}cm
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-emerald-500 rounded" style={{ borderStyle: "dashed" }} />
          <span className="text-[9px] text-muted-foreground">Ideal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-red-500 rounded" />
          <span className="text-[9px] text-muted-foreground">You</span>
        </div>
      </div>
    </div>
  );
}

function FrontViewDiagram({ deviations }: { deviations: PostureDeviation[] }) {
  const w = 160;
  const h = 280;
  const centerX = w / 2;
  const padTop = 16;
  const figH = h - padTop * 2;

  const devMap: Record<string, PostureDeviation> = {};
  deviations.forEach((d) => { devMap[d.landmark] = d; });

  const landmarkOrder = ["left_shoulder", "right_shoulder", "left_hip", "right_hip", "left_knee", "right_knee"];

  const idealBodyLines = [
    // Shoulders
    { from: FRONT_LANDMARKS.left_shoulder, to: FRONT_LANDMARKS.right_shoulder },
    // Torso left
    { from: FRONT_LANDMARKS.left_shoulder, to: FRONT_LANDMARKS.left_hip },
    // Torso right
    { from: FRONT_LANDMARKS.right_shoulder, to: FRONT_LANDMARKS.right_hip },
    // Hips
    { from: FRONT_LANDMARKS.left_hip, to: FRONT_LANDMARKS.right_hip },
    // Left leg
    { from: FRONT_LANDMARKS.left_hip, to: FRONT_LANDMARKS.left_knee },
    // Right leg
    { from: FRONT_LANDMARKS.right_hip, to: FRONT_LANDMARKS.right_knee },
  ];

  const getPos = (key: string, ideal: { x: number; y: number }) => {
    const dev = devMap[key];
    let offX = 0, offY = 0;
    if (dev) {
      const px = dev.offset_cm_approx * SCALE;
      if (dev.direction === "inward") offX = key.startsWith("left") ? px : -px;
      if (dev.direction === "outward") offX = key.startsWith("left") ? -px : px;
      if (dev.direction === "higher") offY = -px;
      if (dev.direction === "lower") offY = px;
    }
    return {
      x: ideal.x * w + offX,
      y: padTop + ideal.y * figH + offY,
      hasDev: !!dev && dev.offset_cm_approx > 0,
    };
  };

  return (
    <div className="flex flex-col items-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 font-semibold">Front View</p>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {/* Center line */}
        <line x1={centerX} y1={padTop} x2={centerX} y2={h - padTop} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.1} strokeDasharray="2 4" />

        {/* Ideal body lines (green dashed) */}
        {idealBodyLines.map((line, i) => (
          <motion.line
            key={`ideal-line-${i}`}
            x1={line.from.x * w}
            y1={padTop + line.from.y * figH}
            x2={line.to.x * w}
            y2={padTop + line.to.y * figH}
            stroke="hsl(150, 60%, 45%)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            strokeOpacity={0.5}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
        ))}

        {/* User body connections (red) */}
        {[
          ["left_shoulder", "right_shoulder"],
          ["left_shoulder", "left_hip"],
          ["right_shoulder", "right_hip"],
          ["left_hip", "right_hip"],
          ["left_hip", "left_knee"],
          ["right_hip", "right_knee"],
        ].map(([from, to], i) => {
          const fromIdeal = FRONT_LANDMARKS[from];
          const toIdeal = FRONT_LANDMARKS[to];
          const fromPos = getPos(from, fromIdeal);
          const toPos = getPos(to, toIdeal);
          const hasDev = fromPos.hasDev || toPos.hasDev;
          return (
            <motion.line
              key={`user-line-${i}`}
              x1={fromPos.x}
              y1={fromPos.y}
              x2={toPos.x}
              y2={toPos.y}
              stroke={hasDev ? "hsl(0, 72%, 55%)" : "hsl(150, 60%, 45%)"}
              strokeWidth={2}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          );
        })}

        {/* User dots + labels */}
        {landmarkOrder.map((key) => {
          const ideal = FRONT_LANDMARKS[key];
          const pos = getPos(key, ideal);
          return (
            <g key={key}>
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={pos.hasDev ? 5 : 3.5}
                fill={pos.hasDev ? "hsl(0, 72%, 55%)" : "hsl(150, 60%, 45%)"}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
              />
              <text
                x={pos.x + (key.startsWith("left") ? -8 : 8)}
                y={pos.y - 8}
                textAnchor={key.startsWith("left") ? "end" : "start"}
                fill="hsl(var(--foreground))"
                fontSize={7}
                opacity={0.7}
              >
                {FRONT_LANDMARKS[key].label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-emerald-500 rounded" />
          <span className="text-[9px] text-muted-foreground">Ideal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-red-500 rounded" />
          <span className="text-[9px] text-muted-foreground">You</span>
        </div>
      </div>
    </div>
  );
}

export default function PostureAlignmentDiagram({ landmarks, jointMeasurements }: Props) {
  const sideDeviations = landmarks?.side_view?.user_deviations || [];
  const frontDeviations = landmarks?.front_view?.user_deviations || [];

  if (sideDeviations.length === 0 && frontDeviations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <h3 className="font-display font-semibold text-foreground text-sm mb-4 flex items-center gap-2">
        🧍 Postural Alignment
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <SideViewDiagram deviations={sideDeviations} jointMeasurements={jointMeasurements} />
        <FrontViewDiagram deviations={frontDeviations} />
      </div>
      <p className="text-[10px] text-muted-foreground mt-3 text-center">
        Green dashed = ideal alignment · Red solid = your positioning
      </p>
    </motion.div>
  );
}
