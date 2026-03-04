import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, ChevronRight, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import CameraCapture from "./CameraCapture";
import MovementReport, { type AssessmentData } from "./MovementReport";

export default function AssessmentSection() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [viewingReport, setViewingReport] = useState<AssessmentData | null>(null);

  // Hide Welly FAB when camera is open
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
      .order("created_at", { ascending: false });
    setAssessments(data || []);
    setLoading(false);
  };

  const handleCaptureComplete = async (frames: string[], snapshot: string) => {
    if (!user) return;
    setAnalyzing(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-movement", {
        body: { frames },
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
          assessment_type: "overhead_squat",
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

  // Show report view
  if (viewingReport) {
    const idx = assessments.findIndex(a => a.id === viewingReport.id);
    const previousScore = idx < assessments.length - 1 ? assessments[idx + 1]?.overall_score : null;
    return (
      <MovementReport
        assessment={viewingReport}
        onBack={() => setViewingReport(null)}
        previousScore={previousScore}
      />
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Scan className="w-4 h-4 text-primary" />
        <h2 className="font-display text-sm font-bold text-foreground">Posture + Movement Analysis</h2>
      </div>

      {/* Start Assessment Button */}
      <motion.button
        onClick={() => setShowCamera(true)}
        whileTap={{ scale: 0.97 }}
        className="w-full glass rounded-xl p-4 flex items-center gap-4 mb-4 group"
      >
        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Scan className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="text-left flex-1">
          <p className="font-display font-semibold text-foreground text-sm">Analyze My Movement</p>
          <p className="text-xs text-muted-foreground">Overhead Squat Assessment · ~15 sec</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </motion.button>

      {/* Past Assessments */}
      {loading ? (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">Loading assessments...</p>
        </div>
      ) : assessments.length > 0 ? (
        <div>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">Past Assessments</p>
          <div className="space-y-2">
            {assessments.map((a, i) => {
              const prevScore = i < assessments.length - 1 ? assessments[i + 1]?.overall_score : null;
              const diff = prevScore != null ? a.overall_score - prevScore : null;
              return (
                <motion.button
                  key={a.id}
                  onClick={() => setViewingReport(a)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
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
                    <p className="text-sm font-semibold text-foreground">Score: {a.overall_score}/100</p>
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
        </div>
      ) : (
        <div className="glass rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">No assessments yet. Tap above to start your first one!</p>
        </div>
      )}

      {/* Camera Capture Modal */}
      <AnimatePresence>
        {showCamera && (
          <CameraCapture
            open={showCamera}
            onClose={() => setShowCamera(false)}
            onCaptureComplete={handleCaptureComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
