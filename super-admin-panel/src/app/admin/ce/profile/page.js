"use client";

import { useAuth } from "../../../../context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { User, Mail, Shield, Settings } from "lucide-react";

export default function AdminProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Navbar />

      <main className="md:pl-64 pt-16 min-h-100vh flex items-center justify-center">
        <div className="w-full max-w-2xl p-4 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              My Profile
            </h1>

            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition w-full sm:w-auto justify-center">
              <Settings size={18} />
              Edit Profile
            </button>
          </div>

          <div className=" bg-white p-4 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-6 overflow-x-auto ">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <User className="text-indigo-600" size={40} />
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  {user?.name}
                </h2>
                <p className="text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-auto">
            <div className="p-6 border-b border-slate-200 ">
              <h3 className="text-lg font-semibold text-slate-900">
                My Information
              </h3>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="text-blue-600" size={20} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Full Name</p>
                  <p className="font-semibold text-slate-900">{user?.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-green-600" size={20} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Email Address</p>
                  <p className="font-semibold text-slate-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="text-purple-600" size={20} />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Role</p>
                  <p className="font-semibold text-slate-900">
                    {user?.role?.name || user?.role || "Super Admin"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
