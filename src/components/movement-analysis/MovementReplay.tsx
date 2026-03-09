import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, AlertTriangle } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface Landmark {
  x: number;
  y: number;
}

interface FrameLandmarkData {
  frame_index: number;
  landmarks: Record<string, Landmark>;
  joint_angles?: Record<string, number>;
  alignment_status?: Record<string, "green" | "yellow" | "red">;
}

interface DeviationEvent {
  frame_index: number;
  label: string;
  severity: "yellow" | "red";
  body_area: string;
}

interface MovementReplayProps {
  frames: string[];
  frameLandmarks: FrameLandmarkData[];
  deviationEvents: DeviationEvent[];
  analysisType: string;
}

const SKELETON_CONNECTIONS: Record<string, [string, string][]> = {
  overhead_squat: [
    ["head", "spine_top"], ["spine_top", "left_shoulder"], ["spine_top", "right_shoulder"],
    ["left_shoulder", "left_elbow"], ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"], ["right_elbow", "right_wrist"],
    ["spine_top", "spine_mid"], ["spine_mid", "pelvis_center"],
    ["pelvis_center", "left_hip"], ["pelvis_center", "right_hip"],
    ["left_hip", "left_knee"], ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"], ["right_knee", "right_ankle"],
  ],
  desk_posture: [
    ["head", "spine_top"], ["spine_top", "left_shoulder"], ["spine_top", "right_shoulder"],
    ["left_shoulder", "left_elbow"], ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"], ["right_elbow", "right_wrist"],
    ["spine_top", "spine_mid"], ["spine_mid", "pelvis_center"],
    ["pelvis_center", "left_hip"], ["pelvis_center", "right_hip"],
    ["left_hip", "left_knee"], ["right_hip", "right_knee"],
  ],
  running_form: [
    ["head", "spine_top"], ["spine_top", "left_shoulder"], ["spine_top", "right_shoulder"],
    ["left_shoulder", "left_elbow"], ["left_elbow", "left_wrist"],
    ["right_shoulder", "right_elbow"], ["right_elbow", "right_wrist"],
    ["spine_top", "spine_mid"], ["spine_mid", "pelvis_center"],
    ["pelvis_center", "left_hip"], ["pelvis_center", "right_hip"],
    ["left_hip", "left_knee"], ["left_knee", "left_ankle"],
    ["right_hip", "right_knee"], ["right_knee", "right_ankle"],
    ["left_ankle", "left_foot"], ["right_ankle", "right_foot"],
  ],
};

const ALIGNMENT_LINES: Record<string, { from: string; to: string; label: string }[]> = {
  overhead_squat: [
    { from: "pelvis_center", to: "spine_top", label: "Spine Line" },
    { from: "left_hip", to: "right_hip", label: "Pelvic Line" },
    { from: "left_knee", to: "left_ankle", label: "L Knee Track" },
    { from: "right_knee", to: "right_ankle", label: "R Knee Track" },
  ],
  desk_posture: [
    { from: "head", to: "pelvis_center", label: "Spine Alignment" },
    { from: "left_shoulder", to: "right_shoulder", label: "Shoulder Line" },
  ],
  running_form: [
    { from: "left_hip", to: "right_hip", label: "Hip Level" },
    { from: "pelvis_center", to: "spine_top", label: "Trunk Line" },
  ],
};

const statusColor = (status?: string) => {
  if (status === "red") return "hsl(0, 72%, 51%)";
  if (status === "yellow") return "hsl(45, 93%, 47%)";
  return "hsl(142, 71%, 45%)";
};

