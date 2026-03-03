import { motion } from "framer-motion";
import { ArrowLeft, Download, TrendingUp, AlertTriangle, CheckCircle, XCircle, Activity, Zap, ShieldAlert } from "lucide-react";
import { format } from "date-fns";
import PostureAlignmentDiagram from "./PostureAlignmentDiagram";

interface MuscleImbalance {
  finding: string;
  overactive_tight: string[];
  underactive_weak: string[];
  possible_injuries: string[];
}

export interface AssessmentData {
  id: string;
  created_at: string;
  assessment_type: string;
  video_snapshot_url: string | null;
  overall_score: number;
  area_scores: Record<string, number>;
  joint_measurements: Record<string, any>;
  risk_flags: Array<{ area: string; severity: string; finding: string }>;
  muscle_imbalances?: MuscleImbalance[];
  findings_text: string | null;
  recommended_program_ids: string[];
}

interface MovementReportProps {
  assessment: AssessmentData;
  onBack: () => void;
  onOpenProgram?: (targetArea: string) => void;
  previousScore?: number | null;
}

const AREA_LABELS: Record<string, string> = {
  ankles: "Ankles", knees: "Knees", hips: "Hips", core: "Core", shoulders: "Shoulders",
};

const AREA_EMOJIS: Record<string, string> = {
  ankles: "🦶", knees: "🦵", hips: "🦴", core: "🧘", shoulders: "💪",
};

const severityColor = (s: string) => {
  if (s === "red") return "text-destructive bg-destructive/10 border-destructive/30";
  if (s === "yellow") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  return "text-emerald-400 bg-emerald-400/10 border-emerald-400/30";
};

const severityIcon = (s: string) => {
  if (s === "red") return <XCircle className="w-4 h-4" />;
  if (s === "yellow") return <AlertTriangle className="w-4 h-4" />;
  return <CheckCircle className="w-4 h-4" />;
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  return "text-destructive";
};

