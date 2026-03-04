import { motion } from "framer-motion";
import { useState } from "react";

interface JointPosition {
  landmark: string;
  x: number;
  y: number;
  score?: number;
}

interface PostureLandmarks {
  skeleton_joints?: JointPosition[];
  ideal_skeleton_joints?: JointPosition[];
  side_view?: { user_deviations?: { landmark: string; direction: string; offset_cm_approx: number }[] };
  front_view?: { user_deviations?: { landmark: string; direction: string; offset_cm_approx: number }[] };
}

interface Props {
  landmarks: PostureLandmarks;
  jointMeasurements: Record<string, any>;
  snapshotUrl?: string | null;
}

// Single clean path through the body — one continuous line per side
const SPINE_PATH = ["head", "neck", "spine_mid", "pelvis"];
const LEFT_ARM = ["neck", "left_shoulder", "left_elbow", "left_wrist"];
const RIGHT_ARM = ["neck", "right_shoulder", "right_elbow", "right_wrist"];
const LEFT_LEG = ["pelvis", "left_hip", "left_knee", "left_ankle", "left_foot"];
const RIGHT_LEG = ["pelvis", "right_hip", "right_knee", "right_ankle", "right_foot"];
const SHOULDER_LINE = ["left_shoulder", "right_shoulder"];
const HIP_LINE = ["left_hip", "right_hip"];

const ALL_PATHS = [SPINE_PATH, LEFT_ARM, RIGHT_ARM, LEFT_LEG, RIGHT_LEG, SHOULDER_LINE, HIP_LINE];

const MAJOR_JOINTS = ["head", "left_shoulder", "right_shoulder", "pelvis", "left_knee", "right_knee", "left_ankle", "right_ankle"];

const LABEL_MAP: Record<string, string> = {
  head: "Head", neck: "Neck", left_shoulder: "L Shoulder", right_shoulder: "R Shoulder",
  spine_mid: "Spine", pelvis: "Pelvis", left_hip: "L Hip", right_hip: "R Hip",
  left_knee: "L Knee", right_knee: "R Knee", left_ankle: "L Ankle", right_ankle: "R Ankle",
  left_elbow: "L Elbow", right_elbow: "R Elbow", left_wrist: "L Wrist", right_wrist: "R Wrist",
  left_foot: "L Foot", right_foot: "R Foot",
};

function buildJointMap(joints: JointPosition[]): Record<string, { x: number; y: number; score?: number }> {
  const map: Record<string, { x: number; y: number; score?: number }> = {};
  joints.forEach((j) => { map[j.landmark] = { x: j.x, y: j.y, score: j.score }; });
  return map;
}

function scoreColor(score: number): string {
  if (score >= 80) return "rgb(74, 222, 128)";
  if (score >= 60) return "rgb(250, 204, 21)";
  return "rgb(248, 113, 113)";
}

function scoreTailwind(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/10";
  if (score >= 60) return "bg-yellow-500/10";
  return "bg-red-500/10";
}

/** Build an SVG polyline points string from a path of landmark names */
function buildPolylinePoints(path: string[], map: Record<string, { x: number; y: number }>): string | null {
  const points: string[] = [];
  for (const name of path) {
    const p = map[name];
    if (!p) return null; // skip if any joint missing
    points.push(`${p.x},${p.y}`);
  }
  return points.length >= 2 ? points.join(" ") : null;
}

