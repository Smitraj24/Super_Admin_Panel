"use client";

import { useAuth } from "../context/AuthContext";
import {
  Bell,
  User,
  Settings,
  LogOut,
  X,
  Check,
  Clock,
  AlertCircle,
  Search,
  Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
} from "@/services/notificationApi";
import { cachedFetch, invalidateCache } from "@/lib/cache";
import { useSidebar } from "@/context/SidebarContext";

const ROLE_MAP = { SUPER_ADMIN: "superadmin", ADMIN: "admin", USER: "user" };
const DEPT_MAP = { CE: "ce", IT: "it", SALES: "sales", HR: "hr" };
const ICON_MAP = {
  success: <Check size={16} className="text-emerald-500" />,
  warning: <Clock size={16} className="text-amber-500" />,
  alert: <AlertCircle size={16} className="text-rose-500" />,
  default: <Bell size={16} className="text-blue-500" />,
};
const NOTIF_TTL = 60_000;
const NOTIF_CACHE_KEY = "notifications";

const getGreeting = (h = new Date().getHours()) =>
  h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";

const getGreetingIcon = (h = new Date().getHours()) =>
  h < 12 ? "🌅" : h < 18 ? "☀️" : "🌙";

const getTimeStr = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

const getTimeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
};

const getNotifIcon = (type) => ICON_MAP[type] ?? ICON_MAP.default;

const getDateStr = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

const NotificationItem = memo(({ notif, onMarkRead, onDelete }) => (
  <div
    className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors ${!notif.read ? "bg-indigo-50/40" : ""}`}
  >
    <div className="flex gap-3">
      <div className="shrink-0 mt-0.5">{getNotifIcon(notif.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold truncate ${!notif.read ? "text-slate-900" : "text-slate-600"}`}>
            {notif.title}
          </p>
          {!notif.read && <span className="w-2 h-2 bg-indigo-500 rounded-full shrink-0 mt-1" />}
        </div>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-[11px] text-slate-400">{getTimeAgo(notif.createdAt)}</span>
          <div className="flex gap-2">
            {!notif.read && (
              <button onClick={() => onMarkRead(notif._id)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Mark read
              </button>
            )}
            <button onClick={() => onDelete(notif._id)} className="text-xs text-rose-500 hover:text-rose-600 font-medium">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
));
NotificationItem.displayName = "NotificationItem";