export default function MovementReplay({ frames, frameLandmarks, deviationEvents, analysisType }: MovementReplayProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  const [showAlignmentLines, setShowAlignmentLines] = useState(true);
  const intervalRef = useRef<number | null>(null);
  const totalFrames = frames.length;

  // Map AI frame landmarks to actual frame indices
  const getLandmarksForFrame = useCallback((frameIdx: number): FrameLandmarkData | null => {
    if (!frameLandmarks.length) return null;
    // Map frame index to closest analyzed frame
    const ratio = frameLandmarks.length / totalFrames;
    const aiIdx = Math.min(Math.floor(frameIdx * ratio), frameLandmarks.length - 1);
    return frameLandmarks[aiIdx] || null;
  }, [frameLandmarks, totalFrames]);

  const getDeviationsForFrame = useCallback((frameIdx: number): DeviationEvent[] => {
    if (!deviationEvents.length) return [];
    const ratio = frameLandmarks.length / totalFrames;
    const aiIdx = Math.floor(frameIdx * ratio);
    return deviationEvents.filter(d => d.frame_index === aiIdx);
  }, [deviationEvents, frameLandmarks.length, totalFrames]);

  // Slow-motion playback at 0.5x (every 100ms = ~10fps at 0.5x of original 20fps capture)
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentFrame(prev => {
          if (prev >= totalFrames - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100); // 0.5x speed
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, totalFrames]);

  const connections = SKELETON_CONNECTIONS[analysisType] || SKELETON_CONNECTIONS.overhead_squat;
  const alignmentLines = ALIGNMENT_LINES[analysisType] || [];
  const currentLandmarks = getLandmarksForFrame(currentFrame);
  const currentDeviations = getDeviationsForFrame(currentFrame);

  const togglePlay = () => {
    if (currentFrame >= totalFrames - 1) setCurrentFrame(0);
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Video + Overlay */}
      <div className="relative aspect-[3/4] bg-black overflow-hidden">
        {frames[currentFrame] && (
          <img
            src={frames[currentFrame]}
            alt={`Frame ${currentFrame + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* SVG Skeleton Overlay */}
        {currentLandmarks && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1 1" preserveAspectRatio="none">
            {/* Skeleton connections */}
            {showSkeleton && connections.map(([from, to], i) => {
              const a = currentLandmarks.landmarks[from];
              const b = currentLandmarks.landmarks[to];
              if (!a || !b) return null;
              // Determine color from alignment status
              const areaKey = from.includes("knee") || to.includes("knee") ? "knees" :
                from.includes("hip") || to.includes("hip") ? "hips" :
                from.includes("shoulder") ? "shoulders" :
                from.includes("ankle") ? "ankles" : "spine";
              const status = currentLandmarks.alignment_status?.[areaKey];
              return (
                <line
                  key={i}
                  x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={statusColor(status)}
                  strokeWidth="0.004"
                  strokeLinecap="round"
                  opacity={0.9}
                />
              );
            })}

            {/* Alignment lines */}
            {showAlignmentLines && alignmentLines.map((line, i) => {
              const a = currentLandmarks.landmarks[line.from];
              const b = currentLandmarks.landmarks[line.to];
              if (!a || !b) return null;
              return (
                <g key={`align-${i}`}>
                  <line
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.003"
                    strokeDasharray="0.008 0.004"
                    opacity={0.7}
                  />
                </g>
              );
            })}

            {/* Joint points */}
            {showSkeleton && Object.entries(currentLandmarks.landmarks).map(([name, pos]) => {
              if (!pos) return null;
              return (
                <circle
                  key={name}
                  cx={pos.x} cy={pos.y}
                  r="0.008"
                  fill="white"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.003"
                />
              );
            })}

            {/* Joint angles text */}
            {showAngles && currentLandmarks.joint_angles && Object.entries(currentLandmarks.joint_angles).map(([key, angle]) => {
              // Place angle text near the relevant joint
              const jointName = key.replace("_angle", "").replace("left_", "left_").replace("right_", "right_");
              const pos = currentLandmarks.landmarks[jointName] || currentLandmarks.landmarks[key.split("_")[0] + "_" + key.split("_")[1]];
              if (!pos || typeof angle !== "number") return null;
              return (
                <text
                  key={key}
                  x={pos.x + 0.02}
                  y={pos.y - 0.015}
                  fill="white"
                  fontSize="0.022"
                  fontFamily="monospace"
                  stroke="black"
                  strokeWidth="0.004"
                  paintOrder="stroke"
                >
                  {Math.round(angle)}°
                </text>
              );
            })}
          </svg>
        )}

        {/* Deviation Labels */}
        {currentDeviations.length > 0 && (
          <div className="absolute top-3 left-3 right-3 space-y-1.5">
            {currentDeviations.map((dev, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md text-xs font-semibold ${
                  dev.severity === "red"
                    ? "bg-destructive/80 text-white"
                    : "bg-yellow-500/80 text-black"
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                {dev.label}
              </motion.div>
            ))}
          </div>
        )}

        {/* Frame counter */}
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-mono px-2 py-1 rounded-md backdrop-blur-sm">
          {currentFrame + 1} / {totalFrames} · 0.5x
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3">
        {/* Timeline Scrubber */}
        <div className="relative">
          <Slider
            value={[currentFrame]}
            max={totalFrames - 1}
            step={1}
            onValueChange={([v]) => { setCurrentFrame(v); setIsPlaying(false); }}
          />
          {/* Deviation markers on timeline */}
          <div className="absolute top-0 left-0 right-0 h-2 pointer-events-none">
            {deviationEvents.map((dev, i) => {
              const pos = (dev.frame_index / (frameLandmarks.length || 1)) * totalFrames;
              const pct = (pos / totalFrames) * 100;
              return (
                <div
                  key={i}
                  className={`absolute top-0 w-1 h-2 rounded-full ${dev.severity === "red" ? "bg-destructive" : "bg-yellow-400"}`}
                  style={{ left: `${pct}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Playback buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
            className="p-2 rounded-full bg-secondary active:scale-90 transition-transform"
          >
            <SkipBack className="w-4 h-4 text-foreground" />
          </button>
          <button
            onClick={togglePlay}
            className="p-3 rounded-full gradient-primary active:scale-90 transition-transform"
          >
            {isPlaying ? <Pause className="w-5 h-5 text-primary-foreground" /> : <Play className="w-5 h-5 text-primary-foreground ml-0.5" />}
          </button>
          <button
            onClick={() => setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1))}
            className="p-2 rounded-full bg-secondary active:scale-90 transition-transform"
          >
            <SkipForward className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {[
            { label: "Skeleton", active: showSkeleton, toggle: () => setShowSkeleton(!showSkeleton) },
            { label: "Angles", active: showAngles, toggle: () => setShowAngles(!showAngles) },
            { label: "Alignment", active: showAlignmentLines, toggle: () => setShowAlignmentLines(!showAlignmentLines) },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.toggle}
              className={`text-[10px] font-semibold px-3 py-1 rounded-full transition-colors ${
                btn.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
