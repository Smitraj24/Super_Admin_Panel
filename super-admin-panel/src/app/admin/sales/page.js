"use client";

import UnifiedDashboard from "@/components/UnifiedDashboard";
import { ProtectedDashboardRoute } from "@/components/ProtectedDashboardRoute";
import { ROLES, DEPARTMENTS } from "@/utils/constants";

export default function SalesAdminPage() {
  return (
    <ProtectedDashboardRoute
      requiredRole={ROLES.ADMIN}
      requiredDepartment={DEPARTMENTS.SALES.name}
    >
      <UnifiedDashboard userRole={ROLES.ADMIN} department={DEPARTMENTS.SALES.name} />
    </ProtectedDashboardRoute>
  );
}
