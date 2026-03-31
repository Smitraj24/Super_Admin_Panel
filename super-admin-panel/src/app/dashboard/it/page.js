"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Code2, Server, Database, Shield } from "lucide-react";
import Calander from "../../../components/Calendar.js";
import HolidayWidget from "@/components/HolidayWidget.js";
import AttendanceButtons from "@/components/AttendanceButtons.js";

function ITDashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-15">
      <Sidebar />
      <Navbar />
      <div className="lg:ml-64 mt-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-3 mb-10">
            <h1 className=" text-4xl font-bold text-blue-900">
              Attendance System
            </h1>
            <AttendanceButtons userId={user?._id} />
          </div>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">
              My Dashboard - IT Department
            </h1>
            <p className="text-blue-700 text-lg">
              Welcome, {user?.name}! Here's your personal IT overview.
            </p>
          </div>

          <div className="mb-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-blue-600">
                    Active Servers
                  </h3>
                  <Server className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-900">24</p>
                <p className="text-sm text-blue-500 mt-2">All operational ✓</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-blue-600">
                    Databases
                  </h3>
                  <Database className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-900">8</p>
                <p className="text-sm text-blue-500 mt-2">Healthy status</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-blue-600">
                    Security Alerts
                  </h3>
                  <Shield className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-900">2</p>
                <p className="text-sm text-blue-500 mt-2">Need attention</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-semibold text-blue-600">
                    System Uptime
                  </h3>
                  <Code2 className="w-8 h-8 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-900">99.9%</p>
                <p className="text-sm text-blue-500 mt-2">Excellent</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-4 h-[500px] overflow-y-auto shadow-md">
                <Calander />
              </div>

              <div className="bg-white rounded-2xl p-4 h-[500px] overflow-y-auto shadow-md">
                <HolidayWidget />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-6">
                Recent Incidents
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">
                    Database Backup Completed
                  </p>
                  <p className="text-sm text-blue-600">2 hours ago</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <p className="font-semibold text-yellow-900">
                    Security Patch Available
                  </p>
                  <p className="text-sm text-yellow-600">5 hours ago</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">
                    Network Maintenance Complete
                  </p>
                  <p className="text-sm text-blue-600">1 day ago</p>
                </div>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-6">
                Upcoming Tasks
              </h2>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <input type="checkbox" className="mr-4" />
                  <span className="text-blue-900">Deploy Server Update</span>
                </div>
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <input type="checkbox" className="mr-4" />
                  <span className="text-blue-900">SSL Certificate Renewal</span>
                </div>
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <input type="checkbox" className="mr-4" />
                  <span className="text-blue-900">Database Optimization</span>
                </div>
                <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                  <input type="checkbox" className="mr-4" />
                  <span className="text-blue-900">Firewall Configuration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ITPage() {
  return <ITDashboard />;
}
