import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Play, Trash2, Target, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { addToCalendar, type CalendarProvider, type CalendarEventData } from "@/utils/calendarEvent";

import MyTasks from "@/components/MyTasks";
import ScheduleBottomSheet from "@/components/ScheduleBottomSheet";

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

export default function MyPlan() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<EnrolledProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMovementPicker, setShowMovementPicker] = useState(false);
  const [availablePrograms, setAvailablePrograms] = useState<any[]>([]);
  const [selectedMovement, setSelectedMovement] = useState<any>(null);
  const [showScheduleSheet, setShowScheduleSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

      setLoading(false);
    };
    fetchAll();
  }, [user]);

  const removeEnrollment = async (id: string) => {
    await (supabase as any).from("user_enrolled_programs").update({ is_active: false }).eq("id", id);
    setEnrollments(prev => prev.filter(e => e.id !== id));
  };

  const handleOpenMovementPicker = async () => {
    // Fetch all programs for the picker
    const { data } = await supabase
      .from("programs")
      .select("id, name, target_area, category_type, duration_minutes")
      .order("sort_order", { ascending: true });
    setAvailablePrograms(data || []);
    setShowMovementPicker(true);
  };

  const handleSelectMovement = (program: any) => {
    setSelectedMovement(program);
    setShowMovementPicker(false);
    setShowScheduleSheet(true);
  };

  const handleScheduleConfirm = async (scheduledAt: Date, durationMinutes: number) => {
    if (!selectedMovement || !user) return;
    setSaving(true);

    await (supabase as any).from("scheduled_tasks").insert({
      user_id: user.id,
      title: selectedMovement.name,
      scheduled_at: scheduledAt.toISOString(),
      duration_minutes: durationMinutes,
      program_id: selectedMovement.id,
    });

    const provider = (localStorage.getItem("welly_calendar_provider") as CalendarProvider) || "apple";
    const eventData: CalendarEventData = {
      title: selectedMovement.name,
      description: `Time for ${selectedMovement.name}! Open TeamWelly to start.`,
      durationMinutes,
      startDate: scheduledAt,
      url: "https://teamwellycom.lovable.app",
    };
    addToCalendar(provider, eventData);

    toast({
      title: "Scheduled! ✅",
      description: `${selectedMovement.name} on ${format(scheduledAt, "MMM d 'at' h:mm a")}`,
    });

    setSelectedMovement(null);
    setShowScheduleSheet(false);
    setSaving(false);
    setRefreshKey(k => k + 1);
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

  // Split: only 12-week programs go under "My Programs"
  const performanceEnrollments = enrollments.filter(e => (e.program?.duration_weeks || 0) >= 12);
  const quickEnrollments = enrollments.filter(e => (e.program?.duration_weeks || 0) < 12);
  const hasContent = enrollments.length > 0;

  return (
    <div className="space-y-6">
      {/* Enrolled Programs */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-primary" />
          <h2 className="font-display text-sm font-bold text-foreground">My Programs</h2>
          {performanceEnrollments.length > 0 && (
            <span className="text-[10px] text-muted-foreground ml-auto">{performanceEnrollments.length} active</span>
          )}
        </div>

        {performanceEnrollments.length === 0 ? (
          <div className="glass rounded-xl p-5 text-center">
            <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No programs added yet</p>
            <p className="text-xs text-muted-foreground mt-1">Browse 12-week programs and tap "Add to My Plan" to get started.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {performanceEnrollments.map((enrollment, i) => {
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
                          Week {enrollment.current_week} of {prog.duration_weeks}
                          {" · "}{prog.target_area}
                        </p>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1.5 w-full max-w-[120px]">
                          <div
                            className="h-full gradient-primary rounded-full transition-all"
                            style={{ width: `${(enrollment.current_week / (prog.duration_weeks || 12)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/program/${prog.id}`)}
                          className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg gradient-primary text-primary-foreground active:scale-95 transition-transform"
                        >
                          <Play className="w-3 h-3" /> Open
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

      {/* My Tasks Section - includes quick enrollments + scheduled tasks */}
      <MyTasks key={refreshKey} quickEnrollments={quickEnrollments} onRemoveEnrollment={removeEnrollment} />

      {!hasContent && (
        <div className="glass rounded-xl p-6 text-center">
          <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Your plan is empty</p>
          <p className="text-xs text-muted-foreground">Add programs from the Programs tab or ask Welly AI to schedule a routine for you.</p>
        </div>
      )}

      {/* Schedule a Movement - floating button */}
      <motion.button
        onClick={handleOpenMovementPicker}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-20 left-4 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full gradient-primary text-primary-foreground font-semibold text-sm shadow-lg active:scale-95 transition-transform"
      >
        <Plus className="w-4 h-4" />
        Schedule a Movement
      </motion.button>

      {/* Movement Picker Modal */}
      <AnimatePresence>
        {showMovementPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end justify-center"
            onClick={() => setShowMovementPicker(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md glass-strong rounded-t-2xl p-5 safe-bottom max-h-[70vh] overflow-y-auto"
            >
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-1">Pick an Exercise</h3>
              <p className="text-xs text-muted-foreground mb-4">Choose a movement to schedule</p>
              <div className="space-y-2">
                {availablePrograms.map(prog => (
                  <button
                    key={prog.id}
                    onClick={() => handleSelectMovement(prog)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary/80 transition-all active:scale-[0.98]"
                  >
                    <span className="text-xl">{AREA_ICONS[prog.target_area] || "🏋️"}</span>
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-foreground">{prog.name}</p>
                      <p className="text-xs text-muted-foreground">{prog.duration_minutes} min · {prog.target_area}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowMovementPicker(false)}
                className="w-full mt-4 py-3 rounded-xl bg-secondary text-muted-foreground text-sm font-medium"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule Bottom Sheet for chosen movement */}
      <ScheduleBottomSheet
        open={showScheduleSheet}
        onClose={() => { setShowScheduleSheet(false); setSelectedMovement(null); }}
        title={selectedMovement?.name || ""}
        subtitle="Pick a date & time for this movement"
        defaultHour={9}
        defaultMinute={0}
        defaultDurationMinutes={selectedMovement?.duration_minutes ?? 10}
        onConfirm={handleScheduleConfirm}
        saving={saving}
      />
    </div>
  );
}
