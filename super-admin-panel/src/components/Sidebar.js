"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";
import { useState, useMemo, useCallback } from "react";
import {
  LayoutDashboard, Users, Building2, ShieldCheck, History,
  LogOut, UserCog, Menu, X, Calendar, Monitor, Server,
  Wifi, Cpu, Zap, ClipboardList, User, Shield, Crown,
  MessageCircle, ChevronLeft, ChevronRight,
} from "lucide-react";

const toSlug = (name) => name.toLowerCase().replace(/\s+/g, "-");

const ROLE_META = {
  SUPER_ADMIN: { title: "Super Admin", icon: Crown, gradient: "from-[#7c6fff] to-[#4f46e5]" },
  ADMIN: { title: "Admin", icon: Shield, gradient: "from-[#00d4aa] to-[#0d9488]" },
  USER: { title: "User", icon: User, gradient: "from-[#60a5fa] to-[#7c6fff]" },
};

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

const BASE_ITEMS = () => [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Profile", icon: User },
  { name: "Users", icon: Users },
  { name: "Departments", icon: Building2 },
  { name: "Roles", icon: UserCog },
  { name: "Chats", icon: MessageCircle },
];

const DEPT_EXTRA = {
  user: {
    it: [{ name: "Help Desk", icon: Monitor }, { name: "Network Monitor", icon: Wifi }],
    ce: [{ name: "Projects", icon: Cpu }, { name: "Reports", icon: ClipboardList }],
    sales: [{ name: "Leads", icon: Zap }, { name: "Targets", icon: ClipboardList }, { name: "Reports", icon: ClipboardList }],
    hr: [],
  },
  admin: {
    it: [{ name: "Holidays", icon: Calendar }, { name: "Help Desk", icon: Monitor }, { name: "Asset Management", icon: Server }, { name: "Network Monitor", icon: Wifi }],
    ce: [{ name: "Projects", icon: Cpu }, { name: "Reports", icon: ClipboardList }, { name: "Holidays", icon: Calendar }],
    sales: [{ name: "Holidays", icon: Calendar }, { name: "Leads", icon: Zap }, { name: "Targets", icon: ClipboardList }, { name: "Reports", icon: ClipboardList }],
    hr: [{ name: "Admins", icon: ShieldCheck }, { name: "Holidays", icon: Calendar }],
  },
};

const TAIL_ITEMS = [
  { name: "Attendance", icon: Calendar },
  { name: "Apply Leave", icon: ClipboardList },
];

const buildDeptMenu = (roleKey, dept, prefix, permissions) => {
  const extra = DEPT_EXTRA[roleKey]?.[dept] ?? [];
  const all = [...BASE_ITEMS(), ...extra, ...TAIL_ITEMS];
  const items = permissions.length ? all.filter(({ name }) => permissions.includes(name)) : all;
  return items.map(({ name, icon }) => ({
    name, icon,
    path: name === "Dashboard" ? `/${prefix}/${dept}` : `/${prefix}/${dept}/${toSlug(name)}`,
  }));
};

