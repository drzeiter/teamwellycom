import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronRight, Play, Check, Trash2, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isTomorrow, isPast } from "date-fns";

const AREA_ICONS: Record<string, string> = {
  "Low Back": "🔻", "Hips": "🦴", "Shoulders": "💪", "Neck": "🦒",
  "Foot/Ankle": "🦶", "Knee": "🦵", "Thoracic Spine": "🔄", "Hamstrings": "🦿",
  "Glutes": "🍑", "Desk": "🖥️", "Full Body": "🧘", "Warm-Up": "🔥",
};

interface EnrolledProgram {
  id: string;
  program_id: string;
  enrolled_at: string;
  is_active: boolean;
  current_week: number;
  program?: {
    id: string;
    name: string;
    target_area: string;
    duration_weeks: number | null;
    description: string | null;
    category_type: string;
    duration_minutes: number;
  };
}

interface ScheduledTask {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  program_id: string | null;
  is_completed: boolean;
}

export default function MyPlan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrolledProgram[]>([]);
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      // Fetch enrolled programs
      const { data: enrollData } = await (supabase as any)
        .from("user_enrolled_programs")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("enrolled_at", { ascending: false });

      if (enrollData && enrollData.length > 0) {
        // Fetch program details for each enrollment
        const programIds = enrollData.map((e: any) => e.program_id);
        const { data: programData } = await supabase
          .from("programs")
          .select("id, name, target_area, duration_weeks, description, category_type, duration_minutes")
          .in("id", programIds);

        const programMap = Object.fromEntries((programData || []).map(p => [p.id, p]));
        const enriched = enrollData.map((e: any) => ({ ...e, program: programMap[e.program_id] }));
        setEnrollments(enriched);
      } else {
        setEnrollments([]);
      }

      // Fetch scheduled tasks
      const { data: taskData } = await (supabase as any)
        .from("scheduled_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .order("scheduled_at", { ascending: true })
        .limit(10);

      if (taskData) setTasks(taskData);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const markTaskDone = async (id: string) => {
    await (supabase as any).from("scheduled_tasks").update({ is_completed: true }).eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteTask = async (id: string) => {
    await (supabase as any).from("scheduled_tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const removeEnrollment = async (id: string) => {
    await (supabase as any).from("user_enrolled_programs").update({ is_active: false }).eq("id", id);
    setEnrollments(prev => prev.filter(e => e.id !== id));
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return `Today ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow ${format(d, "h:mm a")}`;
    return format(d, "MMM d, h:mm a");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">Loading your plan...</p>
        </div>
      </div>
    );
  }

  const hasContent = enrollments.length > 0 || tasks.length > 0;

  return (
    <div className="space-y-6">
      {/* Enrolled Programs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <h2 className="font-display text-sm font-bold text-foreground">My Programs</h2>
          {enrollments.length > 0 && (
            <span className="text-[10px] text-muted-foreground ml-auto">{enrollments.length} active</span>
          )}
        </div>

        {enrollments.length === 0 ? (
          <div className="glass rounded-xl p-5 text-center">
            <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No programs added yet</p>
            <p className="text-xs text-muted-foreground mt-1">Browse Programs and tap "Add to My Plan" to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {enrollments.map((enrollment, i) => {
                const prog = enrollment.program;
                if (!prog) return null;
                const isPerformance = (prog.duration_weeks || 0) >= 12;
                return (
                  <motion.div
                    key={enrollment.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.03 }}
                    className="glass rounded-xl p-4 relative group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-xl shrink-0">
                        {AREA_ICONS[prog.target_area] || "🏋️"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display font-semibold text-foreground text-sm truncate">{prog.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {isPerformance ? `Week ${enrollment.current_week} of ${prog.duration_weeks}` : `${prog.duration_minutes} min`}
                          {" · "}{prog.target_area}
                        </p>
                        {isPerformance && (
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1.5 w-full max-w-[120px]">
                            <div
                              className="h-full gradient-primary rounded-full transition-all"
                              style={{ width: `${(enrollment.current_week / (prog.duration_weeks || 12)) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isPerformance) {
                              navigate(`/program/${prog.id}`);
                            } else {
                              navigate(`/player/${prog.id}`);
                            }
                          }}
                          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground active:scale-95 transition-transform"
                        >
                          <Play className="w-3 h-3" />
                          {isPerformance ? "Open" : "Start"}
                        </button>
                        <button
                          onClick={() => removeEnrollment(enrollment.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
                          aria-label="Remove from plan"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Scheduled Tasks */}
      {tasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary" />
            <h2 className="font-display text-sm font-bold text-foreground">Scheduled Tasks</h2>
            <span className="text-[10px] text-muted-foreground ml-auto">{tasks.length} upcoming</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <AnimatePresence>
              {tasks.map((task, i) => {
                const overdue = isPast(new Date(task.scheduled_at));
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03 }}
                    className={`glass rounded-xl p-3 relative group ${overdue ? "border-wellness-coral/30" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <h4 className="font-display font-semibold text-foreground text-xs leading-tight line-clamp-2">{task.title}</h4>
                      <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5" aria-label="Delete">
                        <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                    <p className={`text-[10px] mb-2 ${overdue ? "text-wellness-coral font-medium" : "text-muted-foreground"}`}>
                      {overdue ? "⏰ " : "📅 "}{formatTime(task.scheduled_at)} · {task.duration_minutes}m
                    </p>
                    <div className="flex gap-1.5">
                      {task.program_id && (
                        <button onClick={() => navigate(`/player/${task.program_id}`)} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg gradient-primary text-primary-foreground active:scale-95 transition-transform">
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}
                      <button onClick={() => markTaskDone(task.id)} className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-wellness-green/20 text-wellness-green active:scale-95 transition-transform">
                        <Check className="w-3 h-3" /> Done
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {!hasContent && (
        <div className="glass rounded-xl p-6 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Your plan is empty</p>
          <p className="text-xs text-muted-foreground">Add programs from the Programs tab or ask Welly AI to schedule a routine for you.</p>
        </div>
      )}
    </div>
  );
}
