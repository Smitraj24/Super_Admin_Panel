"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useState, useMemo, useCallback } from "react";
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
  Monitor,
  Server,
  Wifi,
  Cpu,
  Zap,
  ClipboardList,
  User,
  Shield,
  Crown,
} from "lucide-react";
import Attendance from "@/app/admin/ce/attendance/page";

// "Dashboard" always resolves to the base path; others append /${toSlug(name)}.

const userDeptMenus = {
  it: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Profile", icon: Users },
    { name: "Users", icon: Users },
    { name: "Departments", icon: Building2 },
    { name: "Roles", icon: UserCog },
    { name: "Help Desk", icon: Monitor },
    { name: "Network Monitor", icon: Wifi },
    { name: "Attendance", icon: Calendar },
    { name: "Apply Leave", icon: Calendar },
  ],
  ce: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Profile", icon: Users },
    { name: "Users", icon: Users },
    { name: "Departments", icon: Building2 },
    { name: "Roles", icon: UserCog },
    { name: "Projects", icon: Cpu },
    { name: "Reports", icon: ClipboardList },
    { name: "Attendance", icon: Calendar },
    { name: "Apply Leave", icon: Calendar },
  ],
  sales: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Profile", icon: Users },
    { name: "Users", icon: Users },
    { name: "Departments", icon: Building2 },
    { name: "Roles", icon: UserCog },
    { name: "Leads", icon: Zap },
    { name: "Targets", icon: ClipboardList },
    { name: "Reports", icon: ClipboardList },
    { name: "Attendance", icon: Calendar },
    { name: "Apply Leave", icon: Calendar },
  ],
};

const adminDeptMenus = {
  it: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Profile", icon: Users },
    { name: "Users", icon: Users },
    { name: "Departments", icon: Building2 },
    { name: "Roles", icon: UserCog },
    { name: "Holidays", icon: Calendar },
    { name: "Help Desk", icon: Monitor },
    { name: "Asset Management", icon: Server },
    { name: "Network Monitor", icon: Wifi },
    { name: "Attendance", icon: Calendar },
    { name: "Apply Leave", icon: Calendar },
  ],
  ce: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Profile", icon: Users },
    { name: "Users", icon: Users },
    { name: "Departments", icon: Building2 },
    { name: "Roles", icon: UserCog },
    { name: "Projects", icon: Cpu },
    { name: "Reports", icon: ClipboardList },
    { name: "Holidays", icon: Calendar },
    { name: "Attendance", icon: Calendar },
    { name: "Apply Leave", icon: Calendar },
  ],
  sales: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Profile", icon: Users },
    { name: "Users", icon: Users },
    { name: "Departments", icon: Building2 },
    { name: "Roles", icon: UserCog },
    { name: "Holidays", icon: Calendar },
    { name: "Leads", icon: Zap },
    { name: "Targets", icon: ClipboardList },
    { name: "Reports", icon: ClipboardList },
    { name: "Attendance", icon: Calendar },
    { name: "Apply Leave", icon: Calendar },
  ],
  hr: [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Profile", icon: Users },
    { name: "Admins", icon: ShieldCheck },
    { name: "Users", icon: Users },
    { name: "Departments", icon: Building2 },
    { name: "Roles", icon: UserCog },
    { name: "Holidays", icon: Calendar },
    { name: "Attendance", icon: Calendar },
    { name: "Apply Leave", icon: Calendar },
  ],
};

const toSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