const IconButton = memo(({ onClick, children, className = "" }) => (
  <button
    onClick={onClick}
    className={`p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ${className}`}
  >
    {children}
  </button>
));
IconButton.displayName = "IconButton";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { collapsed } = useSidebar();
  const router = useRouter();

  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [dateStr, setDateStr] = useState("");
  const searchTimer = useRef(null);

  const { roleKey, rolePath, deptPath } = useMemo(() => {
    const roleKey = (user?.role?.name || user?.role || "USER")
      .toUpperCase()
      .replace(" ", "_");
    const deptKey = (user?.department?.name || user?.department || "CE")
      .toUpperCase()
      .replace(" ", "_");
    return {
      roleKey,
      rolePath: ROLE_MAP[roleKey] || "user",
      deptPath: DEPT_MAP[deptKey] || "ce",
    };
  }, [user?.role, user?.department]);

  const fetchNotifs = useCallback(async () => {
    if (!user) return;
    setLoadingNotifs(true);
    try {
      const res = await cachedFetch(
        NOTIF_CACHE_KEY,
        () => getNotificationsApi(20, 0),
        NOTIF_TTL,
      );
      setNotifications(res.data?.notifications || []);
      setUnreadCount(res.data?.unreadCount || 0);
    } catch (e) {
      console.error("Fetch notifications:", e);
    } finally {
      setLoadingNotifs(false);
    }
  }, [user]);

  const [greeting, setGreeting] = useState("");
  const [greetingIcon, setGreetingIcon] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    if (user) fetchNotifs();
    setDateStr(getDateStr());
    setGreeting(getGreeting());
    setGreetingIcon(getGreetingIcon());
    setTimeStr(getTimeStr());

    // Tick every second to keep time and greeting live
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
    searchTimer.current = setTimeout(() => {
      // TODO: wire up search action here
    }, 300);
  }, []);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    invalidateCache(NOTIF_CACHE_KEY);
    try {
      await markAsReadApi(id);
    } catch {
      fetchNotifs();
    }
  }, [fetchNotifs]);

  const markAllRead = useCallback(async () => {
    const snap = { notifications, unreadCount };
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    invalidateCache(NOTIF_CACHE_KEY);
    try {
      await markAllAsReadApi();
    } catch {
      setNotifications(snap.notifications);
      setUnreadCount(snap.unreadCount);
    }
  }, [notifications, unreadCount]);

  const deleteNotif = useCallback(async (id) => {
    const target = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (target && !target.read) setUnreadCount((prev) => Math.max(0, prev - 1));
    invalidateCache(NOTIF_CACHE_KEY);
    try {
      await deleteNotificationApi(id);
    } catch {
      fetchNotifs();
    }
  }, [notifications, fetchNotifs]);

  const goToProfile = useCallback(() => {
    const path =
      roleKey === "SUPER_ADMIN"
        ? `/${rolePath}/profile`
        : roleKey === "ADMIN"
          ? `/admin/${deptPath}/profile`
          : `/dashboard/${deptPath}/profile`;
    router.push(path);
    setShowProfile(false);
  }, [roleKey, rolePath, deptPath, router]);

  if (loading || !user) return null;

  const userInitial = user?.name?.charAt(0).toUpperCase() || "U";

  return (
    <header className={`mg:ml-64 fixed top-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm transition-all duration-300
      ${collapsed ? "left-20" : "left-64"}
    `}>
      {/* Greeting */}
      {!showMobileSearch && (
        <div className="shrink-0">
          <h2 className="text-lg font-semibold text-slate-900">
            {greetingIcon} {greeting}!
          </h2>
          <p className="text-xs text-slate-400 hidden lg:block">
            {timeStr && (
              <span className="font-mono font-medium text-slate-500">{timeStr}</span>
            )}
            {timeStr && " · "}Welcome back to HRMS
          </p>
        </div>
      )}

      {/* Mobile Search */}
      {showMobileSearch && (
        <div className="flex-1 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search anything..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded"
            >
              <X size={15} className="text-slate-500" />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search anything..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className={`flex items-center gap-1 sm:gap-2 ${showMobileSearch ? "hidden md:flex" : "flex"}`}>
        <IconButton onClick={() => setShowMobileSearch(true)} className="md:hidden">
          <Search size={18} />
        </IconButton>

        <div className="hidden sm:flex px-3 py-1.5 bg-slate-50 rounded-lg">
          <span className="text-xs font-medium text-slate-700">{dateStr}</span>
        </div>

        {/* Notifications */}
        <div className="relative notif-dropdown">
          <IconButton onClick={() => setShowNotifs((v) => !v)}>
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </IconButton>

          {showNotifs && (
            <div className="absolute right-[-20px] mt-3 w-[calc(40vh-0.8rem)] sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-violet-600 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">Notifications</h3>
                  <p className="text-xs text-purple-100">{unreadCount} unread</p>
                </div>
                <IconButton onClick={() => setShowNotifs(false)} className="text-white hover:text-white hover:bg-white/20">
                  <X size={16} />
                </IconButton>
              </div>

              {unreadCount > 0 && (
                <div className="px-4 py-2 flex justify-end border-b border-slate-100">
                  <button onClick={markAllRead} className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                    Mark all as read
                  </button>
                </div>
              )}

              <div className="h-[40vh] overflow-y-auto">
                {loadingNotifs ? (
                  <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-purple-600 rounded-full animate-spin" />
                    <p className="text-xs">Loading…</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
                    <Bell size={36} className="opacity-20" />
                    <p className="text-xs">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem key={n._id} notif={n} onMarkRead={markAsRead} onDelete={deleteNotif} />
                  ))
                )}
              </div>

               
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <IconButton className="hidden sm:flex"><Moon size={18} /></IconButton>

        {/* Profile */}
        <div className="relative profile-dropdown">
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center p-1 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-bold shadow">
              {userInitial}
            </div>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 sm:w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-violet-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 capitalize truncate">
                      {(user?.role?.name || user?.role || "").toLowerCase().replace("_", " ")}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 truncate">{user?.email}</p>
              </div>

              {[
                { icon: <User size={15} />, label: "Profile Settings", action: goToProfile },
                { icon: <Settings size={15} />, label: "System Config", action: () => {} },
              ].map(({ icon, label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-500">{icon}</span> {label}
                </button>
              ))}

              <div className="h-px bg-slate-100 my-1" />
              <button
                onClick={() => { logout(); router.push("/login"); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


// 