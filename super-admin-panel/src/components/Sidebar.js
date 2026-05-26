"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
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
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Constants

const toSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

const ROLE_META = {
  SUPER_ADMIN: {
    title: "Super Admin",
    icon: Crown,
    color: "#7c3aed",
    secondary: "#5b21b6",
  },
  ADMIN: {
    title: "Admin",
    icon: Shield,
    color: "#10b981",
    secondary: "#059669",
  },
  USER: { title: "User", icon: User, color: "#3b82f6", secondary: "#2563eb" },
};

// Menu definitions — shared icon references, no duplication
const SUPER_ADMIN_MENU = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/superadmin/dashboard" },
  { name: "Profile", icon: User, path: "/superadmin/profile" },
  { name: "Admins", icon: ShieldCheck, path: "/superadmin/admins" },
  { name: "Users", icon: Users, path: "/superadmin/users" },
  { name: "Departments", icon: Building2, path: "/superadmin/departments" },
  { name: "Roles", icon: UserCog, path: "/superadmin/roles" },
  { name: "Chats", icon: MessageCircle, path: "/superadmin/chats" },
  { name: "Attendance", icon: Calendar, path: "/superadmin/attendance" },
  { name: "Leaves", icon: ClipboardList, path: "/superadmin/leaves" },
  { name: "Holidays", icon: Calendar, path: "/superadmin/holidays" },
  { name: "Audit Logs", icon: History, path: "/superadmin/audit" },
];

// Dept-specific items appended after the shared base
const BASE_ITEMS = (dept, prefix) => [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Profile", icon: User },
  { name: "Users", icon: Users },
  { name: "Departments", icon: Building2 },
  { name: "Roles", icon: UserCog },
  { name: "Chats", icon: MessageCircle },
];

const DEPT_EXTRA = {
  user: {
    it: [
      { name: "Help Desk", icon: Monitor },
      { name: "Network Monitor", icon: Wifi },
    ],
    ce: [
      { name: "Projects", icon: Cpu },
      { name: "Reports", icon: ClipboardList },
    ],
    sales: [
      { name: "Leads", icon: Zap },
      { name: "Targets", icon: ClipboardList },
      { name: "Reports", icon: ClipboardList },
    ],
    hr: [],
  },
  admin: {
    it: [
      { name: "Holidays", icon: Calendar },
      { name: "Help Desk", icon: Monitor },
      { name: "Asset Management", icon: Server },
      { name: "Network Monitor", icon: Wifi },
    ],
    ce: [
      { name: "Projects", icon: Cpu },
      { name: "Reports", icon: ClipboardList },
      { name: "Holidays", icon: Calendar },
    ],
    sales: [
      { name: "Holidays", icon: Calendar },
      { name: "Leads", icon: Zap },
      { name: "Targets", icon: ClipboardList },
      { name: "Reports", icon: ClipboardList },
    ],
    hr: [
      { name: "Admins", icon: ShieldCheck },
      { name: "Holidays", icon: Calendar },
    ],
  },
};

const TAIL_ITEMS = [
  { name: "Attendance", icon: Calendar },
  { name: "Apply Leave", icon: ClipboardList },
];

const buildDeptMenu = (roleKey, dept, prefix, permissions) => {
  const extra = DEPT_EXTRA[roleKey]?.[dept] ?? [];
  const all = [...BASE_ITEMS(dept, prefix), ...extra, ...TAIL_ITEMS];
  const items = permissions.length
    ? all.filter(({ name }) => permissions.includes(name))
    : all;

  return items.map(({ name, icon }) => ({
    name,
    icon,
    path:
      name === "Dashboard"
        ? `/${prefix}/${dept}`
        : `/${prefix}/${dept}/${toSlug(name)}`,
  }));
};

// Sidebar

export default function Sidebar() {
  const { user, logout, loading } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { role, dept } = useMemo(() => {
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

  const menuItems = useMemo(() => {
    if (role === "SUPER_ADMIN") return SUPER_ADMIN_MENU;
    const permissions = user?.sidebarPermissions || [];
    return role === "ADMIN"
      ? buildDeptMenu("admin", dept, "admin", permissions)
      : buildDeptMenu("user", dept, "dashboard", permissions);
  }, [role, dept, user?.sidebarPermissions]);

  const meta = ROLE_META[role] ?? ROLE_META.USER;

  const handleLogout = useCallback(() => {
    logout();
    setOpen(false);
    router.push("/login");
  }, [logout, router]);

  if (loading || !user) return null;

  const RoleIcon = meta.icon;

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-2 z-40 lg:hidden p-2 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-700 hover:bg-slate-800 transition  "
      >
        <Menu size={22} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
        fixed top-0 left-0 z-50 h-screen flex flex-col
        bg-slate-900 text-slate-300 border-r border-slate-800/50 shadow-2xl
        transform transition-all duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        ${collapsed ? "w-20" : "w-64"}
      `}
      >
        {/* Header */}
        <div
          className={`relative flex items-center gap-3 p-5 border-b border-slate-800/50 ${collapsed ? "justify-center" : ""}`}
        >
          {!collapsed && (
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X size={18} />
            </button>
          )}

          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <RoleIcon size={22} className="text-white" />
          </div>

          {!collapsed && (
            <div className="min-w-0 pr-8">
              <h2 className="text-base font-bold text-white leading-tight truncate">
                {meta.title}
              </h2>
              <p className="text-[11px] text-slate-400 uppercase tracking-wider">
                {dept}
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-scroll no-scrollbar">
          {menuItems.map(({ name, path, icon: Icon }) => {
            const active = pathname === path;
            return (
              <Link
                key={path}
                href={path}
                title={collapsed ? name : undefined}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${collapsed ? "justify-center" : ""}
                  ${
                    active
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }
                `}
              >
                <Icon size={19} className="flex-shrink-0" />

                {!collapsed && (
                  <>
                    <span className="text-sm font-medium truncate">{name}</span>
                    {active && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                    )}
                  </>
                )}

                {/* Collapsed tooltip */}
                {collapsed && (
                  <span
                    className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                    whitespace-nowrap z-50 shadow-xl border border-slate-700"
                  >
                    {name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800/50 space-y-1.5">
          <button
            onClick={handleLogout}
            title={collapsed ? "Logout" : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-red-400 hover:text-white hover:bg-red-500/20 transition-all group relative
              ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={19} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
            {collapsed && (
              <span
                className="absolute left-full ml-3 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg
                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                whitespace-nowrap z-50 shadow-xl border border-slate-700"
              >
                Logout
              </span>
            )}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white
              shadow transition-all duration-200 flex items-center gap-2
              ${collapsed ? "justify-center" : "justify-center"}`}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span className="text-sm font-medium">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
