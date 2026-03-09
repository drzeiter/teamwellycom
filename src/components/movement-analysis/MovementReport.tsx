import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, TrendingUp, AlertTriangle, CheckCircle, XCircle, Activity, Zap, ShieldAlert, Target, Link2, Stethoscope, Info, Eye, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import PostureAlignmentDiagram from "./PostureAlignmentDiagram";
import BodyMap from "./BodyMap";
import ReportAreaScores from "./ReportAreaScores";
import ReportJointMeasurements from "./ReportJointMeasurements";

interface MuscleImbalance {
  finding: string;
  overactive_tight: string[];
  underactive_weak: string[];
  possible_injuries: string[];
  confidence?: string;
}

interface SymptomCorrelation {
  pattern: string;
  likely_symptom_areas: string[];
  explanation: string;
}

interface CorrectivePriority {
  priority: number;
  focus: string;
  rationale: string;
}

interface PlaneAnalysis {
  detected: boolean;
  findings: string[];
}

interface RecommendedProtocol {
  title: string;
  purpose: string;
  duration_minutes: number;
  exercises: string[];
}

interface ObservedFinding {
  finding: string;
  confidence: string;
  angle_degrees: number | null;
  technical_term?: string;
}

interface ContributingFactor {
  factor: string;
  confidence: string;
  reasoning: string;
  confirmable_with?: string;
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { area_scores, joint_measurements, risk_flags, findings_text, overall_score } = assessment;
  const raw = (assessment as any).raw_ai_response || assessment;
  const muscleImbalances: MuscleImbalance[] = raw.muscle_imbalances || [];
  const postureLandmarks = raw.posture_landmarks || {};
  const compensationChain: string = raw.compensation_chain || "";
  const symptomCorrelation: SymptomCorrelation[] = raw.symptom_correlation || [];
  const correctivePriorities: CorrectivePriority[] = raw.corrective_priorities || [];
  const planeAnalysis: Record<string, PlaneAnalysis> = raw.plane_analysis || {};
  const bodyMap = raw.body_map || {};
  const confidenceNotes: string[] = raw.confidence_notes || [];
  const recommendedProtocols: RecommendedProtocol[] = raw.recommended_protocols || [];
  const observedFindings: ObservedFinding[] = raw.observed_findings || [];
  const contributingFactors: ContributingFactor[] = raw.possible_contributing_factors || [];
  const landmarkConfidence: Record<string, string> = raw.landmark_confidence || {};
  const cameraMirrored: boolean = raw.camera_mirrored || false;

  const isDesk = assessment.assessment_type === "desk_posture";