export default function Sidebar() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Memoize role and department to prevent recalculation
  const { role, dept } = useMemo(() => {
    if (!user) return { role: "USER", dept: "ce" };

    const role = (user?.role?.name || user?.role || "USER")
      .toUpperCase()
      .replace(" ", "_");

    const dept = (
      (typeof user?.department === "object"
        ? user?.department?.name
        : user?.department) || "ce"
    ).toLowerCase();

    return { role, dept };
  }, [user?.role, user?.department]);

  // Memoize menu items to prevent recalculation on every render
  const menuItems = useMemo(() => {
    if (role === "SUPER_ADMIN") {
      return [
        {
          name: "Dashboard",
          path: "/superadmin/dashboard",
          icon: LayoutDashboard,
        },
        { name: "Profile", path: "/superadmin/profile", icon: Users },
        { name: "Admins", path: "/superadmin/admins", icon: ShieldCheck },
        { name: "Users", path: "/superadmin/users", icon: Users },
        {
          name: "Departments",
          path: "/superadmin/departments",
          icon: Building2,
        },
        { name: "Roles", path: "/superadmin/roles", icon: UserCog },
        { name: "Attendance", path: "/superadmin/attendance", icon: Calendar },
        { name: "Leaves", path: "/superadmin/leaves", icon: ClipboardList },
        { name: "Holidays", path: "/superadmin/holidays", icon: Calendar },
        { name: "Audit Logs", path: "/superadmin/audit", icon: History },
      ];
    }

    if (role === "ADMIN") {
      const availableMenus = adminDeptMenus[dept];

      // If department doesn't have specific menus, return empty array
      if (!availableMenus) {
        return [];
      }

      const userPermissions = user?.sidebarPermissions || [];

      // Display menu items, filtering by permissions if they exist
      const itemsToDisplay =
        userPermissions.length > 0
          ? availableMenus.filter(({ name }) => userPermissions.includes(name))
          : availableMenus;

      return itemsToDisplay.map(({ name, icon }) => ({
        name,
        icon,
        path:
          name === "Dashboard"
            ? `/admin/${dept}`
            : `/admin/${dept}/${toSlug(name)}`,
      }));
    }

    // USER
    const availableMenus = userDeptMenus[dept];

    // If department doesn't have specific menus, return empty array
    if (!availableMenus) {
      return [];
    }

    const userPermissions = user?.sidebarPermissions || [];

    // Display menu items, filtering by permissions if they exist
    const itemsToDisplay =
      userPermissions.length > 0
        ? availableMenus.filter(({ name }) => userPermissions.includes(name))
        : availableMenus;

    return itemsToDisplay.map(({ name, icon }) => ({
      name,
      icon,
      path:
        name === "Dashboard"
          ? `/dashboard/${dept}`
          : `/dashboard/${dept}/${toSlug(name)}`,
    }));
  }, [role, dept, user?.sidebarPermissions]);

  // Memoize header configuration
  const header = useMemo(() => {
    const roleHeader = {
      SUPER_ADMIN: {
        title: "Super Admin",
        color: "#18171cad",
        secondaryColor: "#18171cad",
      },
      ADMIN: {
        title: "Admin",
        color: "#2efa65a9",
        secondaryColor: "#059669",
      },
      USER: {
        title: "User",
        color: "#4f46e5",
        secondaryColor: "#4338ca",
      },
    };

    return (
      roleHeader[role] || {
        title: "Dashboard",
        color: "#4f46e5",
        secondaryColor: "#4338ca",
      }
    );
  }, [role]);

  // Memoize logout handler
  const handleLogout = useCallback(() => {
    logout();
    setOpen(false);
    router.push("/login");
  }, [logout, router]);

  // Show nothing while loading
  if (loading || !user) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-0 z-50 md:hidden p-1.5 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        <Menu size={20} />
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

          {/* Dynamic Icon based on role */}
          <div
            className="flex items-center justify-center w-10 h-10 rounded-lg"
            style={{ backgroundColor: header.color }}
          >
            {role === "SUPER_ADMIN" && (
              <Crown size={24} className="text-white mt-[-10px]" />
            )}
            {role === "ADMIN" && <Shield size={24} className="text-white" />}
            {role === "USER" && <User size={24} className="text-white" />}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white leading-tight">
              {header.title}
            </h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              {dept}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {menuItems.map(({ name, path, icon: Icon }) => (
            <Link
              key={path}
              href={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                pathname === path
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              {name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
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
