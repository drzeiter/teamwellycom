import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import logoWhite from "@/assets/logo-white.png";
import { Mail, Lock, User, ArrowRight, KeyRound } from "lucide-react";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        // Validate access code first
        const { data, error: rpcError } = await supabase.rpc("validate_access_code", {
          p_code: companyCode.trim(),
        });
        if (rpcError) throw rpcError;

        const result = data as { valid: boolean; error?: string; company_name?: string };
        if (!result.valid) {
          toast({ title: "Invalid Code", description: result.error || "Please check your company access code.", variant: "destructive" });
          setLoading(false);
          return;
        }

        await signUp(email, password, displayName, companyCode.trim().toUpperCase());
        toast({ title: "Check your email!", description: "We sent you a verification link." });
      } else {
        await signIn(email, password);
        navigate("/");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 py-12 max-w-md mx-auto w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4"
        >
          <img src={logoWhite} alt="Team Welly" className="h-16 w-auto" />
          <p className="text-muted-foreground text-sm">Custom Wellness</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isSignUp ? "Start Your Journey" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {isSignUp ? "Enter your company code to create an account" : "Sign in to continue your wellness path"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={companyCode}
                      onChange={(e) => setCompanyCode(e.target.value.toUpperCase())}
                      placeholder="Company Access Code"
                      className="pl-10 bg-secondary border-border/50 h-11 uppercase tracking-widest font-mono"
                      required
                    />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="pl-10 bg-secondary border-border/50 h-11"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="pl-10 bg-secondary border-border/50 h-11"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="pl-10 bg-secondary border-border/50 h-11"
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 gradient-primary text-primary-foreground font-display font-semibold text-base glow-primary"
            >
              {loading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-muted-foreground text-sm"
          >
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <span className="text-primary font-medium">
              {isSignUp ? "Sign In" : "Sign Up"}
            </span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
