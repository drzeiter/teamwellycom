import { motion } from "framer-motion";
import { ArrowLeft, Download, TrendingUp, AlertTriangle, CheckCircle, XCircle, Activity } from "lucide-react";
import { format } from "date-fns";

export interface AssessmentData {
  id: string;
  created_at: string;
  assessment_type: string;
  video_snapshot_url: string | null;
  overall_score: number;
  area_scores: Record<string, number>;
  joint_measurements: Record<string, any>;
  risk_flags: Array<{ area: string; severity: string; finding: string }>;
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
            { label: "Knee Valgus", value: joint_measurements.knee_valgus_angle, unit: "°" },
            { label: "Hip Shift", value: joint_measurements.hip_shift },
            { label: "Pelvic Tilt", value: joint_measurements.pelvic_tilt },
            { label: "Torso Lean", value: joint_measurements.torso_forward_lean, unit: "°" },
            { label: "Ankle Dorsiflexion", value: joint_measurements.ankle_dorsiflexion_range, unit: "°" },
            { label: "Shoulder Flexion", value: joint_measurements.shoulder_flexion_range, unit: "°" },
            { label: "Squat Depth", value: joint_measurements.squat_depth },
          ].map((item, i) => (
            <div key={i} className="bg-secondary/50 rounded-lg p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {item.value != null ? `${item.value}${item.unit || ""}` : "N/A"}
              </p>
            </div>
          ))}
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
