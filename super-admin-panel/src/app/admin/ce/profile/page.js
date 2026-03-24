"use client";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Building2 } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Navbar />

      <div className="md:pl-64 pt-16">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
            <User size={24} className="text-orange-600" />
            My Profile
          </h1>

          <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 max-w-2xl">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <p className="text-lg text-slate-900 mt-2">{user?.name}</p>
              </div>

              <div className="flex items-center gap-2">
                <Mail size={18} className="text-slate-400" />
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <p className="text-lg text-slate-900">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-slate-400" />
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Department
                  </label>
                  <p className="text-lg text-slate-900">
                    {typeof user?.department === "object"
                      ? user?.department?.name
                      : user?.department}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
