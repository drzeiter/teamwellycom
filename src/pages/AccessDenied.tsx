import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <Shield className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground max-w-sm">
          You don't have permission to access this page. Contact your administrator if you believe this is an error.
        </p>
        <Button variant="outline" onClick={() => navigate("/")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
      </motion.div>
    </div>
  );
};

export default AccessDenied;
