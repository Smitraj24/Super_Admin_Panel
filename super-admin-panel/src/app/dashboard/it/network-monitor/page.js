"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Server, Router, Wifi, AlertTriangle, Activity } from "lucide-react";

export default function NetworkPage() {
  const [devices] = useState([
    {
      id: 1,
      name: "Core Router",
      ip: "192.168.1.1",
      type: "Router",
      status: "Online",
      location: "Data Center",
      lastCheck: "2 mins ago",
    },
    {
      id: 2,
      name: "Switch-01",
      ip: "192.168.1.10",
      type: "Switch",
      status: "Online",
      location: "Floor 1",
      lastCheck: "5 mins ago",
    },
    {
      id: 3,
      name: "Firewall",
      ip: "192.168.1.254",
      type: "Security",
      status: "Offline",
      location: "Server Room",
      lastCheck: "10 mins ago",
    },
    {
      id: 4,
      name: "App Server",
      ip: "192.168.1.20",
      type: "Server",
      status: "Online",
      location: "Cloud",
      lastCheck: "1 min ago",
    },
  ]);

  const total = devices.length;
  const active = devices.filter((d) => d.status === "Online").length;
  const down = devices.filter((d) => d.status === "Offline").length;
  const alerts = down;

  return (
    <main className="min-h-screen bg-gray-50 ">
      <Sidebar />
      <Navbar />

      <div className="md:ml-64 pt-20 p-8 ">
        <div className="mb-6">
          <p className="text-slate-500">Overview</p>
          <h1 className="text-3xl font-bold text-slate-900">
            Network Management
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card title="Total Devices" value={total} icon={Server} />
          <Card title="Active Devices" value={active} icon={Wifi} />
          <Card title="Down Devices" value={down} icon={Router} />
          <Card title="Alerts" value={alerts} icon={AlertTriangle} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-indigo-600" />
            Network Devices
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-slate-500 text-sm">
                  <th className="py-3">Name</th>
                  <th>IP Address</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Last Check</th>
                </tr>
              </thead>

              <tbody>
                {devices.map((device) => (
                  <tr
                    key={device.id}
                    className="border-b hover:bg-slate-50 transition"
                  >
                    <td className="py-3 font-medium text-slate-800">
                      {device.name}
                    </td>
                    <td className="text-slate-600">{device.ip}</td>
                    <td className="text-slate-600">{device.type}</td>

                    <td>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          device.status === "Online"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {device.status}
                      </span>
                    </td>

                    <td className="text-slate-600">{device.location}</td>
                    <td className="text-slate-400 text-sm">
                      {device.lastCheck}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ title, value, icon: Icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition">
      <div>
        <p className="text-slate-500 text-sm">{title}</p>
        <h2 className="text-2xl font-bold text-slate-900">{value}</h2>
      </div>

      <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
        <Icon size={22} />
      </div>
    </div>
  );
}
