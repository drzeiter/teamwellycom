import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Activity, Users, TrendingUp, Flame, Zap, BarChart3,
  LogOut, Mail, Lock, ArrowRight, Calendar, Award,
} from "lucide-react";

const HRDashboard = () => {
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Mock analytics data (in production these would come from aggregated queries)
  const [stats] = useState({
    totalEmployees: 156,
    activeThisWeek: 89,
    avgStreak: 4.2,
    totalSessions: 1247,
    avgEngagement: 72,
    topPrograms: [
      { name: "5-Min Desk Reset", sessions: 312 },
      { name: "5-Min Low Back Stretch", sessions: 278 },
      { name: "15-Min Morning Flow", sessions: 198 },
      { name: "5-Min Neck Stretch", sessions: 167 },
    ],
    weeklyTrend: [42, 56, 61, 58, 72, 89, 85],
    departmentEngagement: [
      { name: "Engineering", percent: 78 },
      { name: "Marketing", percent: 85 },
      { name: "Sales", percent: 62 },
      { name: "Operations", percent: 71 },
      { name: "HR", percent: 92 },
    ],
  });

  useEffect(() => {
    checkRole();
  }, [user]);

  const checkRole = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["hr_admin", "admin"]);
    
    if (data && data.length > 0) {
      setIsHR(true);
      setIsAuthed(true);
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoginLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">HR Dashboard</h1>
          <p className="text-muted-foreground mt-1">TeamWelly Corporate Analytics</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleLogin}
          className="w-full max-w-sm space-y-4"
        >
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="HR admin email" className="pl-10 bg-secondary border-border/50 h-11" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="pl-10 bg-secondary border-border/50 h-11" required />
          </div>
          <Button type="submit" disabled={loginLoading} className="w-full h-12 gradient-primary text-primary-foreground font-display glow-primary">
            {loginLoading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.form>
      </div>
    );
  }

  // Access denied
  if (!isHR) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Lock className="w-7 h-7 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You don't have HR admin privileges.</p>
        <Button variant="outline" onClick={() => { signOut(); navigate("/hr"); }}>Sign Out</Button>
      </div>
    );
  }

  // HR Dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">HR Dashboard</h1>
            <p className="text-xs text-muted-foreground">TeamWelly Corporate</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard icon={<Users className="w-5 h-5 text-primary" />} value={stats.totalEmployees} label="Total Employees" />
          <KPICard icon={<Activity className="w-5 h-5 text-wellness-green" />} value={stats.activeThisWeek} label="Active This Week" />
          <KPICard icon={<Flame className="w-5 h-5 text-wellness-coral" />} value={stats.avgStreak} label="Avg. Streak" suffix=" days" />
          <KPICard icon={<TrendingUp className="w-5 h-5 text-wellness-gold" />} value={stats.totalSessions} label="Total Sessions" />
        </div>

        {/* Engagement Bar */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Employee Engagement Rate</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
              <motion.div className="h-full gradient-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${stats.avgEngagement}%` }} transition={{ duration: 1, delay: 0.3 }} />
            </div>
            <span className="font-display text-2xl font-bold text-primary">{stats.avgEngagement}%</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Programs */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top Programs</h3>
            <div className="space-y-3">
              {stats.topPrograms.map((prog, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{prog.name}</p>
                    <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                      <div className="h-full gradient-primary rounded-full" style={{ width: `${(prog.sessions / stats.topPrograms[0].sessions) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{prog.sessions}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Department Engagement */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">Department Engagement</h3>
            <div className="space-y-3">
              {stats.departmentEngagement.map((dept, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-24">{dept.name}</span>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${dept.percent >= 80 ? "gradient-primary" : dept.percent >= 60 ? "bg-wellness-gold" : "bg-wellness-coral"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${dept.percent}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">{dept.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Activity Trend */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Weekly Activity Trend</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.weeklyTrend.map((val, i) => (
              <motion.div
                key={i}
                className="flex-1 gradient-primary rounded-t-md"
                initial={{ height: 0 }}
                animate={{ height: `${(val / Math.max(...stats.weeklyTrend)) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
              <span key={d} className="flex-1 text-center text-[10px] text-muted-foreground">{d}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ icon, value, label, suffix = "" }: { icon: React.ReactNode; value: number; label: string; suffix?: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4">
    <div className="mb-2">{icon}</div>
    <p className="font-display text-2xl font-bold text-foreground">{value}{suffix}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

export default HRDashboard;
