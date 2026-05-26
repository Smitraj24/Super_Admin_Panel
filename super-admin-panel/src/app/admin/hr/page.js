"use client";
import UnifiedDashboard from "@/components/UnifiedDashboard";
import { ProtectedDashboardRoute } from "@/components/ProtectedDashboardRoute";
import { ROLES, DEPARTMENTS } from "@/utils/constants";

export default function HRAdminPage() {
  return (
    <ProtectedDashboardRoute
      requiredRole={ROLES.ADMIN}
      requiredDepartment={DEPARTMENTS.HR.name}
    >
      <UnifiedDashboard userRole={ROLES.ADMIN} department={DEPARTMENTS.HR.name} />
    </ProtectedDashboardRoute>
  );
}
