import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Mail, Lock, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import logoWhite from "@/assets/logo-white.png";

const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    const checkInvite = async () => {
      const { data, error } = await supabase
        .from("invites")
        .select("*, companies(name)")
        .eq("token", token)
        .single();

      if (error || !data) {
        setError("Invalid invite link.");
        setLoading(false);
        return;
      }
      if (data.used_at) {
        setError("This invite has already been used.");
        setLoading(false);
        return;
      }
      if (new Date(data.expires_at) < new Date()) {
        setError("This invite has expired.");
        setLoading(false);
        return;
      }
      setInvite(data);
      setLoading(false);
    };
    checkInvite();
  }, [token]);

  // If user is already logged in, accept the invite directly
  useEffect(() => {
    if (user && invite && !accepted) {
      acceptInvite(user.id);
    }
  }, [user, invite]);

  const acceptInvite = async (userId: string) => {
    try {
      // Update profile with company_id
      await supabase
        .from("profiles")
        .update({ company_id: invite.company_id })
        .eq("user_id", userId);

      // Assign role
      const roleToAssign = invite.role_to_assign === "hr_admin" ? "hr_admin" : "user";
      await supabase.from("user_roles").upsert({
        user_id: userId,
        role: roleToAssign as any,
        company_name: invite.companies?.name || null,
      }, { onConflict: "user_id,role" });

      // Mark invite as used
      await supabase
        .from("invites")
        .update({ used_at: new Date().toISOString() })
        .eq("id", invite.id);

      setAccepted(true);
      toast({ title: "Welcome!", description: `You've been added as ${roleToAssign === "hr_admin" ? "HR Admin" : "Employee"}.` });

      setTimeout(() => {
        navigate(roleToAssign === "hr_admin" ? "/admin/company" : "/");
      }, 2000);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        toast({ title: "Check your email!", description: "Verify your email, then return to this link." });
      } else {
        await signIn(email, password);
        // acceptInvite will trigger via useEffect
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <XCircle className="w-14 h-14 text-destructive mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">Invalid Invite</h1>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-6" onClick={() => navigate("/auth")}>Go to Login</Button>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle className="w-14 h-14 text-primary mb-4" />
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">You're In!</h1>
        <p className="text-muted-foreground">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <img src={logoWhite} alt="Team Welly" className="h-12 w-auto mx-auto" />
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto">
            <UserPlus className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Join {invite?.companies?.name || "Company"}
          </h1>
          <p className="text-muted-foreground text-sm">
            You've been invited as <span className="text-primary font-medium">{invite?.role_to_assign === "hr_admin" ? "HR Admin" : "Employee"}</span>
          </p>
        </motion.div>

        {!user && (
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your name" className="bg-secondary border-border/50 h-11" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="pl-10 bg-secondary border-border/50 h-11" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="pl-10 bg-secondary border-border/50 h-11" minLength={6} required />
            </div>
            <Button type="submit" disabled={formLoading} className="w-full h-12 gradient-primary text-primary-foreground font-display glow-primary">
              {formLoading ? "Loading..." : isSignUp ? "Create Account & Join" : "Sign In & Join"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="text-primary font-medium">
                {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
              </button>
            </p>
          </motion.form>
        )}
      </div>
    </div>
  );
};

export default InviteAccept;
