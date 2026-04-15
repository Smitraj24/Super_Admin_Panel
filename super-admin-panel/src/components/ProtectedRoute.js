"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;

    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Check role-based access if allowedRoles is specified
    if (allowedRoles.length > 0 && user) {
      const userRole = (user?.role?.name || user?.role || "").toUpperCase().replace(" ", "_");
      
      if (!allowedRoles.includes(userRole)) {
        // Redirect to appropriate dashboard based on role
        if (userRole === "SUPER_ADMIN") {
          router.push("/superadmin/dashboard");
        } else if (userRole === "ADMIN") {
          const dept = (typeof user?.department === "object" 
            ? user?.department?.name 
            : user?.department || "ce").toLowerCase();
          router.push(`/admin/${dept}`);
        } else {
          const dept = (typeof user?.department === "object" 
            ? user?.department?.name 
            : user?.department || "ce").toLowerCase();
          router.push(`/dashboard/${dept}`);
        }
      }
    }
  }, [mounted, loading, user, isAuthenticated, allowedRoles, router]);

  // Show loading state while checking authentication
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children until authenticated
  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
