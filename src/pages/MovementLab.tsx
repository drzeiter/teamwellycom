import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Scan, Monitor, PersonStanding, ChevronRight, Clock, TrendingUp, Activity } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import CameraCapture from "@/components/movement-analysis/CameraCapture";
import MovementReport, { type AssessmentData } from "@/components/movement-analysis/MovementReport";
import MovementReplay from "@/components/movement-analysis/MovementReplay";

type AnalysisType = "overhead_squat" | "desk_posture" | "running_form";

const ANALYSIS_CONFIG: Record<AnalysisType, {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  duration: number;
  instructions: string;
  color: string;
}> = {
  overhead_squat: {
    title: "Analyze Squat",
    subtitle: "Overhead Squat Assessment · ~15 sec",
    icon: <PersonStanding className="w-6 h-6" />,
    duration: 12,
    instructions: "Stand 6–8 feet from the camera. Arms overhead, feet shoulder-width apart. Perform a full squat when recording starts.",
    color: "from-primary to-primary/70",
  },
  desk_posture: {
    title: "Analyze Desk Posture",
    subtitle: "Seated Posture Assessment · ~5 sec",
    icon: <Monitor className="w-6 h-6" />,
    duration: 5,
    instructions: "Sit naturally at your desk. Position the camera to capture your side profile. Stay in your normal working posture.",
    color: "from-blue-500 to-blue-400",
  },
  running_form: {
    title: "Analyze Running Form",
    subtitle: "Running Gait Analysis · ~15 sec",
    icon: <Activity className="w-6 h-6" />,
    duration: 15,
    instructions: "Set up the camera to capture your side or front view while running on a treadmill or flat surface. Run at your normal pace.",
    color: "from-orange-500 to-orange-400",
  },
};

