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
  Monitor,
  Server,
  Wifi,
  Cpu,
  Zap,
  FlaskConical,
  ClipboardList,
} from "lucide-react";

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

const defaultUserMenu = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Profile", icon: Users },
  { name: "Users", icon: Users },
  { name: "Departments", icon: Building2 },
  { name: "Roles", icon: UserCog },
  { name: "Attendance", icon: Calendar },
  { name: "Apply Leave", icon: Calendar },
];

const defaultAdminMenu = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Profile", icon: Users },
  { name: "Users", icon: Users },
  { name: "Departments", icon: Building2 },
  { name: "Roles", icon: UserCog },
  { name: "Holidays", icon: Calendar },
  { name: "Attendance", icon: Calendar },
  { name: "Apply Leave", icon: Calendar },
];

const toSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const role = (user?.role?.name || user?.role || "USER" || "USER")
    .toUpperCase()
    .replace(" ", "_");

  const dept = (
    (typeof user?.department === "object"
      ? user?.department?.name
      : user?.department) || "ce"
  ).toLowerCase();

  const menuItems = (() => {
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
        { name: "Holidays", path: "/superadmin/holidays", icon: Calendar },
        { name: "Audit Logs", path: "/superadmin/audit", icon: History },
      ];
    }

    if (role === "ADMIN") {
      const availableMenus = adminDeptMenus[dept] || defaultAdminMenu;
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
    const availableMenus = userDeptMenus[dept] || defaultUserMenu;
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
  })();

  const roleHeader = {
    SUPER_ADMIN: { title: "Super Admin", color: "#34d399" },
    ADMIN: { title: "Admin", color: "#60a5fa" },
    USER: { title: "User", color: "#f59e0b" },
  };

  const header = roleHeader[role] || { title: "Dashboard", color: "#34d399" };

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






  

