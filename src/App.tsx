import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole, type AppRole } from "@/hooks/useUserRole";
import AuthPage from "./pages/AuthPage";
import OnboardingPage from "./pages/OnboardingPage";
import WellnessLobby from "./pages/WellnessLobby";
import ExercisePlayer from "./pages/ExercisePlayer";
import ProgramOverview from "./pages/ProgramOverview";
import ExerciseDetail from "./pages/ExerciseDetail";
import CompanyAdminDashboard from "./pages/CompanyAdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import AccessDenied from "./pages/AccessDenied";
import InviteAccept from "./pages/InviteAccept";
import NotFound from "./pages/NotFound";
import WellyAssistant from "./components/WellyAssistant";
import MovementLab from "./pages/MovementLab";
import logoSubmark from "@/assets/logo-submark.png";

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
    <img src={logoSubmark} alt="Team Welly" className="w-16 h-16 animate-pulse" />
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      setCheckingOnboarding(false);
      return;
    }
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setOnboardingCompleted(data?.onboarding_completed ?? false);
        setCheckingOnboarding(false);
      });
  }, [user]);

  if (loading || checkingOnboarding) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!onboardingCompleted) return <Navigate to="/onboarding" replace />;
  return <>{children}</>;
};

const OnboardingRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (!user) {
      setCheckingOnboarding(false);
      return;
    }
    supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setOnboardingCompleted(data?.onboarding_completed ?? false);
        setCheckingOnboarding(false);
      });
  }, [user]);

  if (loading || checkingOnboarding) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (onboardingCompleted) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ allowedRoles, children }: { allowedRoles: AppRole[]; children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();

  if (loading || roleLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!allowedRoles.includes(role)) return <Navigate to="/access-denied" replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
            <Route path="/" element={<ProtectedRoute><WellnessLobby /></ProtectedRoute>} />
            <Route path="/program/:programId" element={<ProtectedRoute><ProgramOverview /></ProtectedRoute>} />
            <Route path="/player/:programId" element={<ProtectedRoute><ExercisePlayer /></ProtectedRoute>} />
            <Route path="/exercise/:exerciseId" element={<ProtectedRoute><ExerciseDetail /></ProtectedRoute>} />
            <Route path="/movement-lab" element={<ProtectedRoute><MovementLab /></ProtectedRoute>} />
            <Route path="/admin/company" element={<AdminRoute allowedRoles={["hr_admin", "admin"]}><CompanyAdminDashboard /></AdminRoute>} />
            <Route path="/admin/super" element={<AdminRoute allowedRoles={["admin"]}><SuperAdminDashboard /></AdminRoute>} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            {/* Legacy routes redirect to new paths */}
            <Route path="/hr" element={<Navigate to="/admin/company" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/super" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WellyAssistant />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