export default function MovementLab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get("type") as AnalysisType | null;
  const [loading, setLoading] = useState(true);
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisType | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [viewingReport, setViewingReport] = useState<AssessmentData | null>(null);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [replayData, setReplayData] = useState<any>(null);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("welly-fab-visibility", { detail: { hidden: showCamera } }));
    return () => {
      window.dispatchEvent(new CustomEvent("welly-fab-visibility", { detail: { hidden: false } }));
    };
  }, [showCamera]);

  useEffect(() => {
    if (!user) return;
    fetchAssessments();
  }, [user]);

  const fetchAssessments = async () => {
    if (!user) return;
    const { data } = await (supabase as any)
      .from("movement_assessments")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    setAssessments(data || []);
    setLoading(false);
  };

  const startAnalysis = (type: AnalysisType) => {
    setActiveAnalysis(type);
    setShowCamera(true);
  };

  const handleCaptureComplete = async (frames: string[], snapshot: string) => {
    if (!user || !activeAnalysis) return;
    setAnalyzing(true);
    setCapturedFrames(frames);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-movement", {
        body: { frames, analysis_type: activeAnalysis },
      });

      if (error) throw error;

      // Match recommended programs
      let recommendedProgramIds: string[] = [];
      if (data.recommended_target_areas?.length) {
        const { data: programs } = await supabase
          .from("programs")
          .select("id")
          .in("target_area", data.recommended_target_areas);
        recommendedProgramIds = (programs || []).map((p: any) => p.id);
      }

      // Save to database
      const { data: saved, error: saveError } = await (supabase as any)
        .from("movement_assessments")
        .insert({
          user_id: user.id,
          assessment_type: activeAnalysis,
          video_snapshot_url: snapshot,
          overall_score: data.overall_score || 0,
          area_scores: data.area_scores || {},
          joint_measurements: data.joint_measurements || {},
          risk_flags: data.risk_flags || [],
          findings_text: data.findings_text || null,
          recommended_program_ids: recommendedProgramIds,
          raw_ai_response: data,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Store replay data
      setReplayData({
        frames,
        frameLandmarks: data.frame_landmarks || [],
        deviationEvents: data.deviation_events || [],
        analysisType: activeAnalysis,
      });

      toast({ title: "Assessment Complete! ✅", description: `Your movement score: ${data.overall_score}/100` });
      setShowCamera(false);
      setViewingReport(saved);
      await fetchAssessments();
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({ title: "Analysis Failed", description: err.message || "Please try again", variant: "destructive" });
      setShowCamera(false);
    } finally {
      setAnalyzing(false);
    }
  };

  // Report view
  if (viewingReport) {
    const idx = assessments.findIndex(a => a.id === viewingReport.id);
    const previousScore = idx < assessments.length - 1 ? assessments[idx + 1]?.overall_score : null;
    return (
      <div className="min-h-screen bg-background p-4 pb-24 safe-top">
        {/* Replay section */}
        {replayData && replayData.frames.length > 0 && (
          <div className="mb-5">
            <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Slow-Motion Replay
            </h3>
            <MovementReplay {...replayData} />
          </div>
        )}
        <MovementReport
          assessment={viewingReport}
          onBack={() => { setViewingReport(null); setReplayData(null); setCapturedFrames([]); }}
          previousScore={previousScore}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-top">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-secondary">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="font-display font-bold text-foreground text-lg">Movement Lab</h1>
          <p className="text-xs text-muted-foreground">AI-powered movement & posture analysis</p>
        </div>
      </div>

      <div className="px-4 pb-24 space-y-5">
        {/* Analysis Tools */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">Analysis Tools</p>
          <div className="space-y-3">
            {(Object.entries(ANALYSIS_CONFIG) as [AnalysisType, typeof ANALYSIS_CONFIG[AnalysisType]][]).map(([type, config], i) => (
              <motion.button
                key={type}
                onClick={() => startAnalysis(type)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileTap={{ scale: 0.97 }}
                className="w-full glass rounded-xl p-4 flex items-center gap-4 group"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shrink-0 text-white`}>
                  {config.icon}
                </div>
                <div className="text-left flex-1">
                  <p className="font-display font-semibold text-foreground text-sm">{config.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{config.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Assessment History */}
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-3">Assessment History</p>
          {loading ? (
            <div className="glass rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground">Loading...</p>
            </div>
          ) : assessments.length > 0 ? (
            <div className="space-y-2">
              {assessments.map((a, i) => {
                const typeConfig = ANALYSIS_CONFIG[a.assessment_type as AnalysisType];
                const prevScore = i < assessments.length - 1 ? assessments[i + 1]?.overall_score : null;
                const diff = prevScore != null ? a.overall_score - prevScore : null;
                return (
                  <motion.button
                    key={a.id}
                    onClick={() => setViewingReport(a)}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="w-full glass rounded-xl p-3 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                  >
                    {a.video_snapshot_url ? (
                      <img src={a.video_snapshot_url} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Scan className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {typeConfig?.title || "Assessment"} · {a.overall_score}/100
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{format(new Date(a.created_at), "MMM d, yyyy")}</span>
                        {diff != null && (
                          <span className={diff >= 0 ? "text-emerald-400" : "text-destructive"}>
                            <TrendingUp className="w-3 h-3 inline" /> {diff > 0 ? "+" : ""}{diff}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </motion.button>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-xl p-6 text-center">
              <Scan className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-foreground font-medium mb-1">No assessments yet</p>
              <p className="text-xs text-muted-foreground">Choose an analysis tool above to start</p>
            </div>
          )}
        </div>
      </div>

      {/* Camera Capture */}
      <AnimatePresence>
        {showCamera && activeAnalysis && (
          <CameraCapture
            open={showCamera}
            onClose={() => { setShowCamera(false); setActiveAnalysis(null); }}
            onCaptureComplete={handleCaptureComplete}
            analysisType={activeAnalysis}
            recordDuration={ANALYSIS_CONFIG[activeAnalysis].duration}
            instructions={ANALYSIS_CONFIG[activeAnalysis].instructions}
            title={ANALYSIS_CONFIG[activeAnalysis].title}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
