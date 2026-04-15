"use client";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  BarChart3,
  Calendar,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { getUsersApi } from "@/services/superAdminApi";
import AttendanceButtons from "../../../components/AttendanceButtons";
import BroadcastMessage from "@/components/BroadcastMessage";
import { ProtectedDashboardRoute } from "@/components/ProtectedDashboardRoute";
import { ROLES, DEPARTMENTS } from "@/utils/constants";

function SalesAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalLeads: 0,
    conversionRate: 28,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRes = await getUsersApi();
        const salesUsers = usersRes.data.filter(
          (u) =>
            (typeof u.department === "object"
              ? u.department?.name
              : u.department) === "sales",
        );
        setStats({
          totalUsers: salesUsers.length,
          activeUsers: salesUsers.filter((u) => u.status !== "inactive").length,
          totalLeads: 245,
          conversionRate: 28,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <ProtectedDashboardRoute
      requiredRole={ROLES.ADMIN}
      requiredDepartment={DEPARTMENTS.SALES.name}
    >
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <Navbar />
        <Sidebar />

      <div className="lg:ml-64 pt-20">
        <div className="max-w-7xl mx-auto p-8">
          <div className="grid gap-3 mb-10">
            <h1 className=" text-4xl font-bold text-blue-900">
              Attendance System
            </h1>
            <AttendanceButtons userId={user?._id} />
          </div>
          <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-purple-900 mb-2">
                Sales Department Admin Dashboard
              </h1>
              <p className="text-purple-700 text-lg">
                Welcome, {user?.name}! Here's your Sales management overview.
              </p>
            </div>
            <BroadcastMessage />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-purple-600">
                  Total Sales Users
                </h3>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {stats.totalUsers}
              </p>
              <p className="text-sm text-purple-500 mt-2">
                In Sales department
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-purple-600">
                  Active Users
                </h3>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {stats.activeUsers}
              </p>
              <p className="text-sm text-purple-500 mt-2">Currently active</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-purple-600">
                  Active Leads
                </h3>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {stats.totalLeads}
              </p>
              <p className="text-sm text-purple-500 mt-2">Open opportunities</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-purple-600">
                  Conversion Rate
                </h3>
                <AlertCircle className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-900">
                {stats.conversionRate}%
              </p>
              <p className="text-sm text-purple-500 mt-2">This quarter</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <h2 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-purple-600" />
                Sales Performance
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="font-semibold text-purple-900">Total Leads</p>
                  <p className="text-sm text-purple-600">
                    {stats.totalLeads} leads in pipeline
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="font-semibold text-purple-900">
                    Conversion Rate
                  </p>
                  <p className="text-sm text-purple-600">
                    {stats.conversionRate}% conversion this quarter
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <p className="font-semibold text-purple-900">Team Status</p>
                  <p className="text-sm text-purple-600">
                    All targets on track
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <h2 className="text-xl font-bold text-purple-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-4">
                <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition border-l-4 border-purple-500">
                  <p className="font-semibold text-purple-900">Manage Users</p>
                  <p className="text-sm text-purple-600">
                    Add, edit, or remove employees
                  </p>
                </button>
                <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition border-l-4 border-purple-500">
                  <p className="font-semibold text-purple-900">Manage Leads</p>
                  <p className="text-sm text-purple-600">Track sales leads</p>
                </button>
                <button className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition border-l-4 border-purple-500">
                  <p className="font-semibold text-purple-900">View Reports</p>
                  <p className="text-sm text-purple-600">
                    Sales reports and analytics
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </ProtectedDashboardRoute>
  );
}

export default function SalesAdminPage() {
  return <SalesAdminDashboard />;
}
