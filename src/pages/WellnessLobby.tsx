import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import TodayTab from "@/components/tabs/TodayTab";
import ProgramsTab from "@/components/tabs/ProgramsTab";
import QuickResetsTab from "@/components/tabs/QuickResetsTab";
import MovementScanTab from "@/components/tabs/MovementScanTab";
import ProfileTab from "@/components/tabs/ProfileTab";
import { Home, LayoutGrid, Zap, Scan, User } from "lucide-react";

interface WellyPointsData {
  total_points: number;
  current_streak: number;
  longest_streak: number;
}

interface Program {
  id: string;
  name: string;
  category: string;
  category_type: string;
  duration_minutes: number;
  exercise_count: number;
  difficulty: string;
  target_area: string;
  description: string | null;
  icon: string | null;
  duration_weeks: number | null;
  region: string | null;
}

export type Tab = "today" | "programs" | "resets" | "scan" | "profile";

const WellnessLobby = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState<WellyPointsData>({ total_points: 0, current_streak: 0, longest_streak: 0 });
  const [programs, setPrograms] = useState<Program[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("today");
  const [progressHistory, setProgressHistory] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [pointsRes, programsRes, profileRes, progressRes] = await Promise.all([
        supabase.from("welly_points").select("*").eq("user_id", user.id).single(),
        supabase.from("programs").select("*").order("sort_order"),
        supabase.from("profiles").select("display_name").eq("user_id", user.id).single(),
        supabase.from("user_progress").select("*").eq("user_id", user.id).order("completed_at", { ascending: false }).limit(30),
      ]);
      if (pointsRes.data) setPoints(pointsRes.data);
      if (programsRes.data) setPrograms(programsRes.data as Program[]);
      if (profileRes.data) setDisplayName(profileRes.data.display_name || "");
      if (progressRes.data) setProgressHistory(progressRes.data);
    };
    fetchData();
  }, [user]);

  const twelveWeekPrograms = programs.filter(p => (p.duration_weeks || 0) >= 12);
  const quickContent = programs.filter(p => (p.duration_weeks || 0) < 12);
  const firstName = displayName?.split(" ")[0] || "there";

  const renderContent = () => {
    switch (activeTab) {
      case "today":
        return <TodayTab firstName={firstName} points={points} programs={quickContent} navigate={navigate} progressHistory={progressHistory} setActiveTab={setActiveTab} />;
      case "programs":
        return <ProgramsTab programs={twelveWeekPrograms} navigate={navigate} />;
      case "resets":
        return <QuickResetsTab programs={quickContent} navigate={navigate} />;
      case "scan":
        return <MovementScanTab />;
      case "profile":
        return <ProfileTab displayName={displayName} points={points} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 safe-top">
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
          {renderContent()}
        </motion.div>
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 glass-strong safe-bottom z-40">
        <div className="flex items-center justify-around py-3 max-w-lg mx-auto">
          <NavItem icon={<Home className="w-5 h-5" />} label="Today" active={activeTab === "today"} onClick={() => setActiveTab("today")} />
          <NavItem icon={<LayoutGrid className="w-5 h-5" />} label="Programs" active={activeTab === "programs"} onClick={() => setActiveTab("programs")} />
          <NavItem icon={<Zap className="w-5 h-5" />} label="Quick Resets" active={activeTab === "resets"} onClick={() => setActiveTab("resets")} />
          <NavItem icon={<Scan className="w-5 h-5" />} label="Scan" active={activeTab === "scan"} onClick={() => setActiveTab("scan")} />
          <NavItem icon={<User className="w-5 h-5" />} label="Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-colors relative ${active ? "text-primary" : "text-muted-foreground"}`}>
    {active && <motion.div layoutId="navIndicator" className="absolute -top-0 w-8 h-0.5 rounded-full gradient-primary" />}
    {icon}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default WellnessLobby;
