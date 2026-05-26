"use client";

import UnifiedDashboard from "@/components/UnifiedDashboard";
import { ProtectedDashboardRoute } from "@/components/ProtectedDashboardRoute";
import { ROLES, DEPARTMENTS } from "@/utils/constants";

export default function ITUserDashboard() {
  return (
    <ProtectedDashboardRoute
      requiredRole={ROLES.USER}
      requiredDepartment={DEPARTMENTS.IT.name}
    >
      <UnifiedDashboard userRole={ROLES.USER} department={DEPARTMENTS.IT.name} />
    </ProtectedDashboardRoute>
  );
}
