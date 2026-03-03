import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AppRole = "admin" | "hr_admin" | "user";

interface UserRoleData {
  role: AppRole;
  companyId: string | null;
  companyName: string | null;
  loading: boolean;
}

export const useUserRole = (): UserRoleData => {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole>("user");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      // Check user_roles table for elevated roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role, company_name")
        .eq("user_id", user.id);

      if (roles && roles.length > 0) {
        // Priority: admin > hr_admin > user
        const isAdmin = roles.some((r) => r.role === "admin");
        const hrRole = roles.find((r) => r.role === "hr_admin");

        if (isAdmin) {
          setRole("admin");
        } else if (hrRole) {
          setRole("hr_admin");
          setCompanyName(hrRole.company_name);
        }
      }

      // Get company_id from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("user_id", user.id)
        .single();

      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        // Get company name if not already set
        if (!companyName) {
          const { data: company } = await supabase
            .from("companies")
            .select("name")
            .eq("id", profile.company_id)
            .single();
          if (company) setCompanyName(company.name);
        }
      }

      setLoading(false);
    };

    fetchRole();
  }, [user]);

  return { role, companyId, companyName, loading };
};

export const getRoleRedirectPath = (role: AppRole): string => {
  switch (role) {
    case "admin":
      return "/admin/super";
    case "hr_admin":
      return "/admin/company";
    default:
      return "/";
  }
};
