"use client";

import UnifiedDashboard from "@/components/UnifiedDashboard";
import { ProtectedDashboardRoute } from "@/components/ProtectedDashboardRoute";
import { ROLES, DEPARTMENTS } from "@/utils/constants";

export default function CEUserDashboard() {
  return (
    <ProtectedDashboardRoute
      requiredRole={ROLES.USER}
      requiredDepartment={DEPARTMENTS.CE.name}
    >
      <UnifiedDashboard userRole={ROLES.USER} department={DEPARTMENTS.CE.name} />
    </ProtectedDashboardRoute>
  );
}
