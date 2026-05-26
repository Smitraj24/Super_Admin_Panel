"use client";

import UnifiedDashboard from "@/components/UnifiedDashboard";
import { ProtectedDashboardRoute } from "@/components/ProtectedDashboardRoute";
import { ROLES, DEPARTMENTS } from "@/utils/constants";

export default function ITAdminPage() {
  return (
    <ProtectedDashboardRoute
      requiredRole={ROLES.ADMIN}
      requiredDepartment={DEPARTMENTS.IT.name}
    >
      <UnifiedDashboard userRole={ROLES.ADMIN} department={DEPARTMENTS.IT.name} />
    </ProtectedDashboardRoute>
  );
}