  const planeBadges = [
    { key: "sagittal", label: "Sagittal", color: "bg-primary/20 text-primary border-primary/30" },
    { key: "frontal", label: "Frontal", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { key: "transverse", label: "Rotational", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  ];

  const activePlanes = planeBadges.filter(p => planeAnalysis[p.key]?.detected);

  const handleExport = () => {
    const content = `POSTURE + MOVEMENT REPORT
Date: ${format(new Date(assessment.created_at), "MMMM d, yyyy")}

OVERALL SCORE: ${overall_score}/100

AREA SCORES:
${Object.entries(area_scores).map(([k, v]) => `  ${k}: ${v}/100`).join("\n")}

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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
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

      {/* Mirror Note + Plane Badges */}
      <div className="flex flex-wrap gap-2">
        {cameraMirrored && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wider bg-secondary text-muted-foreground border-border">
            ↔ Side-Corrected
          </span>
        )}
        {activePlanes.map(p => (
          <span key={p.key} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${p.color}`}>
            {p.label}
          </span>
        ))}
      </div>

      {/* Overall Score */}
      <div className="glass rounded-2xl p-5 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Overall Movement Score</p>
        <div className="relative w-28 h-28 mx-auto mb-3">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(overall_score / 100) * 264} 264`} />
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

      {/* === SECTION 1: What We Can Clearly See === */}
      {observedFindings.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" /> What We Can Clearly See
          </h3>
          <div className="space-y-2">
            {observedFindings.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 bg-secondary/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${f.confidence === "high" ? "bg-primary" : "bg-yellow-400"}`} />
                <div>
                  <p className="text-sm text-foreground">{f.finding}</p>
                  {f.angle_degrees != null && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">~{f.angle_degrees}° measured</p>
                  )}
                  {f.technical_term && (
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 italic">Technical: {f.technical_term}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SECTION 2: Main Findings Summary === */}
      {findings_text && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-2">Analysis Summary</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{findings_text}</p>
        </div>
      )}

      {/* === SECTION 3: Easy Measurements (plain language) === */}
      <ReportJointMeasurements measurements={joint_measurements} isDesk={isDesk} />

      {/* === SECTION 4: Possible Contributing Factors === */}
      {contributingFactors.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Brain className="w-4 h-4 text-yellow-400" /> Possible Contributing Factors
          </h3>
          <div className="space-y-2">
            {contributingFactors.map((f, i) => (
              <div key={i} className="p-3 bg-yellow-400/5 border border-yellow-400/15 rounded-lg">
                <p className="text-sm text-foreground">{f.factor}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{f.reasoning}</p>
                {f.confirmable_with && (
                  <p className="text-[10px] text-primary mt-1.5 font-medium">💡 Run a {f.confirmable_with} to confirm</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SECTION 5: Compensation Chain === */}
      {compensationChain && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> How It All Connects
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{compensationChain}</p>
        </div>
      )}

      {/* === SECTION 6: Body Map (simplified, high-confidence only) === */}
      <BodyMap
        overloadedTight={bodyMap.overloaded_tight || []}
        underactiveWeak={bodyMap.underactive_weak || []}
        symptomRisk={bodyMap.symptom_risk || []}
      />

      {/* === SECTION 7: Corrective Priorities === */}
      {correctivePriorities.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> What to Focus On
          </h3>
          <div className="space-y-2">
            {correctivePriorities.sort((a, b) => a.priority - b.priority).map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0">{c.priority}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{c.focus}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{c.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SECTION 8: Recommended Protocols === */}
      {recommendedProtocols.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Recommended Protocols</h3>
          <div className="space-y-3">
            {recommendedProtocols.map((protocol, i) => (
              <div key={i} className="bg-primary/5 border border-primary/15 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-foreground">{protocol.title}</p>
                  <span className="text-[10px] text-muted-foreground">{protocol.duration_minutes} min</span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-2">{protocol.purpose}</p>
                <div className="flex flex-wrap gap-1">
                  {protocol.exercises.slice(0, 5).map((ex, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-foreground">{ex}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === SECTION 9: Landmark Confidence === */}
      {Object.keys(landmarkConfidence).length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" /> Detection Confidence
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(landmarkConfidence).map(([region, level]) => {
              const label = region.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
              const color = level === "high" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : level === "moderate" ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                : "bg-destructive/10 border-destructive/20 text-destructive";
              return (
                <div key={region} className={`rounded-lg p-2.5 border ${color}`}>
                  <p className="text-[10px] uppercase tracking-wider opacity-70">{label}</p>
                  <p className="text-xs font-semibold capitalize mt-0.5">{level}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* === SECTION 10: Confidence Notes === */}
      {confidenceNotes.length > 0 && (
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-2 flex items-center gap-2">
            <Info className="w-4 h-4 text-muted-foreground" /> Notes
          </h3>
          <ul className="space-y-1.5">
            {confidenceNotes.map((note, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                <span className="mt-1 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* === ADVANCED VIEW TOGGLE === */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-secondary/50 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showAdvanced ? "Hide" : "Show"} Advanced Biomechanics
      </button>

      {showAdvanced && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-5">
          {/* Postural Alignment Diagram */}
          <PostureAlignmentDiagram landmarks={postureLandmarks} jointMeasurements={joint_measurements} />

          {/* Area Scores */}
          <ReportAreaScores areaScores={area_scores} />

          {/* Multi-Plane Detail */}
          {activePlanes.length > 0 && (
            <div className="glass rounded-xl p-4">
              <h3 className="font-display font-semibold text-foreground text-sm mb-3">Multi-Plane Analysis</h3>
              <div className="space-y-3">
                {planeBadges.map(p => {
                  const data = planeAnalysis[p.key];
                  if (!data?.detected || !data.findings?.length) return null;
                  return (
                    <div key={p.key}>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1.5 ${p.color.split(" ")[1]}`}>{p.label} Plane</p>
                      <ul className="space-y-1">
                        {data.findings.map((f, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                            <span className="mt-1 w-1 h-1 rounded-full bg-muted-foreground shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-secondary/50 rounded-lg p-3 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />
                      <p className="text-xs font-bold text-foreground flex-1">{imb.finding}</p>
                      {imb.confidence && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${imb.confidence === "high" ? "bg-emerald-500/15 text-emerald-400" : imb.confidence === "moderate" ? "bg-yellow-400/15 text-yellow-400" : "bg-muted text-muted-foreground"}`}>
                          {imb.confidence}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-2.5">
                        <p className="text-[10px] font-semibold text-destructive uppercase tracking-wider mb-1">Likely Overworked / Tight</p>
                        <p className="text-xs text-foreground">{imb.overactive_tight.join(", ")}</p>
                      </div>
                      <div className="bg-primary/10 border border-primary/20 rounded-md p-2.5">
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Likely Under-Supporting / Weak</p>
                        <p className="text-xs text-foreground">{imb.underactive_weak.join(", ")}</p>
                      </div>
                      {imb.possible_injuries.length > 0 && (
                        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-md p-2.5">
                          <p className="text-[10px] font-semibold text-yellow-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Potential Stress Areas
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

          {/* Symptom Correlation */}
          {symptomCorrelation.length > 0 && (
            <div className="glass rounded-xl p-4">
              <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" /> Potential Symptom Areas
              </h3>
              <div className="space-y-3">
                {symptomCorrelation.map((s, i) => (
                  <div key={i} className="bg-yellow-400/5 border border-yellow-400/15 rounded-lg p-3">
                    <p className="text-xs font-semibold text-foreground mb-1">{s.pattern}</p>
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      {s.likely_symptom_areas.map((area, j) => (
                        <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 font-medium">{area}</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{s.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
