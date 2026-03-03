import { motion } from "framer-motion";
import { useState } from "react";

interface PostureDeviation {
  landmark: string;
  direction: string;
  offset_cm_approx: number;
}

interface JointPosition {
  landmark: string;
  x: number; // 0-1 proportion from left
  y: number; // 0-1 proportion from top
  score?: number; // 0-100 alignment score
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
  skeleton_joints?: JointPosition[];
  ideal_skeleton_joints?: JointPosition[];
}

interface Props {
  landmarks: PostureLandmarks;
  jointMeasurements: Record<string, any>;
  snapshotUrl?: string | null;
}

// Skeleton connections (pairs of landmark names to draw lines between)
const SKELETON_CONNECTIONS = [
  ["head", "neck"],
  ["neck", "left_shoulder"],
  ["neck", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["right_shoulder", "right_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_elbow", "right_wrist"],
  ["neck", "spine_mid"],
  ["spine_mid", "pelvis"],
  ["pelvis", "left_hip"],
  ["pelvis", "right_hip"],
  ["left_hip", "left_knee"],
  ["right_hip", "right_knee"],
  ["left_knee", "left_ankle"],
  ["right_knee", "right_ankle"],
  ["left_ankle", "left_foot"],
  ["right_ankle", "right_foot"],
];

// Default skeleton proportions (front-facing standing pose) for ideal overlay
const DEFAULT_IDEAL_JOINTS: Record<string, { x: number; y: number }> = {
  head: { x: 0.5, y: 0.06 },
  neck: { x: 0.5, y: 0.14 },
  left_shoulder: { x: 0.36, y: 0.18 },
  right_shoulder: { x: 0.64, y: 0.18 },
  left_elbow: { x: 0.28, y: 0.34 },
  right_elbow: { x: 0.72, y: 0.34 },
  left_wrist: { x: 0.24, y: 0.48 },
  right_wrist: { x: 0.76, y: 0.48 },
  spine_mid: { x: 0.5, y: 0.32 },
  pelvis: { x: 0.5, y: 0.46 },
  left_hip: { x: 0.42, y: 0.48 },
  right_hip: { x: 0.58, y: 0.48 },
  left_knee: { x: 0.42, y: 0.68 },
  right_knee: { x: 0.58, y: 0.68 },
  left_ankle: { x: 0.42, y: 0.88 },
  right_ankle: { x: 0.58, y: 0.88 },
  left_foot: { x: 0.40, y: 0.94 },
  right_foot: { x: 0.60, y: 0.94 },
};

// Generate ideal skeleton from user skeleton by vertically aligning
function generateIdealFromUser(userJoints: Record<string, { x: number; y: number }>): Record<string, { x: number; y: number }> {
  const centerX = 0.5;
  // If we have user joints, use their vertical positions but center horizontally and symmetrize
  const ideal: Record<string, { x: number; y: number }> = {};
  
  const headY = userJoints.head?.y ?? DEFAULT_IDEAL_JOINTS.head.y;
  const ankleY = userJoints.left_ankle?.y ?? userJoints.right_ankle?.y ?? DEFAULT_IDEAL_JOINTS.left_ankle.y;
  const figHeight = ankleY - headY;
  
  // Build ideal with proper vertical stacking
  for (const [key, defaultPos] of Object.entries(DEFAULT_IDEAL_JOINTS)) {
    if (userJoints[key]) {
      // Use user's Y position but ideal X offset from center
      const idealOffsetX = defaultPos.x - 0.5;
      ideal[key] = {
        x: centerX + idealOffsetX,
        y: userJoints[key].y, // Keep same vertical position
      };
    } else {
      ideal[key] = { ...defaultPos };
    }
  }
  
  return ideal;
}

function JointScoreBadge({ score, x, y }: { score: number; x: number; y: number }) {
  const color = score >= 80 ? "hsl(150, 60%, 45%)" : score >= 60 ? "hsl(45, 90%, 50%)" : "hsl(0, 72%, 55%)";
  return (
    <g>
      <rect x={x - 14} y={y - 18} width={28} height={14} rx={4} fill="hsla(0,0%,0%,0.7)" />
      <text x={x} y={y - 8} textAnchor="middle" fill={color} fontSize={9} fontWeight={700}>
        {score}
      </text>
    </g>
  );
}

export default function PostureAlignmentDiagram({ landmarks, jointMeasurements, snapshotUrl }: Props) {
  const [showIdeal, setShowIdeal] = useState(true);
  const [showUser, setShowUser] = useState(true);
  const [showScores, setShowScores] = useState(true);
  const [imgDimensions, setImgDimensions] = useState({ w: 400, h: 600 });

  const skeletonJoints = landmarks?.skeleton_joints || [];
  const idealJointsRaw = landmarks?.ideal_skeleton_joints || [];
  const sideDeviations = landmarks?.side_view?.user_deviations || [];
  const frontDeviations = landmarks?.front_view?.user_deviations || [];

  // Build user joint map
  const userJointMap: Record<string, { x: number; y: number; score?: number }> = {};
  skeletonJoints.forEach((j) => {
    userJointMap[j.landmark] = { x: j.x, y: j.y, score: j.score };
  });

  // Build ideal joint map
  let idealJointMap: Record<string, { x: number; y: number }> = {};
  if (idealJointsRaw.length > 0) {
    idealJointsRaw.forEach((j) => {
      idealJointMap[j.landmark] = { x: j.x, y: j.y };
    });
  } else if (skeletonJoints.length > 0) {
    idealJointMap = generateIdealFromUser(userJointMap);
  }

  const hasData = skeletonJoints.length > 0 || sideDeviations.length > 0 || frontDeviations.length > 0;
  if (!hasData && !snapshotUrl) return null;

  // If no skeleton data but we have the old deviation data, fall back to basic display
  if (skeletonJoints.length === 0) {
    return <FallbackDiagram landmarks={landmarks} jointMeasurements={jointMeasurements} />;
  }

  const w = imgDimensions.w;
  const h = imgDimensions.h;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-3 pb-0">
        <h3 className="font-display font-semibold text-foreground text-sm flex items-center gap-2">
          🧍 Postural Alignment
        </h3>
      </div>

      {/* Toggle controls */}
      <div className="flex items-center gap-3 px-3 pt-2 pb-1">
        <button
          onClick={() => setShowUser(!showUser)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
            showUser ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-secondary text-muted-foreground"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-red-500" />
          You
        </button>
        <button
          onClick={() => setShowIdeal(!showIdeal)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
            showIdeal ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-secondary text-muted-foreground"
          }`}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Ideal
        </button>
        <button
          onClick={() => setShowScores(!showScores)}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${
            showScores ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground"
          }`}
        >
          Scores
        </button>
      </div>

      {/* Image + Skeleton Overlay */}
      <div className="relative mx-3 mb-3 mt-1 rounded-lg overflow-hidden">
        {snapshotUrl && (
          <img
            src={snapshotUrl}
            alt="Assessment snapshot"
            className="w-full block"
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              setImgDimensions({ w: img.naturalWidth, h: img.naturalHeight });
            }}
          />
        )}
        
        {/* SVG Overlay */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 1 1`}
          preserveAspectRatio="none"
          style={{ pointerEvents: "none" }}
        >
          {/* Semi-transparent overlay for better visibility */}
          {!snapshotUrl && (
            <rect x={0} y={0} width={1} height={1} fill="hsl(var(--background))" opacity={0.9} />
          )}

          {/* Ideal skeleton (green) */}
          {showIdeal && Object.keys(idealJointMap).length > 0 && (
            <g>
              {SKELETON_CONNECTIONS.map(([from, to], i) => {
                const fromJoint = idealJointMap[from];
                const toJoint = idealJointMap[to];
                if (!fromJoint || !toJoint) return null;
                return (
                  <motion.line
                    key={`ideal-line-${i}`}
                    x1={fromJoint.x}
                    y1={fromJoint.y}
                    x2={toJoint.x}
                    y2={toJoint.y}
                    stroke="hsl(150, 70%, 50%)"
                    strokeWidth={0.004}
                    strokeDasharray="0.008 0.006"
                    strokeLinecap="round"
                    opacity={0.7}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6 }}
                  />
                );
              })}
              {Object.entries(idealJointMap).map(([key, pos]) => (
                <circle
                  key={`ideal-dot-${key}`}
                  cx={pos.x}
                  cy={pos.y}
                  r={0.006}
                  fill="hsl(150, 70%, 50%)"
                  opacity={0.6}
                />
              ))}
            </g>
          )}

          {/* User skeleton (red) */}
          {showUser && Object.keys(userJointMap).length > 0 && (
            <g>
              {SKELETON_CONNECTIONS.map(([from, to], i) => {
                const fromJoint = userJointMap[from];
                const toJoint = userJointMap[to];
                if (!fromJoint || !toJoint) return null;
                return (
                  <motion.line
                    key={`user-line-${i}`}
                    x1={fromJoint.x}
                    y1={fromJoint.y}
                    x2={toJoint.x}
                    y2={toJoint.y}
                    stroke="hsl(0, 80%, 55%)"
                    strokeWidth={0.005}
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                );
              })}
              {Object.entries(userJointMap).map(([key, pos]) => {
                const hasLowScore = pos.score != null && pos.score < 70;
                return (
                  <motion.circle
                    key={`user-dot-${key}`}
                    cx={pos.x}
                    cy={pos.y}
                    r={hasLowScore ? 0.01 : 0.007}
                    fill={hasLowScore ? "hsl(0, 80%, 55%)" : "hsl(45, 90%, 55%)"}
                    stroke="hsla(0,0%,0%,0.5)"
                    strokeWidth={0.002}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                );
              })}
            </g>
          )}
        </svg>

        {/* Score badges rendered in a separate absolutely positioned SVG to avoid preserveAspectRatio issues */}
        {showScores && showUser && (
          <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
            {Object.entries(userJointMap).map(([key, pos]) => {
              if (pos.score == null || pos.score === undefined) return null;
              // Only show scores for major joints
              const majorJoints = ["head", "left_shoulder", "right_shoulder", "pelvis", "left_hip", "right_hip", "left_knee", "right_knee", "left_ankle", "right_ankle"];
              if (!majorJoints.includes(key)) return null;
              const color = pos.score >= 80 ? "rgb(74, 222, 128)" : pos.score >= 60 ? "rgb(250, 204, 21)" : "rgb(248, 113, 113)";
              return (
                <div
                  key={`score-${key}`}
                  className="absolute text-[9px] font-bold px-1 py-0.5 rounded"
                  style={{
                    left: `${pos.x * 100}%`,
                    top: `${pos.y * 100}%`,
                    transform: "translate(-50%, -150%)",
                    backgroundColor: "rgba(0,0,0,0.75)",
                    color,
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {pos.score}
                </div>
              );
            })}
          </div>
        )}

        {/* No image placeholder */}
        {!snapshotUrl && (
          <div className="w-full aspect-[3/4] bg-secondary/50 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">No snapshot available</p>
          </div>
        )}
      </div>

      {/* Deviation summary beneath */}
      <DeviationSummary jointMeasurements={jointMeasurements} userJointMap={userJointMap} />
    </motion.div>
  );
}

// Compact deviation summary cards
function DeviationSummary({ jointMeasurements, userJointMap }: { jointMeasurements: Record<string, any>; userJointMap: Record<string, { x: number; y: number; score?: number }> }) {
  const scores = Object.entries(userJointMap)
    .filter(([, v]) => v.score != null)
    .map(([key, v]) => ({ key, score: v.score! }))
    .sort((a, b) => a.score - b.score);

  if (scores.length === 0) return null;

  const labelMap: Record<string, string> = {
    head: "Head Posture", neck: "Neck", left_shoulder: "L Shoulder", right_shoulder: "R Shoulder",
    spine_mid: "Mid Spine", pelvis: "Pelvis", left_hip: "L Hip", right_hip: "R Hip",
    left_knee: "L Knee", right_knee: "R Knee", left_ankle: "L Ankle", right_ankle: "R Ankle",
    left_elbow: "L Elbow", right_elbow: "R Elbow", left_wrist: "L Wrist", right_wrist: "R Wrist",
    left_foot: "L Foot", right_foot: "R Foot",
  };

  return (
    <div className="px-3 pb-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Joint Alignment Scores</p>
      <div className="grid grid-cols-3 gap-1.5">
        {scores.slice(0, 12).map(({ key, score }) => {
          const color = score >= 80 ? "text-emerald-400" : score >= 60 ? "text-yellow-400" : "text-red-400";
          const bg = score >= 80 ? "bg-emerald-500/10" : score >= 60 ? "bg-yellow-500/10" : "bg-red-500/10";
          return (
            <div key={key} className={`${bg} rounded-md px-2 py-1.5 text-center`}>
              <p className="text-[9px] text-muted-foreground truncate">{labelMap[key] || key}</p>
              <p className={`text-xs font-bold ${color}`}>{score}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Fallback for old assessments without skeleton_joints data
function FallbackDiagram({ landmarks, jointMeasurements }: { landmarks: PostureLandmarks; jointMeasurements: Record<string, any> }) {
  const sideDeviations = landmarks?.side_view?.user_deviations || [];
  const frontDeviations = landmarks?.front_view?.user_deviations || [];
  
  if (sideDeviations.length === 0 && frontDeviations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-xl p-4"
    >
      <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
        🧍 Postural Alignment
      </h3>
      <div className="space-y-2">
        {sideDeviations.map((d, i) => (
          <div key={`side-${i}`} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
            <span className="text-xs text-foreground capitalize">{d.landmark}</span>
            <span className="text-xs text-red-400">{d.direction} ~{d.offset_cm_approx}cm</span>
          </div>
        ))}
        {frontDeviations.map((d, i) => (
          <div key={`front-${i}`} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
            <span className="text-xs text-foreground capitalize">{d.landmark.replace(/_/g, " ")}</span>
            <span className="text-xs text-red-400">{d.direction} ~{d.offset_cm_approx}cm</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
