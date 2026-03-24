"use client";
import { useAuth } from "@/context/AuthContext";
import { Users, Briefcase, Calendar, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

function HRDashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen  bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <Sidebar />

      <div className="lg:ml:64 pt-20">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">
              My Dashboard - HR Department
            </h1>
            <p className="text-blue-700 text-lg">
              Welcome, {user?.name}! Here's your personal HR overview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-600">
                  My Leave Balance
                </h3>
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">12</p>
              <p className="text-sm text-blue-500 mt-2">Days available</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-600">
                  My Performance
                </h3>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">4.2/5</p>
              <p className="text-sm text-blue-500 mt-2">Last evaluation</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-600">
                  My Tasks
                </h3>
                <Briefcase className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">8</p>
              <p className="text-sm text-blue-500 mt-2">This month</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-600">
                  My Status
                </h3>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-900">Active</p>
              <p className="text-sm text-blue-500 mt-2">Full-time employee</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-6">
                Upcoming Interviews
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">
                    Senior Developer Interview
                  </p>
                  <p className="text-sm text-blue-600">Today, 2:00 PM</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">
                    Marketing Manager Interview
                  </p>
                  <p className="text-sm text-blue-600">Tomorrow, 10:30 AM</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold text-blue-900">
                    HR Coordinator Interview
                  </p>
                  <p className="text-sm text-blue-600">March 22, 3:00 PM</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-6">
                Recent Activities
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900">
                    Salary Review Completed
                  </p>
                  <p className="text-sm text-blue-600">3 days ago</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900">
                    New Employee Onboarding
                  </p>
                  <p className="text-sm text-blue-600">5 days ago</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900">
                    Performance Review Initiated
                  </p>
                  <p className="text-sm text-blue-600">1 week ago</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="font-semibold text-blue-900">
                    Team Building Event Scheduled
                  </p>
                  <p className="text-sm text-blue-600">2 weeks ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function HRPage() {
  return <HRDashboard />;
}
