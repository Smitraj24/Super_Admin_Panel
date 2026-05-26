"use client";

import UnifiedDashboard from "@/components/UnifiedDashboard";
import { ProtectedDashboardRoute } from "@/components/ProtectedDashboardRoute";
import { ROLES, DEPARTMENTS } from "@/utils/constants";

export default function SalesUserDashboard() {
  return (
    <ProtectedDashboardRoute
      requiredRole={ROLES.USER}
      requiredDepartment={DEPARTMENTS.SALES.name}
    >
      <UnifiedDashboard userRole={ROLES.USER} department={DEPARTMENTS.SALES.name} />
    </ProtectedDashboardRoute>
  );
}
