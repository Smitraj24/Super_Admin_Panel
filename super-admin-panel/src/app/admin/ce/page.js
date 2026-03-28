"use client";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  BarChart3,
  Calendar,
  AlertCircle,
  TrendingUp,
  Cpu,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { getUsersApi } from "@/services/superAdminApi";
import AttendanceButtons from "../../../components/AttendanceButtons";

function CEAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRes = await getUsersApi();
        const ceUsers = usersRes.data.filter(
          (u) =>
            (typeof u.department === "object"
              ? u.department?.name
              : u.department) === "ce",
        );
        setStats({
          totalUsers: ceUsers.length,
          activeUsers: ceUsers.filter((u) => u.status !== "inactive").length,
          totalProjects: 12,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen  bg-[#F8FAFC]">
      <Navbar />
      <Sidebar />

      <div className="lg:ml-64 pt-20">
        <div className="max-w-7xl mx-auto p-8">
          <div style={{ padding: 40 }}>
            <h1>Attendance System</h1>
            <AttendanceButtons userId={user?._id} />
          </div>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              CE Department Admin Dashboard
            </h1>
            <p className="text-black text-lg">
              Welcome, {user?.name}! Here's your CE management overview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Total CE Users
                </h3>
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
              <p className="text-sm text-gray-500 mt-2">In CE department</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Active Users
                </h3>
                <TrendingUp className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeUsers}
              </p>
              <p className="text-sm text-gray-500 mt-2">Currently active</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Active Projects
                </h3>
                <Cpu className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalProjects}
              </p>
              <p className="text-sm text-gray-500 mt-2">In progress</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-600">
                  Pending Tasks
                </h3>
                <AlertCircle className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500 mt-2">Awaiting action</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-gray-600" />
                Department Overview
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                  <p className="font-semibold text-gray-900">Employee Count</p>
                  <p className="text-sm text-gray-600">
                    {stats.totalUsers} employees total
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                  <p className="font-semibold text-gray-900">Active Projects</p>
                  <p className="text-sm text-gray-600">
                    {stats.totalProjects} active projects
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-gray-500">
                  <p className="font-semibold text-gray-900">Team Status</p>
                  <p className="text-sm text-gray-600">
                    All systems operational
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-4">
                <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition border-l-4 border-gray-500">
                  <p className="font-semibold text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-600">
                    Add, edit, or remove employees
                  </p>
                </button>
                <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition border-l-4 border-gray-500">
                  <p className="font-semibold text-gray-900">Manage Projects</p>
                  <p className="text-sm text-gray-600">
                    Create and track projects
                  </p>
                </button>
                <button className="w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition border-l-4 border-gray-500">
                  <p className="font-semibold text-gray-900">View Reports</p>
                  <p className="text-sm text-gray-600">
                    Department reports and analytics
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CEAdminPage() {
  return <CEAdminDashboard />;
}