export default function Sidebar() {
  const { user, logout, loading } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { role, dept } = useMemo(() => {
    const role = (user?.role?.name || user?.role || "USER").toUpperCase().replace(" ", "_");
    const dept = ((typeof user?.department === "object" ? user?.department?.name : user?.department) || "ce").toLowerCase();
    return { role, dept };
  }, [user?.role, user?.department]);

  const menuItems = useMemo(() => {
    if (role === "SUPER_ADMIN") return SUPER_ADMIN_MENU;
    const permissions = user?.sidebarPermissions || [];
    return role === "ADMIN"
      ? buildDeptMenu("admin", dept, "admin", permissions)
      : buildDeptMenu("user", dept, "dashboard", permissions);
  }, [role, dept, user?.sidebarPermissions]);

  const groupedItems = useMemo(() => {
    const groups = [
      { id: "core", title: "General", items: [] },
      { id: "management", title: "Management", items: [] },
      { id: "operations", title: "Operations", items: [] },
      { id: "system", title: "System", items: [] },
    ];

    menuItems.forEach((item) => {
      const name = item.name.toLowerCase();
      if (name.includes("dashboard") || name === "profile" || name === "chats" || name === "help desk") {
        groups[0].items.push(item);
      } else if (name === "admins" || name === "users" || name === "departments" || name === "roles" || name.includes("asset")) {
        groups[1].items.push(item);
      } else if (name.includes("audit")) {
        groups[3].items.push(item);
      } else {
        groups[2].items.push(item);
      }
    });

    return groups.filter(g => g.items.length > 0);
  }, [menuItems]);

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
        className="fixed top-3.5 left-3 z-40 lg:hidden p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all dark"
        style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-md)" }}
      >
        <Menu size={20} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
        />
      )}

      <aside
        className={`
          dark
          fixed top-0 left-0 z-50 h-screen flex flex-col
          border-r border-[var(--border)]
          transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          ${collapsed ? "w-20" : "w-64"}
        `}
        style={{
          background: "#28243d",
          backdropFilter: "blur(24px) saturate(180%)",
          "--text-primary": "#ffffff",
          "--text-secondary": "#e2e8f0",
          "--text-muted": "#cbd5e1"
        }}
      >
        {/* Top gradient line — teal to purple */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, #7c6fff 40%, #00d4aa 80%, transparent)" }} />

        {/* Subtle ambient glow behind sidebar */}
        <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(124,111,255,0.08) 0%, transparent 70%)" }} />

        {/* Header / Logo */}
        <div className={`relative flex items-center gap-3 px-4 py-5 border-b border-[var(--border)] ${collapsed ? "justify-center" : "justify-start"}`}>
          {!collapsed && (
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4.5 right-3 lg:hidden p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          )}

          <div className="relative flex items-center justify-center">
            {/* Pulsing glow ring behind the icon */}
            <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${meta.gradient} opacity-40 blur-[4px] animate-pulse`} />
            <div className={`relative w-9.5 h-9.5 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center flex-shrink-0 shadow-lg border border-white/10 transition-transform duration-300 hover:scale-105 hover:rotate-3`}>
              <RoleIcon size={18} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
            </div>
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1 select-none animate-fade-in">
              <div className="flex items-center gap-1.5">
                <span className="px-2 xpy-1 rounded-md text-[11px] font-extrabold tracking-wider bg-[#7c6fff]/10 border border-[#7c6fff]/20 text-[#a5b4fc] uppercase">
                  {user.name}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-0.5 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {dept || "core"} / {meta.title}
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-1 py-3 space-y-4 overflow-y-auto sidebar-scrollbar no-scrollbar">
          {groupedItems.map((group, groupIdx) => (
            <div key={group.id} className="space-y-0.5">
              {/* Category Header */}
              {!collapsed ? (
                <div className="sidebar-category-header select-none animate-fade-in">
                  <span>{group.title}</span>
                  <div className="sidebar-category-line" />
                </div>
              ) : (
                groupIdx > 0 && <div className="sidebar-category-collapsed-separator" />
              )}

              {/* Group Items */}
              <div className="space-y-0.5">
                {group.items.map(({ name, path, icon: Icon }) => {
                  const active = pathname === path;
                  return (
                    <Link
                      key={path}
                      href={path}
                      title={collapsed ? name : undefined}
                      onClick={() => setOpen(false)}
                      className={`
                        flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all group relative
                        ${collapsed ? "justify-center mx-1.5" : "sidebar-hover-shift mx-2.5"}
                        ${active
                          ? "sidebar-item-active"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/50"
                        }
                      `}
                    >
                      <Icon
                        size={16}
                        className={`flex-shrink-0 transition-colors ${active ? "text-[#a5b4fc]" : "text-[var(--text-muted)] group-hover:text-[var(--text-primary)]"}`}
                      />

                      {!collapsed && (
                        <>
                          <span className="text-[13px] font-medium truncate">{name}</span>
                          {active && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7c6fff] animate-pulse-glow" />
                          )}
                        </>
                      )}

                      {/* Collapsed tooltip */}
                      {collapsed && (
                        <span className="absolute left-full ml-3 px-3 py-1.5 text-[var(--text-primary)] text-xs rounded-xl
                          opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150
                          whitespace-nowrap z-50 border border-[var(--border-strong)] animate-scale-in sidebar-tooltip"
                        >
                          {name}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-2.5 border-t border-[var(--border)] space-y-1">
          {/* User profile block */}
          <div className="group relative">
            <div className={`p-2 rounded-xl transition-all duration-300 border border-transparent
              ${collapsed ? "flex justify-center cursor-pointer" : "bg-[var(--bg-elevated)]/40 hover:bg-[var(--bg-elevated)]/75 border-[var(--border)]/50 shadow-sm"}`}
              onClick={() => router.push(role === "SUPER_ADMIN" ? "/superadmin/profile" : role === "ADMIN" ? `/admin/${dept}/profile` : `/dashboard/${dept}/profile`)}
            >
              <div className={`flex items-center gap-2.5 ${collapsed ? "justify-center" : ""}`}>
                <div className={`relative shrink-0 online-indicator`}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm transition-transform duration-200 group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${role === "SUPER_ADMIN" ? "#7c6fff, #4f46e5" : role === "ADMIN" ? "#00d4aa, #0d9488" : "#60a5fa, #7c6fff"})` }}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>

                {!collapsed && (
                  <div className="min-w-0 flex-1 select-none animate-fade-in">
                    <p className="text-[12.5px] font-semibold text-[var(--text-primary)] truncate leading-tight">
                      {user?.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* {collapsed && (
              <span className="absolute left-full bottom-2 ml-3 p-3 rounded-2xl sidebar-tooltip
                opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200
                whitespace-nowrap z-50 border border-[var(--border-strong)] animate-scale-in flex flex-col gap-1.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${role === "SUPER_ADMIN" ? "#7c6fff, #4f46e5" : role === "ADMIN" ? "#00d4aa, #0d9488" : "#60a5fa, #7c6fff"})` }}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-[var(--text-primary)]">{user?.name}</p>
                    <p className="text-[9px] text-emerald-400 font-medium tracking-wider uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </p>
                  </div>
                </div>
                <div className="h-px bg-[var(--border)] my-0.5" />
                <p className="text-[10px] text-[var(--text-secondary)]">Role: <span className="font-semibold text-[#a5b4fc]">{meta.title}</span></p>
                <p className="text-[10px] text-[var(--text-secondary)]">Dept: <span className="font-semibold capitalize text-[#00d4aa]">{dept}</span></p>
                <p className="text-[9px] text-[var(--text-muted)]">{user?.email}</p>
              </span>
            )} */}
          </div>

          <button
            onClick={handleLogout}
            title={collapsed ? "Sign Out" : undefined}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
              text-[var(--text-muted)] hover:text-rose-400 hover:bg-rose-500/8 transition-all group relative
              ${collapsed ? "justify-center" : ""}`}
          >
            <LogOut size={16} className="flex-shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" />
            {!collapsed && <span className="text-[13px] font-medium">Sign Out</span>}
            {/* {collapsed && (
              <span className="absolute left-full ml-3 px-3 py-1.5 text-[var(--text-primary)] text-xs rounded-xl
                opacity-0 group-hover:opacity-100 pointer-events-none transition-all sidebar-tooltip
                whitespace-nowrap z-50 border border-[var(--border-strong)] animate-scale-in"
              >
                Sign Out
              </span>
            )} */}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`w-full px-3 py-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)]
              hover:bg-[var(--bg-elevated)] transition-all duration-200 flex items-center gap-2 group/collapse
              ${collapsed ? "justify-center" : "justify-between"}`}
          >
            {!collapsed && <span className="text-[12px] font-medium">Collapse</span>}
            {collapsed ? (
              <ChevronRight size={15} className="transition-transform duration-300 group-hover/collapse:translate-x-0.5" />
            ) : (
              <ChevronLeft size={15} className="transition-transform duration-300 group-hover/collapse:-translate-x-0.5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}



