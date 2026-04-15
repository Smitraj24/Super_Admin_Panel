"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DepartmentProtectedRoute({ children, requiredDepartment }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // Check authentication
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    // Check department access
    if (user) {
      const userRole = (user?.role?.name || user?.role || "").toUpperCase().replace(" ", "_");
      const userDept = (typeof user?.department === "object" 
        ? user?.department?.name 
        : user?.department || "").toLowerCase();

      console.log("DepartmentProtectedRoute - User:", user);
      console.log("DepartmentProtectedRoute - User Role:", userRole);
      console.log("DepartmentProtectedRoute - User Dept:", userDept);
      console.log("DepartmentProtectedRoute - Required Dept:", requiredDepartment);

      // Super admin can access any department
      if (userRole === "SUPER_ADMIN") {
        setIsAllowed(true);
        setIsChecking(false);
        return;
      }

      // If user has no department, redirect to login to refresh data
      if (!userDept || userDept === "") {
        console.error("User has no department! Redirecting to login...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      // Check if user's department matches the required department
      if (requiredDepartment && userDept !== requiredDepartment.toLowerCase()) {
        console.warn(`Department mismatch: User is in ${userDept} but trying to access ${requiredDepartment}`);
        
        // Redirect to correct department
        if (userRole === "ADMIN") {
          router.replace(`/admin/${userDept}`);
        } else {
          router.replace(`/dashboard/${userDept}`);
        }
        return;
      }

      // Department matches, allow access
      setIsAllowed(true);
      setIsChecking(false);
    }
  }, [loading, user, isAuthenticated, requiredDepartment, router]);

  // Show loading state while checking
  if (loading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children if allowed
  if (isAllowed) {
    return <>{children}</>;
  }

  // Default: show nothing (redirect is in progress)
  return null;
}
