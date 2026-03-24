"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Server } from "lucide-react";

export default function AssetManagementPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Navbar />

      <div className="md:pl-64 pt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <Server size={24} className="text-blue-600" />
            Asset Management
          </h1>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
            <p className="text-slate-600 text-center py-12">
              Asset management system coming soon...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
