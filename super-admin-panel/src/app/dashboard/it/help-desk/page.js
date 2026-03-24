"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function HelpDesk() {
  const [tickets] = useState([
    {
      id: 1,
      user: "John",
      title: "System not working",
      priority: "High",
      status: "Open",
    },
    {
      id: 2,
      user: "Smit",
      title: "Email issue",
      priority: "Medium",
      status: "In Progress",
    },
  ]);

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    progress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  const priorityStyle = {
    High: "bg-red-100 text-red-600",
    Medium: "bg-yellow-100 text-yellow-600",
    Low: "bg-green-100 text-green-600",
  };

  const statusStyle = {
    Open: "bg-red-100 text-red-600",
    "In Progress": "bg-yellow-100 text-yellow-600",
    Resolved: "bg-green-100 text-green-600",
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <Sidebar />

      <div className="lg:ml-64 pt-20 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">IT Help Desk</h1>

          <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition">
            <Plus size={18} /> Create Ticket
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Tickets", value: stats.total },
            { label: "Open Tickets", value: stats.open },
            { label: "In Progress", value: stats.progress },
            { label: "Resolved", value: stats.resolved },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl shadow-md border border-slate-200 hover:shadow-lg transition"
            >
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="text-2xl font-bold text-slate-800 mt-2">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-x-auto">
          <div className="p-4 border-b font-semibold text-slate-700">
            Recent Tickets
          </div>

          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Issue</th>
                <th className="p-3 text-left">Priority</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t.id}
                  className="border-t hover:bg-slate-50 transition"
                >
                  <td className="p-3 font-medium">#{t.id}</td>
                  <td className="p-3">{t.user}</td>
                  <td className="p-3">{t.title}</td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityStyle[t.priority]}`}
                    >
                      {t.priority}
                    </span>
                  </td>

                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle[t.status]}`}
                    >
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
