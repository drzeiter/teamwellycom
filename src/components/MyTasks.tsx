import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Check, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format, isToday, isTomorrow, isPast } from "date-fns";

const AREA_ICONS: Record<string, string> = {
  "Low Back": "🔻", "Hips": "🦴", "Shoulders": "💪", "Neck": "🦒",
  "Foot/Ankle": "🦶", "Knee": "🦵", "Thoracic Spine": "🔄", "Hamstrings": "🦿",
  "Glutes": "🍑", "Desk": "🖥️", "Full Body": "🧘", "Warm-Up": "🔥", "Relax": "🫁",
};

interface ScheduledTask {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  program_id: string | null;
  is_completed: boolean;
}

interface QuickEnrollment {
  id: string;
  program_id: string;
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

interface MyTasksProps {
  quickEnrollments?: QuickEnrollment[];
  onRemoveEnrollment?: (id: string) => void;
}

export default function MyTasks({ quickEnrollments = [], onRemoveEnrollment }: MyTasksProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchTasks = async () => {
      const { data } = await (supabase as any)
        .from("scheduled_tasks")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", false)
        .order("scheduled_at", { ascending: true })
        .limit(6);
      if (data) setTasks(data as ScheduledTask[]);
      setLoading(false);
    };
    fetchTasks();
  }, [user]);

  const markDone = async (id: string) => {
    await (supabase as any).from("scheduled_tasks").update({ is_completed: true }).eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const deleteTask = async (id: string) => {
    await (supabase as any).from("scheduled_tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d)) return `Today ${format(d, "h:mm a")}`;
    if (isTomorrow(d)) return `Tomorrow ${format(d, "h:mm a")}`;
    return format(d, "MMM d, h:mm a");
  };

  const hasQuickItems = quickEnrollments.length > 0;
  const hasScheduledTasks = tasks.length > 0;
  const totalCount = quickEnrollments.length + tasks.length;

  if (loading) return (
    <div>
      <div className="glass rounded-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">Loading tasks...</p>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h2 className="font-display text-sm font-bold text-foreground">My Wellness Tasks</h2>
        </div>
        {totalCount > 0 && (
          <span className="text-[10px] text-muted-foreground">{totalCount} active</span>
        )}
      </div>

      {/* Quick enrollments (non-12-week programs added to plan) */}
      {hasQuickItems && (
        <div className="space-y-2 mb-3">
          <AnimatePresence>
            {quickEnrollments.map((enrollment, i) => {
              const prog = enrollment.program;
              if (!prog) return null;
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
                        {prog.duration_minutes} min · {prog.target_area}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/player/${prog.id}`)}
                        className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground active:scale-95 transition-transform"
                      >
                        <Play className="w-3 h-3" /> Start
                      </button>
                      <button
                        onClick={() => onRemoveEnrollment?.(enrollment.id)}
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

      {/* Scheduled tasks */}
      {hasScheduledTasks && (
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
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </button>
                  </div>
                  <p className={`text-[10px] mb-2 ${overdue ? "text-wellness-coral font-medium" : "text-muted-foreground"}`}>
                    {overdue ? "⏰ " : "📅 "}{formatTime(task.scheduled_at)} · {task.duration_minutes}m
                  </p>
                  <div className="flex gap-1.5">
                    {task.program_id && (
                      <button
                        onClick={() => navigate(`/player/${task.program_id}`)}
                        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg gradient-primary text-primary-foreground active:scale-95 transition-transform"
                      >
                        <Play className="w-3 h-3" /> Start
                      </button>
                    )}
                    <button
                      onClick={() => markDone(task.id)}
                      className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg bg-wellness-green/20 text-wellness-green active:scale-95 transition-transform"
                    >
                      <Check className="w-3 h-3" /> Done
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {!hasQuickItems && !hasScheduledTasks && (
        <div className="glass rounded-xl p-6 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No tasks yet</p>
          <p className="text-xs text-muted-foreground mt-1">Ask Welly AI to schedule a routine, or add exercises from Programs.</p>
        </div>
      )}
    </div>
  );
}
