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
import { getUsersApi } from "@/services/adminApi";
import AttendanceButtons from "../../../components/AttendanceButtons";
import BroadcastMessage from "@/components/BroadcastMessage";
import { ProtectedDashboardRoute } from "@/components/ProtectedDashboardRoute";
import { ROLES, DEPARTMENTS } from "@/utils/constants";

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
        setStats({
          totalUsers: usersRes.data.length,
          activeUsers: usersRes.data.filter((u) => u.isActive !== false).length,
          totalProjects: 12,
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
      requiredDepartment={DEPARTMENTS.CE.name}
    >
      <main className="min-h-screen  bg-[#F8FAFC]">
        <Navbar />
        <Sidebar />

        <div className="lg:ml-64 pt-20">
          <div className="max-w-7xl mx-auto p-6">
            <div className="grid grid-cols-1 gap-3 mb-10">
              <h1 className=" text-4xl font-bold text-blue-900">
                Attendance System
              </h1>
              <AttendanceButtons userId={user?._id} />
            </div>
            <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  CE Department Admin Dashboard
                </h1>
                <p className="text-black text-lg">
                  Welcome, {user?.name}! Here`s your CE management overview.
                </p>
              </div>
              <BroadcastMessage />
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
                <p className="text-sm text-gray-500 mt-2">In development</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600">
                    Alerts
                  </h3>
                  <AlertCircle className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900">3</p>
                <p className="text-sm text-gray-500 mt-2">Needs attention</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  CE Performance
                </h3>
                <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-200">
                  <BarChart3 className="w-12 h-12 text-gray-300" />
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Upcoming Milestones
                </h3>
                <div className="space-y-4">
                  {[
                    "Client Onboarding - Project X",
                    "Quarterly Review",
                    "New Service Launch",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
                    >
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{item}</p>
                        <p className="text-sm text-gray-500">
                          Due in {i + 2} days
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedDashboardRoute>
  );
}

export default function CEAdminPage() {
  return <CEAdminDashboard />;
}
