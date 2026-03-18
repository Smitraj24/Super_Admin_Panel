"use client";

import { useAuth } from "../../../context/AuthContext.js";
import {
  User,
  Briefcase,
  Shield,
  Users,
  Building2,
  UserCog,
  Settings,
  Eye,
} from "lucide-react";
import Calendar from "../../../components/Calendar";
import HolidayWidget from "../../../components/HolidayWidget";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import Link from "next/link";
import ProtectedRoute from "../../../components/ProtectedRoute";

export default function UserDashboard() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: "View Profile",
      description: "Manage your personal information",
      icon: User,
      href: "/user/profile",
      color: "indigo",
    },
    {
      title: "Browse Users",
      description: "View all users in the system",
      icon: Users,
      href: "/user/users",
      color: "blue",
    },
    {
      title: "View Departments",
      description: "See available departments",
      icon: Building2,
      href: "/user/departments",
      color: "emerald",
    },
    {
      title: "View Roles",
      description: "Check system roles",
      icon: UserCog,
      href: "/user/roles",
      color: "purple",
    },
  ];

  return (
    <ProtectedRoute roles={["USER"]}>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Sidebar />
        <Navbar />

        <main className="pl-64 pt-16">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back, {user?.name}
              </h1>
              <p className="text-slate-500">Here's your dashboard overview</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <User className="text-indigo-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Name</p>
                    <p className="font-semibold text-slate-900">{user?.name}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Shield className="text-emerald-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Role</p>
                    <p className="font-semibold text-slate-900 capitalize">
                      {user?.role?.name || user?.role || "User"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-semibold text-slate-900">
                      {user?.department?.name || "Not Assigned"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex items-center gap-4 mb-3">
                        <div
                          className={`w-12 h-12 bg-${action.color}-100 rounded-xl flex items-center justify-center group-hover:bg-${action.color}-200 transition-colors`}
                        >
                          <action.icon
                            className={`text-${action.color}-600`}
                            size={24}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                            {action.title}
                          </h3>
                        </div>
                      </div>
                      <p className="text-sm text-slate-500">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 mb-10">
              <Calendar />
             
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                  <Eye className="text-slate-600" size={20} />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">
                  Recent Activity
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <p className="text-sm text-slate-600">
                    Welcome to the system! Your account is now active.
                  </p>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="text-sm text-slate-600">
                    Profile information has been updated.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
