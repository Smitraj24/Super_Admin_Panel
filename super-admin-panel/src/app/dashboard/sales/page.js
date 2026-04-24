"use client";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, Target, Users, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AttendanceButtons from "@/components/AttendanceButtons";

function SalesDashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <Sidebar />
      <Navbar />

      <div className="lg:ml-64 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-3 mb-10">
            <h1 className=" text-4xl font-bold text-blue-900">
              Attendance System
            </h1>
            <AttendanceButtons userId={user?._id} />
          </div>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-purple-900 mb-2">
              My Dashboard - Sales Department
            </h1>
            <p className="text-purple-700 text-lg">
              Welcome, {user?.name}! Here's your personal sales overview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-purple-600">
                  Total Revenue
                </h3>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-900">$2.4M</p>
              <p className="text-sm text-purple-500 mt-2">This quarter</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-purple-600">
                  Active Deals
                </h3>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-900">42</p>
              <p className="text-sm text-purple-500 mt-2">In pipeline</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-purple-600">
                  Sales Team
                </h3>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-900">15</p>
              <p className="text-sm text-purple-500 mt-2">Active members</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-purple-600">
                  Conversion Rate
                </h3>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-900">34%</p>
              <p className="text-sm text-purple-500 mt-2">vs last quarter</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <h2 className="text-xl font-bold text-purple-900 mb-6">
                High-Value Deals
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-purple-900">
                        Enterprise Deal - Tech Corp
                      </p>
                      <p className="text-sm text-purple-600">
                        Deal value: $450K
                      </p>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      50%
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-purple-900">
                        Corporate - Finance Inc
                      </p>
                      <p className="text-sm text-purple-600">
                        Deal value: $320K
                      </p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                      30%
                    </span>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-purple-900">
                        Mid-Market - Innovation Ltd
                      </p>
                      <p className="text-sm text-purple-600">
                        Deal value: $180K
                      </p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                      20%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <h2 className="text-xl font-bold text-purple-900 mb-6">
                Team Performance
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold text-purple-900">
                      Alex Johnson
                    </p>
                    <p className="text-sm font-bold text-purple-600">$450K</p>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "95%" }}
                    ></div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold text-purple-900">Sarah Smith</p>
                    <p className="text-sm font-bold text-purple-600">$380K</p>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "80%" }}
                    ></div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <p className="font-semibold text-purple-900">Mike Davis</p>
                    <p className="text-sm font-bold text-purple-600">$290K</p>
                  </div>
                  <div className="w-full bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: "61%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function SalesPage() {
  return <SalesDashboard />;
}