export default function MovementReport({ assessment, onBack, previousScore }: MovementReportProps) {
  const { area_scores, joint_measurements, risk_flags, findings_text, overall_score } = assessment;
  const muscleImbalances: MuscleImbalance[] = (assessment as any).muscle_imbalances || (assessment as any).raw_ai_response?.muscle_imbalances || [];
  const postureLandmarks = (assessment as any).posture_landmarks || (assessment as any).raw_ai_response?.posture_landmarks || {};

  const handleExport = () => {
    const content = `POSTURE + MOVEMENT REPORT
Date: ${format(new Date(assessment.created_at), "MMMM d, yyyy")}
Assessment: Overhead Squat

OVERALL SCORE: ${overall_score}/100

AREA SCORES:
${Object.entries(area_scores).map(([k, v]) => `  ${AREA_LABELS[k] || k}: ${v}/100`).join("\n")}

JOINT MEASUREMENTS:
  Knee Valgus Angle: ${joint_measurements.knee_valgus_angle ?? "N/A"}°
  Hip Shift: ${joint_measurements.hip_shift ?? "N/A"}
  Pelvic Tilt: ${joint_measurements.pelvic_tilt ?? "N/A"}
  Torso Forward Lean: ${joint_measurements.torso_forward_lean ?? "N/A"}°
  Ankle Dorsiflexion: ${joint_measurements.ankle_dorsiflexion_range ?? "N/A"}°
  Shoulder Flexion: ${joint_measurements.shoulder_flexion_range ?? "N/A"}°
  Squat Depth: ${joint_measurements.squat_depth ?? "N/A"}

RISK FLAGS:
${risk_flags.map(f => `  [${f.severity.toUpperCase()}] ${f.area}: ${f.finding}`).join("\n")}

MUSCLE IMBALANCE BREAKDOWN:
${muscleImbalances.map(m => `  Finding: ${m.finding}
    Overactive/Tight: ${m.overactive_tight.join(", ")}
    Underactive/Weak: ${m.underactive_weak.join(", ")}
    Possible Injuries: ${m.possible_injuries.join(", ")}`).join("\n\n")}

FINDINGS:
${findings_text || "No findings available."}
`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movement-report-${format(new Date(assessment.created_at), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-full bg-secondary">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div className="flex-1">
          <h2 className="font-display font-bold text-foreground text-base">Movement Analysis Report</h2>
          <p className="text-xs text-muted-foreground">{format(new Date(assessment.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
        </div>
        <button onClick={handleExport} className="p-2 rounded-full bg-secondary" aria-label="Export report">
          <Download className="w-4 h-4 text-foreground" />
        </button>
      </div>

      {/* Overall Score */}
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Overall Movement Score</p>
        <div className="relative w-28 h-28 mx-auto mb-3">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(overall_score / 100) * 264} 264`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className={`text-3xl font-display font-bold ${scoreColor(overall_score)}`}>{overall_score}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
        {previousScore != null && (
          <div className="flex items-center justify-center gap-1 text-xs">
            <TrendingUp className="w-3 h-3 text-primary" />
            <span className="text-muted-foreground">
              {overall_score > previousScore ? `+${overall_score - previousScore}` : overall_score - previousScore} from last assessment
            </span>
          </div>
        )}
      </div>

      {/* Snapshot */}
      {assessment.video_snapshot_url && (
        <div className="glass rounded-xl overflow-hidden">
          <img src={assessment.video_snapshot_url} alt="Assessment snapshot" className="w-full aspect-video object-cover" />
        </div>
      )}

      {/* Postural Alignment Diagram */}
      <PostureAlignmentDiagram landmarks={postureLandmarks} jointMeasurements={joint_measurements} />

      {/* Area Scores */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Area Scores
        </h3>
        <div className="space-y-3">
          {Object.entries(area_scores).map(([key, score]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-lg">{AREA_EMOJIS[key] || "🏋️"}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{AREA_LABELS[key] || key}</span>
                  <span className={`text-xs font-bold ${scoreColor(score)}`}>{score}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="h-full rounded-full"
                    style={{
                      background: score >= 80 ? "hsl(150, 60%, 45%)" : score >= 60 ? "hsl(45, 90%, 50%)" : "hsl(0, 72%, 51%)"
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Joint Measurements */}
      <div className="glass rounded-xl p-4">
        <h3 className="font-display font-semibold text-foreground text-sm mb-3">Joint Measurements</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Knee Valgus", value: joint_measurements.knee_valgus_angle, unit: "°", desc: "Inward knee collapse" },
            { label: "Hip Shift", value: joint_measurements.hip_shift, extra: joint_measurements.hip_shift_degrees ? `${joint_measurements.hip_shift_degrees}°` : null },
            { label: "Pelvic Tilt", value: joint_measurements.pelvic_tilt, extra: joint_measurements.pelvic_tilt_degrees ? `${joint_measurements.pelvic_tilt_degrees}°` : null },
            { label: "Torso Lean", value: joint_measurements.torso_forward_lean, unit: "°", desc: "Forward from vertical" },
            { label: "Ankle Dorsiflexion", value: joint_measurements.ankle_dorsiflexion_range, unit: "°", desc: "Normal: 15-20°" },
            { label: "Shoulder Flexion", value: joint_measurements.shoulder_flexion_range, unit: "°", desc: "Normal: 170-180°" },
            { label: "Squat Depth", value: joint_measurements.squat_depth },
            { label: "Head Position", value: joint_measurements.head_position, extra: joint_measurements.head_forward_degrees ? `${joint_measurements.head_forward_degrees}°` : null },
            { label: "Lumbar Curve", value: joint_measurements.lumbar_curve },
            { label: "Thoracic Curve", value: joint_measurements.thoracic_curve },
            { label: "Feet Turn Out", value: joint_measurements.feet_turn_out, extra: joint_measurements.feet_turn_out_degrees ? `${joint_measurements.feet_turn_out_degrees}°` : null },
            { label: "Weight Distribution", value: joint_measurements.weight_distribution },
          ].filter(item => item.value != null && item.value !== undefined).map((item, i) => {
            const isNeutralOrNormal = typeof item.value === "string" && ["neutral", "normal", "none", "even"].includes(item.value.toLowerCase());
            return (
              <div key={i} className={`rounded-lg p-3 ${isNeutralOrNormal ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-secondary/50"}`}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className={`text-sm font-semibold mt-0.5 ${isNeutralOrNormal ? "text-emerald-400" : "text-foreground"}`}>
                  {typeof item.value === "boolean" ? (item.value ? "Yes" : "No") : `${item.value}${item.unit || ""}`}
                </p>
                {item.extra && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.extra}</p>
                )}
                {item.desc && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 opacity-60">{item.desc}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Risk Flags */}
      {risk_flags.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Risk Assessment</h3>
          <div className="space-y-2">
            {risk_flags.map((flag, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg border ${severityColor(flag.severity)}`}>
                {severityIcon(flag.severity)}
                <div>
                  <p className="text-xs font-semibold">{flag.area}</p>
                  <p className="text-xs opacity-80 mt-0.5">{flag.finding}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Muscle Imbalance Breakdown */}
      {muscleImbalances.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Muscle Imbalance Breakdown
          </h3>
          <div className="space-y-4">
            {muscleImbalances.map((imb, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-secondary/50 rounded-lg p-3 space-y-2.5"
              >
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                  {imb.finding}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {/* Overactive / Tight */}
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-2.5">
                    <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider mb-1">
                      Overactive / Tight
                    </p>
                    <p className="text-xs text-foreground">{imb.overactive_tight.join(", ")}</p>
                  </div>
                  {/* Underactive / Weak */}
                  <div className="bg-primary/10 border border-primary/20 rounded-md p-2.5">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                      Underactive / Weak
                    </p>
                    <p className="text-xs text-foreground">{imb.underactive_weak.join(", ")}</p>
                  </div>
                  {/* Possible Injuries */}
                  {imb.possible_injuries.length > 0 && (
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-md p-2.5">
                      <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" /> Possible Injury Risk
                      </p>
                      <p className="text-xs text-foreground">{imb.possible_injuries.join(", ")}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Findings */}
      {findings_text && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-2">Analysis Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{findings_text}</p>
        </div>
      )}
    </motion.div>
  );
}
