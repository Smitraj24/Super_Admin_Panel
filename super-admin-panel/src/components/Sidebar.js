"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  ShieldCheck,
  History,
  LogOut,
  UserCog,
  Menu,
  X,
  Calendar,
} from "lucide-react";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const role = (user?.role?.name || user?.role || "USER")
    .toUpperCase()
    .replace(" ", "_");

  const menus = {
    SUPER_ADMIN: [
      {
        name: "Dashboard",
        path: "/superadmin/dashboard",
        icon: LayoutDashboard,
      },
      { name: "Profile", path: "/superadmin/profile", icon: Users },
      { name: "Admins", path: "/superadmin/admins", icon: ShieldCheck },
      { name: "Users", path: "/superadmin/users", icon: Users },
      { name: "Departments", path: "/superadmin/departments", icon: Building2 },
      { name: "Roles", path: "/superadmin/roles", icon: UserCog },
      { name: "Holidays", path: "/superadmin/holidays", icon: Calendar },
      { name: "Audit Logs", path: "/superadmin/audit", icon: History },
    ],
    ADMIN: [
      { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Profile", path: "/admin/profile", icon: Users },
      { name: "Users", path: "/admin/users", icon: Users },
      { name: "Departments", path: "/admin/departments", icon: Building2 },
      { name: "Roles", path: "/admin/roles", icon: UserCog },
       { name: "Holidays", path: "/admin/holidays", icon: Calendar },
    ],
    USER: [
      { name: "Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
      { name: "Profile", path: "/user/profile", icon: Users },
      { name: "Users", path: "/user/users", icon: Users },
      { name: "Departments", path: "/user/departments", icon: Building2 },
      { name: "Roles", path: "/user/roles", icon: UserCog },
    ],
  };

  const menuItems = menus[role] || [];

  const roleHeader = {
    SUPER_ADMIN: {
      title: "Super Admin",
      color: "#34d399",
    },
    ADMIN: {
      title: "Admin",
      color: "#60a5fa",
    },
    USER: {
      title: "User",
      color: "#f59e0b",
    },
  };

  const header = roleHeader[role] || { title: "Dashboard", color: "#34d399" };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        <Menu size={24} />
      </button>

      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300
    transform transition-transform duration-300
    ${open ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0`}
      >
        <div className="flex items-center gap-3 p-6 mb-3">
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 text-slate-400 hover:text-white"
          >
            <X size={24} />
          </button>
          <svg
            width="40"
            height="40"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="5" y="5" width="35" height="20" fill={header.color} />
            <rect x="60" y="5" width="35" height="20" fill="#10b981" />
            <rect x="5" y="40" width="35" height="20" fill="#10b981" />
            <rect x="60" y="40" width="35" height="20" fill={header.color} />
            <rect x="30" y="65" width="40" height="25" fill="#059669" />
          </svg>

          <h2 className="text-2xl font-bold text-white">{header.title}</h2>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map(({ name, path, icon: Icon }) => {
            const active = pathname === path;

            return (
              <Link
                key={path}
                href={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => {
              logout();
              setOpen(false);
              router.push("/login");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 hover:text-rose-400 transition"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
