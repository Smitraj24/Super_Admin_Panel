"use client";
import { useAuth } from "@/context/AuthContext";
import {
  Users,
  BarChart3,
  Calendar,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { getUsers } from "@/services/userApi";
import { useRouter } from "next/navigation";

function HRAdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalLeaves: 0,
    pendingTasks: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    setLoading(true);
    setError("");

    try {
      const usersRes = await getUsers();

      const allUsers = usersRes.data;

      const activeUsers = allUsers.filter(
        (u) => u.status !== "inactive",
      ).length;

      // Example logic for pending tasks
      const pendingTasks = allUsers.filter(
        (u) => u.status === "pending",
      ).length;

      setStats({
        totalUsers: allUsers.length,
        activeUsers,
        totalLeaves: allUsers.length * 20,
        pendingTasks,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Navbar />
      <Sidebar />

      <div className="lg:ml-64 pt-20">
        <div className="max-w-7xl mx-auto p-8">
         
          <div className="mb-12 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-green-900 mb-2">
                HR Department Admin Dashboard
              </h1>
              <p className="text-green-700 text-lg">Welcome, {user?.name}!</p>
            </div>

         
            <button
              onClick={fetchStats}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-100"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

      
          {error && (
            <div className="bg-red-100 text-red-600 p-3 rounded mb-6">
              {error}
            </div>
          )}

          
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Loading dashboard...
            </div>
          ) : (
            <>
          
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card
                  title="Total HR Users"
                  value={stats.totalUsers}
                  icon={<Users />}
                />
                <Card
                  title="Active Users"
                  value={stats.activeUsers}
                  icon={<TrendingUp />}
                />
                <Card
                  title="Total Leave Days"
                  value={stats.totalLeaves}
                  icon={<Calendar />}
                />
                <Card
                  title="Pending Tasks"
                  value={stats.pendingTasks}
                  icon={<AlertCircle />}
                />
              </div>

              {/* CONTENT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Overview */}
                <div className="bg-white rounded-2xl p-8 shadow-lg border">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <BarChart3 size={24} />
                    Department Overview
                  </h2>

                  <div className="space-y-4">
                    <Box
                      label="Employee Count"
                      value={`${stats.totalUsers} employees`}
                    />
                    <Box
                      label="Active Status"
                      value={`${stats.activeUsers} active`}
                    />
                    <Box
                      label="Leave Balance"
                      value="Avg 20 days per employee"
                    />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-lg border">
                  <h2 className="text-xl font-bold mb-6">Quick Actions</h2>

                  <div className="space-y-4">
                    <Action
                      title="Manage Users"
                      desc="Add, edit, or remove employees"
                      onClick={() => router.push("/dashboard/users")}
                    />

                    <Action
                      title="Leave Management"
                      desc="Manage leave requests"
                      onClick={() => router.push("/dashboard/leaves")}
                    />

                    <Action
                      title="View Reports"
                      desc="Analytics and reports"
                      onClick={() => router.push("/dashboard/reports")}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function HRAdminPage() {
  return <HRAdminDashboard />;
}

function Card({ title, value, icon }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow border">
      <div className="flex justify-between mb-2">
        <h3 className="text-sm text-gray-500">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function Box({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <p className="font-semibold">{label}</p>
      <p className="text-sm text-gray-600">{value}</p>
    </div>
  );
}

function Action({ title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition"
    >
      <p className="font-semibold">{title}</p>
      <p className="text-sm text-gray-600">{desc}</p>
    </button>
  );
}
