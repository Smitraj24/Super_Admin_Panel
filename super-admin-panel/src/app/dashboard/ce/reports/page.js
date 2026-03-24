"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const reports = [
  {
    projectName: "Hospital Management System",
    client: "Apollo Hospital",
    type: "Web Application",
    techStack: "React, Node.js, MongoDB",
    progress: 85,
    status: "Ongoing",
    teamLead: "Rahul Patel",
    deadline: "2026-05-20",
  },
  {
    projectName: "E-Commerce Website",
    client: "Reliance Retail",
    type: "Website",
    techStack: "Next.js, Tailwind CSS",
    progress: 100,
    status: "Completed",
    teamLead: "Priya Shah",
    deadline: "2025-12-10",
  },
  {
    projectName: "School ERP System",
    client: "Delhi Public School",
    type: "Web Application",
    techStack: "MERN Stack",
    progress: 60,
    status: "Ongoing",
    teamLead: "Amit Kumar",
    deadline: "2026-07-01",
  },
  {
    projectName: "Food Delivery App",
    client: "Startup",
    type: "Mobile + Web App",
    techStack: "React Native, Node.js",
    progress: 40,
    status: "Delayed",
    teamLead: "Neha Mehta",
    deadline: "2026-08-15",
  },
];

function getStatusColor(status) {
  if (status === "Completed") return "bg-green-100 text-green-600";
  if (status === "Ongoing") return "bg-blue-100 text-blue-600";
  return "bg-red-100 text-red-600";
}

function Reports() {
  const total = reports.length;
  const ongoing = reports.filter((r) => r.status === "Ongoing").length;
  const completed = reports.filter((r) => r.status === "Completed").length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Sidebar />
      <Navbar />

      <div className="lg:ml-64 mt-20 px-4 md:px-8 py-10">
        <section className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800">
            CE Project Reports 💻
          </h1>
          <p className="text-gray-500 mt-2">
            Monitor project progress, clients, and development status
          </p>
        </section>

        <section className="max-w-7xl mx-auto mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500 text-sm">Total Projects</h2>
            <p className="text-2xl font-bold text-blue-600">{total}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500 text-sm">Ongoing</h2>
            <p className="text-2xl font-bold text-yellow-500">{ongoing}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-gray-500 text-sm">Completed</h2>
            <p className="text-2xl font-bold text-green-600">{completed}</p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto mt-10 bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="p-4">Project</th>
                  <th className="p-4">Client</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Tech</th>
                  <th className="p-4">Team Lead</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Deadline</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((r, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50 transition">
                    <td className="p-4 font-medium">{r.projectName}</td>
                    <td className="p-4 text-gray-500">{r.client}</td>
                    <td className="p-4">{r.type}</td>
                    <td className="p-4 text-indigo-500 text-sm">
                      {r.techStack}
                    </td>
                    <td className="p-4">{r.teamLead}</td>

                    <td className="p-4 w-40">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${r.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {r.progress}%
                      </span>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${getStatusColor(
                          r.status,
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="p-4 text-sm text-gray-500">{r.deadline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Reports;
