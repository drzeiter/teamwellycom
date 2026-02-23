import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Shield, Users, Activity, TrendingUp, Zap, LogOut,
  Mail, Lock, ArrowRight, Database, Server, Globe, Settings,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Platform stats
  const [stats] = useState({
    totalUsers: 1243,
    companies: 12,
    activeToday: 342,
    totalSessions: 18750,
    totalPrograms: 30,
    totalExercises: 186,
    revenue: "$24,500",
    churnRate: "3.2%",
    companies_list: [
      { name: "Acme Corp", employees: 156, engagement: 72 },
      { name: "TechStart Inc", employees: 89, engagement: 85 },
      { name: "Global Solutions", employees: 234, engagement: 61 },
      { name: "HealthFirst Co", employees: 67, engagement: 91 },
      { name: "Digital Dynamics", employees: 112, engagement: 78 },
    ],
  });

  useEffect(() => {
    checkRole();
  }, [user]);

  const checkRole = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");
    
    if (data && data.length > 0) {
      setIsAdmin(true);
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

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-wellness-purple/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-wellness-purple" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Super Admin</h1>
          <p className="text-muted-foreground mt-1">TeamWelly Platform Management</p>
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
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin email" className="pl-10 bg-secondary border-border/50 h-11" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="pl-10 bg-secondary border-border/50 h-11" required />
          </div>
          <Button type="submit" disabled={loginLoading} className="w-full h-12 bg-wellness-purple hover:bg-wellness-purple/90 text-accent-foreground font-display">
            {loginLoading ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.form>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Shield className="w-7 h-7 text-destructive" />
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">Super Admin privileges required.</p>
        <Button variant="outline" onClick={() => { signOut(); navigate("/admin"); }}>Sign Out</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-wellness-purple flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground">Super Admin</h1>
            <p className="text-xs text-muted-foreground">Platform Management</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Platform KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminKPI icon={<Users className="w-5 h-5 text-primary" />} value={stats.totalUsers.toString()} label="Total Users" />
          <AdminKPI icon={<Globe className="w-5 h-5 text-wellness-purple" />} value={stats.companies.toString()} label="Companies" />
          <AdminKPI icon={<Activity className="w-5 h-5 text-wellness-green" />} value={stats.activeToday.toString()} label="Active Today" />
          <AdminKPI icon={<TrendingUp className="w-5 h-5 text-wellness-gold" />} value={stats.revenue} label="MRR" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Platform Health */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" /> Platform Health
            </h3>
            <div className="space-y-3">
              {[
                { label: "API Uptime", value: "99.98%", status: "good" },
                { label: "Avg Response Time", value: "142ms", status: "good" },
                { label: "Error Rate", value: "0.02%", status: "good" },
                { label: "Churn Rate", value: stats.churnRate, status: "warn" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className={`text-sm font-mono ${item.status === "good" ? "text-wellness-green" : "text-wellness-gold"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Content Stats */}
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-wellness-gold" /> Content Library
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="font-display text-3xl font-bold text-foreground">{stats.totalPrograms}</p>
                <p className="text-xs text-muted-foreground">Programs</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="font-display text-3xl font-bold text-foreground">{stats.totalExercises}</p>
                <p className="text-xs text-muted-foreground">Exercises</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="font-display text-3xl font-bold text-foreground">{stats.totalSessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
              <div className="bg-secondary rounded-xl p-4 text-center">
                <p className="font-display text-3xl font-bold text-foreground">{stats.activeToday}</p>
                <p className="text-xs text-muted-foreground">Active Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Table */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Company Accounts</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs text-muted-foreground font-medium py-3 px-2">Company</th>
                  <th className="text-left text-xs text-muted-foreground font-medium py-3 px-2">Employees</th>
                  <th className="text-left text-xs text-muted-foreground font-medium py-3 px-2">Engagement</th>
                  <th className="text-left text-xs text-muted-foreground font-medium py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.companies_list.map((company, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 px-2 text-sm font-medium text-foreground">{company.name}</td>
                    <td className="py-3 px-2 text-sm text-muted-foreground">{company.employees}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${company.engagement >= 80 ? "gradient-primary" : company.engagement >= 60 ? "bg-wellness-gold" : "bg-wellness-coral"}`} style={{ width: `${company.engagement}%` }} />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{company.engagement}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-wellness-green/10 text-wellness-green">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminKPI = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4">
    <div className="mb-2">{icon}</div>
    <p className="font-display text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

export default AdminDashboard;
