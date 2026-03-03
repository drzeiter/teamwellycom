import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Shield, Users, Globe, Activity, TrendingUp, LogOut, Plus,
  Building2, Search, Copy, RefreshCw, Send, UserPlus, Trash2,
} from "lucide-react";

const SuperAdminDashboard = () => {
  const { signOut } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanySlug, setNewCompanySlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [inviteCompanyId, setInviteCompanyId] = useState("");
  const [inviteRole, setInviteRole] = useState("hr_admin");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [companiesRes, profilesRes, invitesRes] = await Promise.all([
      supabase.from("companies").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("invites").select("*, companies(name)").order("created_at", { ascending: false }).limit(50),
    ]);
    setCompanies(companiesRes.data || []);
    setUsers(profilesRes.data || []);
    setInvites(invitesRes.data || []);
  };

  const createCompany = async () => {
    if (!newCompanyName.trim()) return;
    setCreating(true);
    const slug = newCompanySlug.trim() || newCompanyName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const { error } = await supabase.from("companies").insert({ name: newCompanyName.trim(), slug });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Company created!" });
      setNewCompanyName("");
      setNewCompanySlug("");
      loadData();
    }
    setCreating(false);
  };

  const regenerateCode = async (companyId: string) => {
    const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { error } = await supabase.from("companies").update({ employee_access_code: newCode }).eq("id", companyId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Code regenerated!" });
      loadData();
    }
  };

  const createInvite = async () => {
    if (!inviteCompanyId) return;
    const { user } = (await supabase.auth.getUser()).data;
    if (!user) return;
    const { data, error } = await supabase.from("invites").insert({
      company_id: inviteCompanyId,
      role_to_assign: inviteRole,
      created_by_user_id: user.id,
    }).select().single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      const link = `${window.location.origin}/invite/${data.token}`;
      await navigator.clipboard.writeText(link);
      toast({ title: "Invite created & copied!", description: link });
      loadData();
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: "Copied!" });
  };

  const filteredUsers = users.filter(u =>
    !searchQuery || (u.display_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.company_code || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCompanyUserCount = (companyId: string) =>
    users.filter(u => u.company_id === companyId).length;

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

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <KPI icon={<Globe className="w-5 h-5 text-wellness-purple" />} value={companies.length} label="Companies" />
          <KPI icon={<Users className="w-5 h-5 text-primary" />} value={users.length} label="Total Users" />
          <KPI icon={<Activity className="w-5 h-5 text-wellness-green" />} value={users.filter(u => u.last_active_at && new Date(u.last_active_at) > new Date(Date.now() - 7 * 86400000)).length} label="Active (7d)" />
          <KPI icon={<TrendingUp className="w-5 h-5 text-wellness-gold" />} value={invites.filter(i => !i.used_at).length} label="Pending Invites" />
        </div>

        <Tabs defaultValue="companies" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="companies"><Building2 className="w-4 h-4 mr-1" /> Companies</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
            <TabsTrigger value="invites"><Send className="w-4 h-4 mr-1" /> Invites</TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies" className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Create Company</h3>
              <div className="flex gap-3 flex-wrap">
                <Input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} placeholder="Company name" className="bg-secondary border-border/50 flex-1 min-w-[200px]" />
                <Input value={newCompanySlug} onChange={e => setNewCompanySlug(e.target.value)} placeholder="Slug (auto)" className="bg-secondary border-border/50 w-40" />
                <Button onClick={createCompany} disabled={creating} className="gradient-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-1" /> Create
                </Button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">All Companies</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Access Code</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-secondary px-2 py-1 rounded">{c.employee_access_code}</span>
                        <Button variant="ghost" size="sm" onClick={() => copyCode(c.employee_access_code)} className="ml-1">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </TableCell>
                      <TableCell>{getCompanyUserCount(c.id)}</TableCell>
                      <TableCell>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-wellness-green/10 text-wellness-green capitalize">{c.plan_status}</span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => regenerateCode(c.id)} title="Regenerate code">
                          <RefreshCw className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {companies.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No companies yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by name or company code..." className="bg-secondary border-border/50" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.display_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {companies.find(c => c.id === u.company_id)?.name || u.company_code || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {u.last_active_at ? new Date(u.last_active_at).toLocaleDateString() : "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Invites Tab */}
          <TabsContent value="invites" className="space-y-4">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Create Invite</h3>
              <div className="flex gap-3 flex-wrap items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-xs text-muted-foreground mb-1 block">Company</label>
                  <select
                    value={inviteCompanyId}
                    onChange={e => setInviteCompanyId(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-secondary px-3 text-sm text-foreground"
                  >
                    <option value="">Select company...</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="w-40">
                  <label className="text-xs text-muted-foreground mb-1 block">Role</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-secondary px-3 text-sm text-foreground"
                  >
                    <option value="hr_admin">HR Admin</option>
                    <option value="user">Employee</option>
                  </select>
                </div>
                <Button onClick={createInvite} className="gradient-primary text-primary-foreground">
                  <UserPlus className="w-4 h-4 mr-1" /> Create & Copy Link
                </Button>
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">All Invites</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map(inv => (
                    <TableRow key={inv.id}>
                      <TableCell>{(inv.companies as any)?.name || "—"}</TableCell>
                      <TableCell className="capitalize">{inv.role_to_assign?.replace("_", " ")}</TableCell>
                      <TableCell>
                        {inv.used_at ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">Used</span>
                        ) : new Date(inv.expires_at) < new Date() ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive">Expired</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-wellness-green/10 text-wellness-green">Active</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(inv.expires_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {!inv.used_at && new Date(inv.expires_at) > new Date() && (
                          <Button variant="ghost" size="sm" onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.token}`);
                            toast({ title: "Link copied!" });
                          }}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {invites.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No invites yet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
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

export default SuperAdminDashboard;
