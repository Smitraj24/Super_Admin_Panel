"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Home, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function Unauthorized() {
  const router = useRouter();
  const { user, logout, getDepartment } = useAuth();
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    const dept = getDepartment();
    setDepartment(dept);
  }, [user]);

  const handleGoToDashboard = () => {
    if (user?.role?.name === "USER" && department) {
      const deptName =
        typeof department === "object" ? department.name : department;
      const deptPath = deptName.toLowerCase();
      router.push(`/dashboard/${deptPath}`);
    } else if (user?.role?.name === "ADMIN") {
      if (department) {
        const deptName = typeof department === "object" ? department.name : department;
        const deptPath = deptName.toLowerCase();
        router.push(`/admin/${deptPath}/dashboard`);
      } else {
        router.push("/admin/ce/dashboard");
      }
    } else if (user?.role?.name === "SUPER_ADMIN") {
      router.push("/superadmin/dashboard");
    } else {
      router.push("/");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full">
            <Lock className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-6xl font-bold text-slate-900 mb-2">403</h1>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Access Denied
        </h2>

        {/* Description */}
        <p className="text-slate-600 mb-8">
          You don't have permission to access this resource. You may be trying
          to access a dashboard that belongs to a different department.
        </p>

        {/* Info Card */}
        <div className="bg-white rounded-2xl p-6 mb-8 border border-slate-200 shadow-lg">
          <p className="text-sm text-slate-600 mb-2">
            <span className="font-semibold">Your Department:</span>
          </p>
          <p className="text-lg font-bold text-indigo-600">
            {department ? (
              typeof department === "object" ? (
                department.name
              ) : (
                department
              )
            ) : (
              <span className="text-slate-400">Not assigned</span>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoToDashboard}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Home size={20} />
            Go to Your Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="w-full bg-slate-200 text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-8">
          If you believe this is a mistake, please contact your administrator.
        </p>
      </div>
    </div>
  );
}
