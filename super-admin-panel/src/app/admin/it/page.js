"use client";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  BarChart3,
  Calendar,
  AlertCircle,
  TrendingUp,
  Monitor,
  Server,
  Wifi,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { getUsersApi } from "@/services/superAdminApi";

function ITAdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    serverUptime: 99.9,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersRes = await getUsersApi();
        const itUsers = usersRes.data.filter(
          (u) =>
            (typeof u.department === "object"
              ? u.department?.name
              : u.department) === "it",
        );
        setStats({
          totalUsers: itUsers.length,
          activeUsers: itUsers.filter((u) => u.status !== "inactive").length,
          serverUptime: 99.9,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <Sidebar />

      <div className="lg:ml-64 pt-20">
        <div className="max-w-7xl mx-auto p-8">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">
              IT Department Admin Dashboard
            </h1>
            <p className="text-blue-700 text-lg">
              Welcome, {user?.name}! Here's your IT management overview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-600">
                  Total IT Users
                </h3>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {stats.totalUsers}
              </p>
              <p className="text-sm text-blue-500 mt-2">In IT department</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-600">
                  Active Users
                </h3>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {stats.activeUsers}
              </p>
              <p className="text-sm text-blue-500 mt-2">Currently active</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-600">
                  Server Uptime
                </h3>
                <Server className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">
                {stats.serverUptime}%
              </p>
              <p className="text-sm text-blue-500 mt-2">This month</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-600">
                  Pending Tickets
                </h3>
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">8</p>
              <p className="text-sm text-blue-500 mt-2">To be resolved</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
                <BarChart3 size={24} className="text-blue-600" />
                Infrastructure Status
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">Server Status</p>
                  <p className="text-sm text-blue-600">
                    All servers operational
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">Network Health</p>
                  <p className="text-sm text-blue-600">
                    Bandwidth: 85% capacity
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">Security</p>
                  <p className="text-sm text-blue-600">No active alerts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-6">
                Quick Actions
              </h2>
              <div className="space-y-4">
                <button className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">Manage Users</p>
                  <p className="text-sm text-blue-600">
                    Add, edit, or remove employees
                  </p>
                </button>
                <button className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">
                    System Monitoring
                  </p>
                  <p className="text-sm text-blue-600">
                    Monitor infrastructure
                  </p>
                </button>
                <button className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">Help Desk</p>
                  <p className="text-sm text-blue-600">
                    View and manage tickets
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

export default function ITAdminPage() {
  return <ITAdminDashboard />;
}
