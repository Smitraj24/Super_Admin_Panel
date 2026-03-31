"use client";
import { useAuth } from "@/context/AuthContext";
import { Cpu, Zap, Code2, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Calander from "../../../components/Calendar.js";
import HolidayWidget from "@/components/HolidayWidget.js";
import AttendanceButtons from "../../../components/AttendanceButtons";

function CEDashboard() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <Sidebar />

      <div className="lg:ml-64 pt-20 p-4 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold  text-blue-900 mb-2">
              Welcome back, {user?.name} 👋
            </h1>
            <p className="text-gray-400">
              Here's what's happening in your CE dashboard today.
            </p>
          </div>

          <div className="grid gap-3 mb-10">
            <h1 className=" text-2xl font-bold text-blue-900">
              Attendance System
            </h1>
            <AttendanceButtons userId={user?._id} />
          </div>

          <div className="mb-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-7">
              <div className="bg-white rounded-2xl p-4  ">
                <Calander />
              </div>

              <div className="bg-white rounded-2xl p-4 h-[700px] overflow-y-auto shadow-md ">
                <HolidayWidget />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[
                {
                  title: "Active Projects",
                  value: "18",
                  desc: "In development",
                  icon: <Code2 className="w-7 h-7" />,
                },
                {
                  title: "System Performance",
                  value: "94%",
                  desc: "Efficiency rating",
                  icon: <Zap className="w-7 h-7" />,
                },
                {
                  title: "Team Members",
                  value: "24",
                  desc: "Active engineers",
                  icon: <Cpu className="w-7 h-7" />,
                },
                {
                  title: "Completion Rate",
                  value: "78%",
                  desc: "Project completion",
                  icon: <TrendingUp className="w-7 h-7" />,
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-5 shadow-md hover:shadow-xl transition duration-300 border border-blue-100"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-blue-500">
                      {item.title}
                    </h3>
                    <div className="text-blue-500">{item.icon}</div>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {item.value}
                  </p>
                  <p className="text-xs text-blue-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100">
              <h2 className="text-lg font-bold text-blue-900 mb-4">
                Current Tasks
              </h2>

              <div className="space-y-3">
                {[
                  ["Circuit Design Review", "In Progress - 65%"],
                  ["Hardware Testing", "In Progress - 45%"],
                  ["System Integration", "Pending - 0%"],
                  ["Documentation Update", "Completed - 100%"],
                ].map((task, i) => (
                  <div
                    key={i}
                    className="p-3 bg-blue-50 rounded-lg border-l-4 border-orange-500 hover:bg-orange-100 transition"
                  >
                    <p className="font-medium text-blue-900">{task[0]}</p>
                    <p className="text-xs text-blue-500">{task[1]}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-md border border-orange-100">
              <h2 className="text-lg font-bold text-blue-900 mb-4">
                Recent Updates
              </h2>

              <div className="space-y-3">
                {[
                  ["Prototype v2.0 Released", "2 hours ago"],
                  ["Performance Optimization Complete", "1 day ago"],
                  ["New Team Member Onboarded", "3 days ago"],
                  ["Client Presentation Scheduled", "1 week ago"],
                ].map((update, i) => (
                  <div
                    key={i}
                    className="p-3 bg-blue-50 rounded-lg hover:bg-orange-100 transition"
                  >
                    <p className="font-mediumtext-blue-900">{update[0]}</p>
                    <p className="text-xs text-blue-500">{update[1]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CEPage() {
  return <CEDashboard />;
}
