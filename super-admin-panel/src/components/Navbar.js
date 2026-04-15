"use client";

import { useAuth } from "../context/AuthContext";
import { Bell, User, Settings, LogOut, X, Check, Clock, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  getNotificationsApi,
  markAsReadApi,
  markAllAsReadApi,
  deleteNotificationApi,
} from "@/services/notificationApi";

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [time, setTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const router = useRouter();

  //  Role & Department mapping - Memoized to prevent recalculation
  const { roleKey, deptKey, rolePath, deptPath } = useMemo(() => {
    const roleMap = {
      SUPER_ADMIN: "superadmin",
      ADMIN: "admin",
      USER: "user",
    };

    const deptMap = {
      CE: "ce",
      IT: "it",
      SALES: "sales",
    };

    const roleKey = (user?.role?.name || user?.role || "USER")
      .toUpperCase()
      .replace(" ", "_");

    const deptKey = (user?.department?.name || user?.department || "CE")
      .toUpperCase()
      .replace(" ", "_");

    return {
      roleKey,
      deptKey,
      rolePath: roleMap[roleKey] || "user",
      deptPath: deptMap[deptKey] || "ce",
    };
  }, [user?.role, user?.department]);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications - useCallback to prevent recreation
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoadingNotifications(true);
    try {
      const res = await getNotificationsApi(20, 0);
      setNotifications(res.data.notifications || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [user]);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Auto-refresh notifications every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notifications-container')) {
        setShowNotifications(false);
      }
      if (showProfileMenu && !event.target.closest('.profile-container')) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showProfileMenu]);

  // Show nothing while loading
  if (loading || !user) {
    return null;
  }

  const getGreeting = () => {
    if (!time) return "Welcome 👋";
    const hours = time.getHours();
    if (hours < 12) return "Good Morning ☀️";
    if (hours < 18) return "Good Afternoon 🌤️";
    return "Good Evening 🌙";
  };

  const handleProfileClick = () => {
    if (roleKey === "SUPER_ADMIN") {
      router.push(`/${rolePath}/profile`);
    } else {
      router.push(`/${rolePath}/${deptPath}/profile`);
    }
    setShowProfileMenu(false);
  };

  // Fetch notifications
  

  const markAsRead = async (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(notif => 
      notif._id === id ? { ...notif, read: true } : notif
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await markAsReadApi(id);
    } catch (error) {
      console.error("Error marking as read:", error);
      // Revert on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    const prevNotifications = notifications;
    const prevUnreadCount = unreadCount;
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);

    try {
      await markAllAsReadApi();
    } catch (error) {
      console.error("Error marking all as read:", error);
      // Revert on error
      setNotifications(prevNotifications);
      setUnreadCount(prevUnreadCount);
    }
  };

  const deleteNotification = async (id) => {
    // Optimistic update
    const deletedNotif = notifications.find(n => n._id === id);
    setNotifications(prev => prev.filter(notif => notif._id !== id));
    if (deletedNotif && !deletedNotif.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await deleteNotificationApi(id);
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Revert on error
      fetchNotifications();
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <Check className="text-green-500" size={18} />;
      case "warning":
        return <Clock className="text-yellow-500" size={18} />;
      case "alert":
        return <AlertCircle className="text-red-500" size={18} />;
      default:
        return <Bell className="text-blue-500" size={18} />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    const hours = Math.floor(seconds / 3600);
    if (seconds < 86400) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(seconds / 86400);
    if (seconds < 604800) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <header className="h-16 fixed top-0 right-0 left-2 md:left-64 bg-white/80 backdrop-blur-md border-b border-slate-200 z-40 flex items-center justify-between px-4 md:px-6">
      {/* Left Side */}
      <div className=" p-4">
        <p className="text-sm text-slate-500">{getGreeting()}</p>
        <p className="text-md font-semibold text-slate-800">
          {time.toLocaleTimeString()}
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative notifications-container">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
              {/* Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Notifications</h3>
                  <p className="text-xs text-indigo-100">{unreadCount} unread messages</p>
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Actions */}
              {unreadCount > 0 && (
                <div className="px-4 py-2 bg-slate-50 border-b border-slate-200">
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="max-h-96 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="px-4 py-8 text-center text-slate-400">
                    <div className="animate-spin mx-auto mb-2 w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
                    <p className="text-sm">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-400">
                    <Bell size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                        !notif.read ? "bg-indigo-50/50" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-semibold ${!notif.read ? "text-slate-900" : "text-slate-600"}`}>
                              {notif.title}
                            </h4>
                            {!notif.read && (
                              <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-400">{getTimeAgo(notif.createdAt)}</span>
                            <div className="flex gap-2">
                              {!notif.read && (
                                <button
                                  onClick={() => markAsRead(notif._id)}
                                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                                >
                                  Mark read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notif._id)}
                                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-center">
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    View all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2"></div>

        {/* Profile */}
        <div className="relative profile-container">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
          >
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <User size={20} />
            </div>

            <div className="hidden md:block text-left">
              <p className="text-sm font-bold text-slate-700">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {(user?.role?.name || user?.role || "")
                  .toLowerCase()
                  .replace("_", " ")}
              </p>
            </div>
          </button>

          {/* Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={handleProfileClick}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50"
              >
                <User size={16} /> Profile Settings
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50">
                <Settings size={16} /> System Config
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
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
