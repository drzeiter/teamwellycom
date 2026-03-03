import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart3, Users, Calendar, Award, Settings, LogOut,
  Plus, Copy, RefreshCw, UserPlus, Activity, Flame, TrendingUp,
  Send, Trophy, Gift, Zap,
} from "lucide-react";

const CompanyAdminDashboard = () => {
  const { user, signOut } = useAuth();
  const { companyId, companyName } = useUserRole();
  const [employees, setEmployees] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [ledger, setLedger] = useState<any[]>([]);

  // Form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventPoints, setEventPoints] = useState("10");

  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");
  const [rewardCost, setRewardCost] = useState("50");

  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDesc, setChallengeDesc] = useState("");
  const [challengeStart, setChallengeStart] = useState("");
  const [challengeEnd, setChallengeEnd] = useState("");
  const [challengePoints, setChallengePoints] = useState("100");
  const [challengeMetric, setChallengeMetric] = useState("custom");

  const [manualUserId, setManualUserId] = useState("");
  const [manualPoints, setManualPoints] = useState("");
  const [manualReason, setManualReason] = useState("");

  useEffect(() => {
    if (companyId) loadData();
  }, [companyId]);

  const loadData = async () => {
    if (!companyId) return;
    const [companyRes, empRes, eventsRes, rewardsRes, challengesRes, invitesRes, ledgerRes] = await Promise.all([
      supabase.from("companies").select("*").eq("id", companyId).single(),
      supabase.from("profiles").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      supabase.from("events").select("*").eq("company_id", companyId).order("start_at", { ascending: false }),
      supabase.from("rewards").select("*").eq("company_id", companyId),
      supabase.from("challenges").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      supabase.from("invites").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      supabase.from("welly_points_ledger").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(50),
    ]);
    setCompany(companyRes.data);
    setEmployees(empRes.data || []);
    setEvents(eventsRes.data || []);
    setRewards(rewardsRes.data || []);
    setChallenges(challengesRes.data || []);
    setInvites(invitesRes.data || []);
    setLedger(ledgerRes.data || []);
  };

  const createEvent = async () => {
    if (!eventTitle || !eventStart || !companyId || !user) return;
    const { error } = await supabase.from("events").insert({
      company_id: companyId, title: eventTitle, description: eventDesc,
      start_at: eventStart, location: eventLocation,
      points_award: parseInt(eventPoints) || 0, created_by_user_id: user.id, status: "published",
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Event created!" }); setEventTitle(""); setEventDesc(""); setEventStart(""); setEventLocation(""); loadData(); }
  };

  const createReward = async () => {
    if (!rewardTitle || !companyId) return;
    const { error } = await supabase.from("rewards").insert({
      company_id: companyId, title: rewardTitle, description: rewardDesc,
      points_cost: parseInt(rewardCost) || 0,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Reward created!" }); setRewardTitle(""); setRewardDesc(""); loadData(); }
  };

  const createChallenge = async () => {
    if (!challengeTitle || !challengeStart || !challengeEnd || !companyId || !user) return;
    const { error } = await supabase.from("challenges").insert({
      company_id: companyId, title: challengeTitle, description: challengeDesc,
      start_at: challengeStart, end_at: challengeEnd,
      points_award: parseInt(challengePoints) || 0, metric_type: challengeMetric,
      created_by_user_id: user.id, status: "published",
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Challenge created!" }); setChallengeTitle(""); setChallengeDesc(""); loadData(); }
  };

  const awardManualPoints = async () => {
    if (!manualUserId || !manualPoints || !manualReason || !companyId || !user) return;
    const { error } = await supabase.from("welly_points_ledger").insert({
      company_id: companyId, user_id: manualUserId,
      points_delta: parseInt(manualPoints), reason: manualReason,
      created_by_user_id: user.id,
    });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Points awarded!" }); setManualUserId(""); setManualPoints(""); setManualReason(""); loadData(); }
  };

  const createHRInvite = async () => {
    if (!companyId || !user) return;
    const { data, error } = await supabase.from("invites").insert({
      company_id: companyId, role_to_assign: "hr_admin", created_by_user_id: user.id,
    }).select().single();
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      const link = `${window.location.origin}/invite/${data.token}`;
      await navigator.clipboard.writeText(link);
      toast({ title: "HR Invite link copied!", description: link });
      loadData();
    }
  };

  const copyCode = () => {
    if (company?.employee_access_code) {
      navigator.clipboard.writeText(company.employee_access_code);
      toast({ title: "Code copied!" });
    }
  };

  const totalPointsAwarded = ledger.reduce((sum, l) => sum + (l.points_delta > 0 ? l.points_delta : 0), 0);

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
            <p className="text-xs text-muted-foreground">Company: {companyName || "—"}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPI icon={<Users className="w-5 h-5 text-primary" />} value={employees.length} label="Employees" />
          <KPI icon={<Activity className="w-5 h-5 text-wellness-green" />} value={employees.filter(e => e.last_active_at && new Date(e.last_active_at) > new Date(Date.now() - 7 * 86400000)).length} label="Active (7d)" />
          <KPI icon={<Zap className="w-5 h-5 text-wellness-gold" />} value={totalPointsAwarded} label="Points Awarded" />
          <KPI icon={<Calendar className="w-5 h-5 text-wellness-coral" />} value={events.filter(e => e.status === "published").length} label="Events" />
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-secondary flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="employees"><Users className="w-3 h-3 mr-1" /> Employees</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="w-3 h-3 mr-1" /> Events</TabsTrigger>
            <TabsTrigger value="rewards"><Gift className="w-3 h-3 mr-1" /> Rewards</TabsTrigger>
            <TabsTrigger value="challenges"><Trophy className="w-3 h-3 mr-1" /> Challenges</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-3 h-3 mr-1" /> Settings</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Engagement Rate</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                  <motion.div className="h-full gradient-primary rounded-full" initial={{ width: 0 }}
                    animate={{ width: `${employees.length ? Math.round(employees.filter(e => e.last_active_at && new Date(e.last_active_at) > new Date(Date.now() - 7 * 86400000)).length / employees.length * 100) : 0}%` }}
                    transition={{ duration: 1 }} />
                </div>
                <span className="font-display text-2xl font-bold text-primary">
                  {employees.length ? Math.round(employees.filter(e => e.last_active_at && new Date(e.last_active_at) > new Date(Date.now() - 7 * 86400000)).length / employees.length * 100) : 0}%
                </span>
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Points Activity</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {ledger.slice(0, 10).map(l => (
                  <div key={l.id} className="flex items-center justify-between text-sm py-2 border-b border-border/30">
                    <div>
                      <span className="text-foreground">{l.reason}</span>
                      <span className="text-muted-foreground text-xs ml-2">{new Date(l.created_at).toLocaleDateString()}</span>
                    </div>
                    <span className={`font-mono font-bold ${l.points_delta > 0 ? "text-wellness-green" : "text-destructive"}`}>
                      {l.points_delta > 0 ? "+" : ""}{l.points_delta}
                    </span>
                  </div>
                ))}
                {ledger.length === 0 && <p className="text-muted-foreground text-sm">No points activity yet</p>}
              </div>
            </div>
          </TabsContent>

          {/* Employees */}
          <TabsContent value="employees">
            <div className="glass rounded-2xl p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.display_name || "—"}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {e.last_active_at ? new Date(e.last_active_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                  {employees.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No employees yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Create Event</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="Event title" className="bg-secondary border-border/50" />
                <Input value={eventLocation} onChange={e => setEventLocation(e.target.value)} placeholder="Location (optional)" className="bg-secondary border-border/50" />
                <Input type="datetime-local" value={eventStart} onChange={e => setEventStart(e.target.value)} className="bg-secondary border-border/50" />
                <Input type="number" value={eventPoints} onChange={e => setEventPoints(e.target.value)} placeholder="Points for attendance" className="bg-secondary border-border/50" />
                <Input value={eventDesc} onChange={e => setEventDesc(e.target.value)} placeholder="Description" className="bg-secondary border-border/50 md:col-span-2" />
              </div>
              <Button onClick={createEvent} className="gradient-primary text-primary-foreground mt-3">
                <Plus className="w-4 h-4 mr-1" /> Publish Event
              </Button>
            </div>
            <div className="glass rounded-2xl p-6">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Event</TableHead><TableHead>Date</TableHead><TableHead>Points</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {events.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(e.start_at).toLocaleDateString()}</TableCell>
                      <TableCell>{e.points_award}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${e.status === "published" ? "bg-wellness-green/10 text-wellness-green" : "bg-muted text-muted-foreground"}`}>
                          {e.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Rewards */}
          <TabsContent value="rewards" className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Create Reward</h3>
              <div className="flex gap-3 flex-wrap">
                <Input value={rewardTitle} onChange={e => setRewardTitle(e.target.value)} placeholder="Reward title" className="bg-secondary border-border/50 flex-1 min-w-[200px]" />
                <Input type="number" value={rewardCost} onChange={e => setRewardCost(e.target.value)} placeholder="Points cost" className="bg-secondary border-border/50 w-32" />
                <Button onClick={createReward} className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> Add</Button>
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Manual Points Adjustment</h3>
              <div className="flex gap-3 flex-wrap">
                <select value={manualUserId} onChange={e => setManualUserId(e.target.value)} className="h-10 rounded-md border border-input bg-secondary px-3 text-sm text-foreground flex-1 min-w-[200px]">
                  <option value="">Select employee...</option>
                  {employees.map(e => <option key={e.user_id} value={e.user_id}>{e.display_name || e.user_id}</option>)}
                </select>
                <Input type="number" value={manualPoints} onChange={e => setManualPoints(e.target.value)} placeholder="+/- Points" className="bg-secondary border-border/50 w-28" />
                <Input value={manualReason} onChange={e => setManualReason(e.target.value)} placeholder="Reason" className="bg-secondary border-border/50 w-48" />
                <Button onClick={awardManualPoints} className="gradient-primary text-primary-foreground"><Zap className="w-4 h-4 mr-1" /> Award</Button>
              </div>
            </div>
            <div className="glass rounded-2xl p-6">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Reward</TableHead><TableHead>Cost</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {rewards.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.title}</TableCell>
                      <TableCell>{r.points_cost} pts</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${r.active ? "bg-wellness-green/10 text-wellness-green" : "bg-muted text-muted-foreground"}`}>
                          {r.active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Challenges */}
          <TabsContent value="challenges" className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Create Challenge</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={challengeTitle} onChange={e => setChallengeTitle(e.target.value)} placeholder="Challenge title" className="bg-secondary border-border/50" />
                <select value={challengeMetric} onChange={e => setChallengeMetric(e.target.value)} className="h-10 rounded-md border border-input bg-secondary px-3 text-sm text-foreground">
                  <option value="steps">Steps</option>
                  <option value="streak">Streak</option>
                  <option value="program_completion">Program Completion</option>
                  <option value="attendance">Attendance</option>
                  <option value="custom">Custom</option>
                </select>
                <Input type="datetime-local" value={challengeStart} onChange={e => setChallengeStart(e.target.value)} className="bg-secondary border-border/50" />
                <Input type="datetime-local" value={challengeEnd} onChange={e => setChallengeEnd(e.target.value)} className="bg-secondary border-border/50" />
                <Input type="number" value={challengePoints} onChange={e => setChallengePoints(e.target.value)} placeholder="Points award" className="bg-secondary border-border/50" />
                <Input value={challengeDesc} onChange={e => setChallengeDesc(e.target.value)} placeholder="Description" className="bg-secondary border-border/50" />
              </div>
              <Button onClick={createChallenge} className="gradient-primary text-primary-foreground mt-3">
                <Plus className="w-4 h-4 mr-1" /> Publish Challenge
              </Button>
            </div>
            <div className="glass rounded-2xl p-6">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Challenge</TableHead><TableHead>Metric</TableHead><TableHead>Points</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {challenges.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell className="capitalize text-muted-foreground">{c.metric_type?.replace("_", " ")}</TableCell>
                      <TableCell>{c.points_award}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${c.status === "published" ? "bg-wellness-green/10 text-wellness-green" : "bg-muted text-muted-foreground"}`}>
                          {c.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Employee Access Code</h3>
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg bg-secondary px-4 py-2 rounded-lg tracking-widest text-foreground">
                  {company?.employee_access_code || "—"}
                </span>
                <Button variant="outline" size="sm" onClick={copyCode}><Copy className="w-4 h-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Share this code with employees to join your company.</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">HR Invites</h3>
              <Button onClick={createHRInvite} className="gradient-primary text-primary-foreground mb-4">
                <UserPlus className="w-4 h-4 mr-1" /> Create HR Invite Link
              </Button>
              <div className="space-y-2">
                {invites.filter(i => i.role_to_assign === "hr_admin").map(inv => (
                  <div key={inv.id} className="flex items-center justify-between text-sm py-2 border-b border-border/30">
                    <span className={inv.used_at ? "text-muted-foreground" : "text-foreground"}>
                      {inv.used_at ? "Used" : new Date(inv.expires_at) < new Date() ? "Expired" : "Active"} — {new Date(inv.created_at).toLocaleDateString()}
                    </span>
                    {!inv.used_at && new Date(inv.expires_at) > new Date() && (
                      <Button variant="ghost" size="sm" onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`);
                        toast({ title: "Link copied!" });
                      }}><Copy className="w-3 h-3" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const KPI = ({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4">
    <div className="mb-2">{icon}</div>
    <p className="font-display text-2xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </motion.div>
);

export default CompanyAdminDashboard;
