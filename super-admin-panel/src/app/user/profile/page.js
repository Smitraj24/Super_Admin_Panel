"use client";

import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { User, Mail, Shield, Building2, Settings } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Navbar />

      <main className="md:pl-64 pt-16">
        <div className="p-4 sm:p-6 lg:p-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <User className="text-indigo-600 shrink-0" size={24} />
                <span>My Profile</span>
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                View your profile information
              </p>
            </div>

           
            <button className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition text-sm font-medium w-full sm:w-auto shrink-0">
              <Settings size={16} />
              Edit Profile
            </button>
          </div>

         
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5 ">
              <div className="w-16 h-16  bg-indigo-100 rounded-xl flex items-center justify-center  mx-auto sm:mx-0">
                <User className="text-indigo-600" size={32} />
              </div>

              <div className="text-center sm:text-left min-w-0">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
                  {user?.name}
                </h2>
                <p className="text-slate-500 text-sm truncate">{user?.email}</p>
              </div>
            </div>
          </div>

         
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              Profile Information
            </h3>

    
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <User className="text-blue-600" size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">Full Name</p>
                <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  {user?.name}
                </p>
              </div>
            </div>

          
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="text-green-600" size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">
                  Email Address
                </p>
                <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  {user?.email}
                </p>
              </div>
            </div>


            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                <Shield className="text-purple-600" size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">Role</p>
                <p className="font-semibold text-slate-900 text-sm sm:text-base capitalize truncate">
                  {user?.role?.name || user?.role || "User"}
                </p>
              </div>
            </div>

          
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="text-orange-600" size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">Department</p>
                <p className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                  {user?.department?.name || "Not Assigned"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
