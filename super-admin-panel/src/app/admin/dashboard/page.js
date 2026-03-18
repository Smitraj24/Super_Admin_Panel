"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  Activity,
  Clock,
  TrendingUp,
  LayoutDashboard,
  UserCog,
} from "lucide-react";
import Link from "next/link";
import Calendar from "../../../components/Calendar";
import HolidayWidget from "../../../components/HolidayWidget";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import { getAdminStatsApi } from "../../../services/adminApi";
import Loader from "../../../components/Loader";
import ProtectedRoute from "../../../components/ProtectedRoute";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: { totalUsers: 0, departments: 0, activeToday: 0, roles: 0 },
    recentActivity: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStatsApi();
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loader />;

  const statCards = [
    {
      title: "Total Users",
      value: data.stats.totalUsers,
      icon: Users,
      color: "blue",
      link: "/admin/users",
    },
    {
      title: "Departments",
      value: data.stats.departments,
      icon: Building2,
      color: "indigo",
      link: "/admin/departments",
    },
    {
      title: "Active Today",
      value: data.stats.activeToday,
      icon: Activity,
      color: "emerald",
      link: "/admin/active-users",
    },
    {
      title: "System Roles",
      value: data.stats.roles,
      icon: UserCog,
      trend: "+1",
      link: "/admin/roles",
    },
  ];

  return (
    <ProtectedRoute roles={["ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Sidebar />
        <Navbar />

        <main className="md:pl-64 pt-16">
          <div className="p-8">
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-slate-500 font-medium mb-1">Admin Panel</p>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Dashboard Overview
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {statCards.map((card, i) => (
                <Link key={i} href={card.link}>
                  <div
                    key={i}
                    className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`p-3 bg-${card.color}-100 text-${card.color}-600 rounded-2xl`}
                      >
                        <card.icon size={24} />
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-emerald-100 text-emerald-600 rounded-lg flex items-center gap-1">
                        <TrendingUp size={12} />
                        +5%
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium text-sm mb-1">
                      {card.title}
                    </p>
                    <h2 className="text-3xl font-bold text-slate-900">
                      {card.value}
                    </h2>
                  </div>
                </Link>
              ))}
            </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 mb-10">
                       <Calendar />
                       <HolidayWidget />
                 </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Activity size={24} className="text-indigo-600" />
                    Recent System Activity
                  </h3>
                </div>
                <div className="space-y-6">
                  {data.recentActivity.map((a) => (
                    <div
                      key={a.id}
                      className="flex gap-4 items-center p-4 hover:bg-slate-50 rounded-2xl transition-colors"
                    >
                      <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                      <div className="flex-1">
                        <p className="text-slate-700 font-semibold">{a.text}</p>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                        <Clock size={14} />
                        {a.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-indigo-600 p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                <div className="space-y-4">
                  <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all text-left flex items-center gap-3">
                    <Users size={18} /> Add New User
                  </button>
                  <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all text-left flex items-center gap-3">
                    <Building2 size={18} /> Create Department
                  </button>
                  <div className="pt-4 mt-4 border-t border-white/10">
                    <p className="text-sm text-indigo-100 mb-4 italic">
                      "Management is doing things right; leadership is doing the
                      right things."
                    </p>
                    <p className="text-xs font-bold text-indigo-200 opacity-80">
                      — Peter Drucker
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
