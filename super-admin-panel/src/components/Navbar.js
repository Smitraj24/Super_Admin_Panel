"use client";

import { useAuth } from "../context/AuthContext";
import {
  Bell, User, Settings, LogOut, X, Check, Clock,
  AlertCircle, Search, Sun, Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import { useTheme } from "next-themes";
import {
  getNotificationsApi, markAsReadApi, markAllAsReadApi, deleteNotificationApi,
} from "@/services/notificationApi";
import { cachedFetch, invalidateCache } from "@/lib/cache";
import { useSidebar } from "@/context/SidebarContext";

const ROLE_MAP = { SUPER_ADMIN: "superadmin", ADMIN: "admin", USER: "user" };
const DEPT_MAP = { CE: "ce", IT: "it", SALES: "sales", HR: "hr" };
const ICON_MAP = {
  success: <Check size={13} className="text-emerald-400" />,
  warning: <Clock size={13} className="text-amber-400" />,
  alert:   <AlertCircle size={13} className="text-rose-400" />,
  default: <Bell size={13} className="text-[#7c6fff]" />,
};
const NOTIF_TTL = 60_000;
const NOTIF_CACHE_KEY = "notifications";

const getGreeting = (h = new Date().getHours()) =>
  h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
const getGreetingIcon = (h = new Date().getHours()) =>
  h < 12 ? "🌅" : h < 18 ? "☀️" : "🌙";
const getTimeStr = () =>
  new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
const getDateStr = () =>
  new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const getTimeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const NotificationItem = memo(({ notif, onMarkRead, onDelete }) => (
  <div className={`px-4 py-3 border-b border-[var(--border)] hover:bg-[var(--bg-elevated)] transition-colors ${!notif.read ? "bg-[#7c6fff]/5" : ""}`}>
    <div className="flex gap-3">
      <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center">
        {ICON_MAP[notif.type] ?? ICON_MAP.default}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[13px] font-semibold truncate ${!notif.read ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
            {notif.title}
          </p>
          {!notif.read && <span className="w-1.5 h-1.5 bg-[#7c6fff] rounded-full shrink-0 mt-1.5 animate-pulse" />}
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{notif.message}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-[var(--text-muted)]">{getTimeAgo(notif.createdAt)}</span>
          <div className="flex gap-2">
            {!notif.read && (
              <button onClick={() => onMarkRead(notif._id)} className="text-[11px] text-[#7c6fff] hover:text-[#a5b4fc] font-medium transition-colors">
                Mark read
              </button>
            )}
            <button onClick={() => onDelete(notif._id)} className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
));
NotificationItem.displayName = "NotificationItem";

const NavIconBtn = memo(({ onClick, children, className = "", badge }) => (
  <button
    onClick={onClick}
    className={`relative p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all duration-150 ${className}`}
  >
    {children}
    {badge > 0 && (
      <span className="absolute top-1 right-1 min-w-[15px] h-[15px] bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold px-0.5 shadow-lg">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </button>
));
NavIconBtn.displayName = "NavIconBtn";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { collapsed } = useSidebar();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const [greeting, setGreeting] = useState("");
  const [greetingIcon, setGreetingIcon] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [mounted, setMounted] = useState(false);
  const searchTimer = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  const { roleKey, rolePath, deptPath } = useMemo(() => {
    const roleKey = (user?.role?.name || user?.role || "USER").toUpperCase().replace(" ", "_");
    const deptKey = (user?.department?.name || user?.department || "CE").toUpperCase().replace(" ", "_");
    return { roleKey, rolePath: ROLE_MAP[roleKey] || "user", deptPath: DEPT_MAP[deptKey] || "ce" };
  }, [user?.role, user?.department]);

  const fetchNotifs = useCallback(async () => {
    if (!user) return;
    setLoadingNotifs(true);
    try {
      const res = await cachedFetch(NOTIF_CACHE_KEY, () => getNotificationsApi(20, 0), NOTIF_TTL);
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (e) {
      console.error("Fetch notifications:", e);
    } finally {
      setLoadingNotifs(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchNotifs();
    setDateStr(getDateStr());
    setGreeting(getGreeting());
    setGreetingIcon(getGreetingIcon());
    setTimeStr(getTimeStr());
    const tick = setInterval(() => {
      setTimeStr(getTimeStr());
      setGreeting(getGreeting());
      setGreetingIcon(getGreetingIcon());
    }, 1000);
    return () => clearInterval(tick);
  }, [user, fetchNotifs]);

  useEffect(() => {
    if (!user) return;
    const t = setInterval(fetchNotifs, 60_000);
    return () => clearInterval(t);
  }, [user, fetchNotifs]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".notif-dropdown")) setShowNotifs(false);
      if (!e.target.closest(".profile-dropdown")) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {}, 300);
  }, []);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    invalidateCache(NOTIF_CACHE_KEY);
    try { await markAsReadApi(id); } catch { fetchNotifs(); }
  }, [fetchNotifs]);

  const markAllRead = useCallback(async () => {
    const snap = { notifications, unreadCount };
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    invalidateCache(NOTIF_CACHE_KEY);
    try { await markAllAsReadApi(); } catch {
      setNotifications(snap.notifications);
      setUnreadCount(snap.unreadCount);
    }
  }, [notifications, unreadCount]);

  const deleteNotif = useCallback(async (id) => {
    const target = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (target && !target.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    invalidateCache(NOTIF_CACHE_KEY);
    try { await deleteNotificationApi(id); } catch { fetchNotifs(); }
  }, [notifications, fetchNotifs]);

  const goToProfile = useCallback(() => {
    const path = roleKey === "SUPER_ADMIN" ? `/${rolePath}/profile`
      : roleKey === "ADMIN" ? `/admin/${deptPath}/profile`
      : `/dashboard/${deptPath}/profile`;
    router.push(path);
    setShowProfile(false);
  }, [roleKey, rolePath, deptPath, router]);

  if (loading || !user) return null;

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";
  const isDark = mounted && theme !== "light";

  return (
    <header
      className={`fixed top-0 right-0 z-30 flex items-center justify-between px-4 py-2.5
        glass border-b border-[var(--border)] transition-all duration-300
        ${collapsed ? "left-20" : "left-64"}
      `}
      style={{ boxShadow: "var(--shadow-sm)" }}
    >
      {/* Greeting */}
      {!showMobileSearch && (
        <div className="shrink-0 animate-fade-in">
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] leading-tight">
            {greetingIcon} {greeting}
          </h2>
          <p className="text-[11px] text-[var(--text-muted)] hidden lg:block mt-0.5">
            <span className="font-mono">{timeStr}</span>
            {timeStr && " · "}Welcome back to HRMS
          </p>
        </div>
      )}

      {/* Mobile Search */}
      {showMobileSearch && (
        <div className="flex-1 md:hidden animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search anything..."
              className="input-base w-full rounded-xl pl-9 pr-9 py-2 text-sm"
            />
            <button onClick={() => setShowMobileSearch(false)} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-[var(--text-muted)]" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Search */}
      <div className="hidden md:flex flex-1 max-w-sm mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={14} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search anything..."
            className="input-base w-full rounded-xl pl-9 pr-3 py-2 text-[13px]"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className={`flex items-center gap-1 ${showMobileSearch ? "hidden md:flex" : "flex"}`}>
        <NavIconBtn onClick={() => setShowMobileSearch(true)} className="md:hidden">
          <Search size={17} />
        </NavIconBtn>

        {/* Date pill */}
        <div className="hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border)]">
          <span className="text-[12px] font-medium text-[var(--text-secondary)]">{dateStr}</span>
        </div>

        {/* Theme toggle */}
        {mounted && (
          <NavIconBtn onClick={() => setTheme(isDark ? "light" : "dark")}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </NavIconBtn>
        )}

        {/* Notifications */}
        <div className="relative notif-dropdown">
          <NavIconBtn onClick={() => setShowNotifs((v) => !v)} badge={unreadCount}>
            <Bell size={17} />
          </NavIconBtn>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-[340px] sm:w-[380px] rounded-2xl overflow-hidden animate-scale-in z-50 border border-[var(--border-strong)]"
              style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-lg)" }}>
              {/* Header — teal-to-purple gradient */}
              <div className="px-4 py-3.5 flex items-center justify-between"
                style={{ background: "linear-gradient(135deg, #7c6fff 0%, #4f46e5 60%, #00d4aa 100%)" }}>
                <div>
                  <h3 className="font-semibold text-[14px] text-white">Notifications</h3>
                  <p className="text-[11px] text-white/70 mt-0.5">{unreadCount} unread</p>
                </div>
                <button onClick={() => setShowNotifs(false)} className="p-1.5 text-white/70 hover:text-white hover:bg-white/15 rounded-lg transition-all">
                  <X size={15} />
                </button>
              </div>

              {unreadCount > 0 && (
                <div className="px-4 py-2 flex justify-end border-b border-[var(--border)]">
                  <button onClick={markAllRead} className="text-[12px] text-[#7c6fff] hover:text-[#a5b4fc] font-medium transition-colors">
                    Mark all as read
                  </button>
                </div>
              )}

              <div className="max-h-[360px] overflow-y-auto">
                {loadingNotifs ? (
                  <div className="py-10 flex flex-col items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-7 h-7 border-2 border-[var(--border-strong)] border-t-[#7c6fff] rounded-full animate-spin" />
                    <p className="text-xs">Loading…</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 flex flex-col items-center gap-2 text-[var(--text-muted)]">
                    <Bell size={32} className="opacity-20" />
                    <p className="text-xs">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem key={n._id} notif={n} onMarkRead={markAsRead} onDelete={deleteNotif} />
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-[var(--border)] text-center bg-[var(--bg-elevated)]">
                  <button className="text-[12px] text-[#7c6fff] hover:text-[#a5b4fc] font-medium transition-colors">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative profile-dropdown ml-1">
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-all"
          >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[13px] font-bold shadow-lg"
              style={{ background: "linear-gradient(135deg, #7c6fff, #00d4aa)" }}>
              {userInitial}
            </div>
            <span className="hidden sm:block text-[13px] font-medium text-[var(--text-secondary)] max-w-[80px] truncate">
              {user?.name?.split(" ")[0]}
            </span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl overflow-hidden animate-scale-in z-50 border border-[var(--border-strong)]"
              style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-lg)" }}>
              {/* Profile header */}
              <div className="px-4 py-3.5 border-b border-[var(--border)]"
                style={{ background: "linear-gradient(135deg, rgba(124,111,255,0.12) 0%, rgba(0,212,170,0.06) 100%)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow"
                    style={{ background: "linear-gradient(135deg, #7c6fff, #00d4aa)" }}>
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
                    <p className="text-[11px] text-[var(--text-muted)] capitalize truncate">
                      {(user?.role?.name || user?.role || "").toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-2 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                {[
                  { icon: <User size={14} />, label: "Profile Settings", action: goToProfile },
                  { icon: <Settings size={14} />, label: "System Config", action: () => {} },
                ].map(({ icon, label, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-all"
                  >
                    <span className="text-[var(--text-muted)]">{icon}</span>
                    {label}
                  </button>
                ))}

                <div className="h-px bg-[var(--border)] mx-3 my-1" />

                <button
                  onClick={() => { logout(); router.push("/login"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/8 transition-all"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
