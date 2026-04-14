"use client";

import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/Sidebar";
import { ShieldCheck } from "lucide-react";
import { ProtectedDashboardRoute } from "@/components/ProtectedDashboardRoute";
import { ROLES } from "@/utils/constants";

export default function AuditPage() {
  const logs = [
    { id: 1, action: "Created User", admin: "SuperAdmin", date: "2026-03-10" },
    {
      id: 2,
      action: "Deleted Department",
      admin: "SuperAdmin",
      date: "2026-03-09",
    },
  ];

  return (
    <ProtectedDashboardRoute requiredRole={ROLES.SUPER_ADMIN}>
      <div className="min-h-screen bg-[#F8FAFC]">
        <Sidebar />
        <Navbar />

        <main className="md:pl-64 pt-16">
          <div className="p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                  <ShieldCheck className="text-indigo-600" size={30} />
                  Audit Logs
                </h1>
                <p className="mt-2 text-slate-500">
                  Track all important system activities
                </p>
              </div>

              <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-indigo-600">
                {logs.length} Logs
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-5 text-xs text-slate-500 font-bold uppercase">
                      ACTION
                    </th>
                    <th className="p-5 text-xs text-slate-500 font-bold uppercase">
                      ADMIN
                    </th>
                    <th className="p-5 text-xs text-slate-500 font-bold uppercase">
                      DATE
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition">
                      <td className="p-5 font-semibold text-slate-700">
                        {log.action}
                      </td>

                      <td className="p-5 text-slate-600">{log.admin}</td>

                      <td className="p-5 text-slate-500">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedDashboardRoute>
  );
}
