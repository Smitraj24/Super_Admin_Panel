"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { ROLES, DEPARTMENTS } from "@/utils/constants";
import Loader from "@/components/Loader";

/**
 * ProtectedDashboardRoute - Wraps dashboard pages to ensure:
 * 1. User is authenticated
 * 2. User has appropriate role/department access
 * 3. Redirects to unauthorized page if access denied
 */
export const ProtectedDashboardRoute = ({
  children,
  requiredRole = null,
  requiredDepartment = null,
}) => {
  const { user, loading, isAuthenticated, getRole, getDepartment } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Get user role and department
    const userRole = getRole();
    const userDepartment = getDepartment();

    // Check role-based access
    if (requiredRole && userRole !== requiredRole) {
      router.push("/unauthorized");
      setAuthLoading(false);
      return;
    }

    // Check department-based access for USER and ADMIN roles
    if (
      requiredDepartment &&
      (userRole === ROLES.USER || userRole === ROLES.ADMIN)
    ) {
      // Get actual department name from user data
      const actualDepartmentName =
        typeof userDepartment === "object" && userDepartment !== null
          ? userDepartment.name
          : userDepartment;

      if (!actualDepartmentName) {
        // User has no department assigned, redirect to login
        console.error("User has no department assigned");
        router.push("/login");
        setAuthLoading(false);
        return;
      }

      // Compare required department with user's department (case-insensitive)
      if (
        requiredDepartment.toLowerCase() !== actualDepartmentName.toLowerCase()
      ) {
        // User/Admin trying to access different department dashboard
        router.push("/unauthorized");
        setAuthLoading(false);
        return;
      }
    }

    setIsAuthorized(true);
    setAuthLoading(false);
  }, [user, loading, pathname, requiredRole, requiredDepartment]);

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

/**
 * Helper function to extract department from pathname
 * Example: /dashboard/it -> 'it', /admin/ce -> 'ce'
 */
function extractDepartmentFromPath(pathname) {
  // Matches /dashboard/it or /admin/it/...
  const match = pathname.match(/\/(?:admin|dashboard)\/([a-z0-9_-]+)/i);

  if (match) {
    const segment = match[1].toLowerCase();
    // Valid departments
    const validDepartments = ["it", "hr", "sales", "finance", "ce"];
    
    if (validDepartments.includes(segment)) {
      return segment;
    }
  }
  return null;
}

/**
 * Hook to check if user has access to a specific department dashboard
 */
export const useDepartmentAccess = (departmentSlug) => {
  const { user, getRole, getDepartment } = useAuth();
  const router = useRouter();

  const hasAccess = () => {
    const userRole = getRole();

    if (userRole !== ROLES.USER) {
      return false; // Only USER role has department dashboards
    }

    const userDepartment = getDepartment();
    
    if (!userDepartment) {
      return false;
    }
    
    const actualDepartmentName =
      typeof userDepartment === "object" && userDepartment !== null
        ? userDepartment?.name
        : userDepartment;

    if (!actualDepartmentName) {
      return false;
    }

    return actualDepartmentName.toLowerCase() === departmentSlug.toLowerCase();
  };

  const redirectIfUnauthorized = () => {
    if (!hasAccess()) {
      router.push("/unauthorized");
    }
  };

  return { hasAccess: hasAccess(), redirectIfUnauthorized };
};
