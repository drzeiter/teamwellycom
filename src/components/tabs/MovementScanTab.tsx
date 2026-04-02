import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Scan, Monitor, PersonStanding, ChevronRight, Clock, TrendingUp, Activity, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import CameraCapture from "@/components/movement-analysis/CameraCapture";
import MovementReport, { type AssessmentData } from "@/components/movement-analysis/MovementReport";
import MovementReplay from "@/components/movement-analysis/MovementReplay";
import logoWhite from "@/assets/logo-white.png";

type AnalysisType = "overhead_squat" | "desk_posture" | "running_form";

const ANALYSIS_CONFIG: Record<AnalysisType, {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  duration: number;
  instructions: string;
  color: string;
  description: string;
}> = {
  desk_posture: {
    title: "Desk Posture Scan",
    subtitle: "Seated Posture Assessment · ~5 sec",
    icon: <Monitor className="w-7 h-7" />,
    duration: 5,
    instructions: "Sit naturally at your desk. Position the camera to capture your side profile.",
    color: "from-blue-500 to-blue-400",
    description: "Analyze your posture using AI video feedback.",
  },
  overhead_squat: {
    title: "Squat Analysis",
    subtitle: "Overhead Squat Assessment · ~15 sec",
    icon: <PersonStanding className="w-7 h-7" />,
    duration: 12,
    instructions: "Stand 6–8 feet from the camera. Arms overhead, feet shoulder-width apart.",
    color: "from-primary to-primary/70",
    description: "Check squat depth, knee tracking, and mobility.",
  },
  running_form: {
    title: "Running / Gait Analysis",
    subtitle: "Running Gait Analysis · ~15 sec",
    icon: <Activity className="w-7 h-7" />,
    duration: 15,
    instructions: "Set up the camera to capture your side or front view while running.",
    color: "from-orange-500 to-orange-400",
    description: "Analyze stride, foot strike, and running posture.",
  },
};

export default function MovementScanTab() {
  const { user } = useAuth();
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
    return () => { window.dispatchEvent(new CustomEvent("welly-fab-visibility", { detail: { hidden: false } })); };
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

      let recommendedProgramIds: string[] = [];
      if (data.recommended_target_areas?.length) {
        const { data: programs } = await supabase.from("programs").select("id").in("target_area", data.recommended_target_areas);
        recommendedProgramIds = (programs || []).map((p: any) => p.id);
      }

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

      setReplayData({
        frames,
        frameLandmarks: data.frame_landmarks || [],
        deviationEvents: data.deviation_events || [],
        analysisType: activeAnalysis,
      });

      toast({ title: "Scan Complete! ✅", description: `Your score: ${data.overall_score}/100` });
      setShowCamera(false);
      setViewingReport(saved);
      await fetchAssessments();
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({ title: "Scan Failed", description: err.message || "Please try again", variant: "destructive" });
      setShowCamera(false);
    } finally {
      setAnalyzing(false);
    }
  };

  // Report view
  if (viewingReport) {
    const idx = assessments.findIndex(a => a.id === viewingReport.id);
    const previousScore = idx < assessments.length - 1 ? assessments[idx + 1]?.overall_score : null;
    const handleBack = () => { setViewingReport(null); setReplayData(null); setCapturedFrames([]); };
    return (
      <div className="min-h-screen bg-background pb-24 safe-top">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
          <button onClick={handleBack} className="p-2 rounded-full bg-secondary active:scale-95 transition-transform">
            <ArrowLeft className="w-4 h-4 text-foreground" />
          </button>
          <span className="font-display font-semibold text-foreground text-sm">Back to Movement Scan</span>
        </div>
        <div className="p-4">
          {replayData && replayData.frames.length > 0 && (
            <div className="mb-5">
              <h3 className="font-display font-semibold text-foreground text-sm mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" /> Slow-Motion Replay
              </h3>
              <MovementReplay {...replayData} />
            </div>
          )}
          <MovementReport assessment={viewingReport} onBack={handleBack} previousScore={previousScore} />

          {/* Book Coaching Call — always shown, emphasized when score < 85 */}
          <a
            href="https://calendly.com/drchriszeiter/30min"
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-6 w-full glass rounded-xl p-4 flex items-center gap-3 text-left transition-all active:scale-[0.98] block ${
              viewingReport.overall_score < 85 ? "border border-primary/40 bg-primary/5" : "hover:border-primary/30"
            }`}
          >
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-lg shrink-0">📞</div>
            <div className="flex-1">
              {viewingReport.overall_score < 85 ? (
                <>
                  <p className="text-xs text-primary/80 font-medium mb-0.5">Want expert guidance based on your scan?</p>
                  <h4 className="font-display font-bold text-foreground text-sm">Book a Coaching Call</h4>
                </>
              ) : (
                <>
                  <h4 className="font-display font-semibold text-foreground text-sm">Book a Coaching Call</h4>
                  <p className="text-xs text-muted-foreground">Get 1-on-1 guidance on your results</p>
                </>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6 px-5 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <img src={logoWhite} alt="" className="h-7 w-auto" />
        <div>
          <h1 className="font-display text-xl font-bold text-foreground">Movement Scan</h1>
          <p className="text-muted-foreground text-xs">AI-powered posture & movement analysis</p>
        </div>
      </div>

      {/* Scan Cards */}
      <div className="space-y-3 mb-8">
        {(Object.entries(ANALYSIS_CONFIG) as [AnalysisType, typeof ANALYSIS_CONFIG[AnalysisType]][]).map(([type, config], i) => (
          <motion.button
            key={type}
            onClick={() => startAnalysis(type)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileTap={{ scale: 0.97 }}
            className="w-full glass rounded-2xl p-5 flex items-center gap-4 group"
          >
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center shrink-0 text-white`}>
              {config.icon}
            </div>
            <div className="text-left flex-1">
              <p className="font-display font-bold text-foreground text-base">{config.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.button>
        ))}
      </div>

      {/* Latest Scores */}
      {assessments.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold text-foreground mb-3">Recent Scans</h3>
          <div className="space-y-2">
            {assessments.slice(0, 5).map((a, i) => {
              const typeConfig = ANALYSIS_CONFIG[a.assessment_type as AnalysisType];
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
                    <img src={a.video_snapshot_url} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                      <Scan className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{typeConfig?.title || "Scan"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(a.created_at), "MMM d, yyyy")} · {a.overall_score}/100</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${a.overall_score >= 80 ? "text-emerald-400" : a.overall_score >= 60 ? "text-yellow-400" : "text-orange-400"}`}>
                      {a.overall_score}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Camera */}
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
