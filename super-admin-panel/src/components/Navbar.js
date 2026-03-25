"use client";

import { useAuth } from "../context/AuthContext";
import { Bell, User, Settings, LogOut, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [time, setTime] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    if (!time) return "Welcome 👋";
    const hours = time.getHours();
    if (hours < 12) return "Good Morning ☀️";
    if (hours < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-2 md:left-64 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4 md:px-6">
      <div className="p-4">
        <p className="text-sm text-slate-500">{getGreeting()}</p>
        <p className="text-lg font-semibold text-slate-800">
          {mounted && time ? time.toLocaleTimeString() : "Loading..."}
        </p>
      </div>

      {/*  Right Section */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-md">
          <Sparkles size={16} />
          <span className="hidden md:block text-sm">Quick Action</span>
        </button>

        <button className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        {/*makvana smitrajsinh  👤 Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <User size={20} />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-700 leading-tight">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {(user?.role?.name || user?.role || "")
                  .toLowerCase()
                  .replace("_", " ")}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50">
                <User size={16} /> Profile Settings
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50">
                <Settings size={16} /> System Config
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