export default function PostureAlignmentDiagram({ landmarks, jointMeasurements, snapshotUrl }: Props) {
  const [showIdeal, setShowIdeal] = useState(true);
  const [showUser, setShowUser] = useState(true);
  const [showScores, setShowScores] = useState(true);

  const userJoints = landmarks?.skeleton_joints || [];
  const idealJoints = landmarks?.ideal_skeleton_joints || [];

  if (userJoints.length === 0 && !snapshotUrl) return null;

  const userMap = buildJointMap(userJoints);
  const idealMap = buildJointMap(idealJoints);

  const scores = Object.entries(userMap)
    .filter(([, v]) => v.score != null)
    .map(([key, v]) => ({ key, score: v.score! }))
    .sort((a, b) => a.score - b.score);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 pb-0">
        <h3 className="font-display font-semibold text-foreground text-sm">🧍 Postural Alignment</h3>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1">
        <ToggleChip active={showUser} color="red" label="You" onClick={() => setShowUser(!showUser)} />
        <ToggleChip active={showIdeal} color="emerald" label="Ideal" onClick={() => setShowIdeal(!showIdeal)} />
        <ToggleChip active={showScores} color="primary" label="Scores" onClick={() => setShowScores(!showScores)} />
      </div>

      {/* Image + Overlay */}
      <div className="relative mx-3 mb-1 mt-1 rounded-lg overflow-hidden">
        {snapshotUrl ? (
          <img src={snapshotUrl} alt="Assessment snapshot" className="w-full block rounded-lg" />
        ) : (
          <div className="w-full aspect-[3/4] bg-secondary/50 flex items-center justify-center rounded-lg">
            <p className="text-xs text-muted-foreground">No snapshot available</p>
          </div>
        )}

        {/* SVG skeleton overlay */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1 1" preserveAspectRatio="none" style={{ pointerEvents: "none" }}>
          {/* Ideal skeleton — single green dashed polylines */}
          {showIdeal && Object.keys(idealMap).length > 0 && (
            <g opacity={0.55}>
              {ALL_PATHS.map((path, i) => {
                const pts = buildPolylinePoints(path, idealMap);
                if (!pts) return null;
                return (
                  <polyline key={`ideal-${i}`} points={pts} fill="none"
                    stroke="hsl(150,70%,50%)" strokeWidth={0.004} strokeDasharray="0.01 0.006"
                    strokeLinecap="round" strokeLinejoin="round" />
                );
              })}
              {Object.entries(idealMap).map(([k, p]) => (
                <circle key={`id-${k}`} cx={p.x} cy={p.y} r={0.006} fill="hsl(150,70%,50%)" opacity={0.4} />
              ))}
            </g>
          )}

          {/* User skeleton — single red solid polylines */}
          {showUser && Object.keys(userMap).length > 0 && (
            <g>
              {ALL_PATHS.map((path, i) => {
                const pts = buildPolylinePoints(path, userMap);
                if (!pts) return null;
                return (
                  <motion.polyline key={`user-${i}`} points={pts} fill="none"
                    stroke="hsl(0,80%,55%)" strokeWidth={0.005} strokeLinecap="round" strokeLinejoin="round"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: i * 0.08 }} />
                );
              })}
              {Object.entries(userMap).map(([k, p]) => {
                const bad = p.score != null && p.score < 70;
                return (
                  <circle key={`ud-${k}`} cx={p.x} cy={p.y} r={bad ? 0.009 : 0.007}
                    fill={bad ? "hsl(0,80%,55%)" : "hsl(45,90%,55%)"} stroke="rgba(0,0,0,0.5)" strokeWidth={0.002} />
                );
              })}
            </g>
          )}
        </svg>

        {/* Score badges */}
        {showScores && showUser && (
          <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
            {Object.entries(userMap).map(([key, pos]) => {
              if (pos.score == null || !MAJOR_JOINTS.includes(key)) return null;
              return (
                <div key={`s-${key}`} className="absolute text-[9px] font-bold px-1 py-0.5 rounded"
                  style={{
                    left: `${pos.x * 100}%`, top: `${pos.y * 100}%`,
                    transform: "translate(-50%, -150%)",
                    backgroundColor: "rgba(0,0,0,0.75)", color: scoreColor(pos.score!),
                    backdropFilter: "blur(4px)",
                  }}>
                  {pos.score}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Joint Scores Grid */}
      {scores.length > 0 && (
        <div className="px-3 pb-3 pt-2">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Joint Alignment Scores</p>
          <div className="grid grid-cols-3 gap-1.5">
            {scores.slice(0, 12).map(({ key, score }) => (
              <div key={key} className={`${scoreBg(score)} rounded-md px-2 py-1.5 text-center`}>
                <p className="text-[9px] text-muted-foreground truncate">{LABEL_MAP[key] || key}</p>
                <p className={`text-xs font-bold ${scoreTailwind(score)}`}>{score}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function ToggleChip({ active, color, label, onClick }: { active: boolean; color: string; label: string; onClick: () => void }) {
  const activeClass = color === "red"
    ? "bg-red-500/20 text-red-400 border border-red-500/30"
    : color === "emerald"
    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
    : "bg-primary/20 text-primary border border-primary/30";
  const dotColor = color === "red" ? "bg-red-500" : color === "emerald" ? "bg-emerald-500" : "bg-primary";

  return (
    <button onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold transition-all ${active ? activeClass : "bg-secondary text-muted-foreground"}`}>
      {color !== "primary" && <div className={`w-2 h-2 rounded-full ${dotColor}`} />}
      {label}
    </button>
  );
}
