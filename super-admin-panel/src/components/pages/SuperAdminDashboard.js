"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Users,
  Building2,
  Clock,
  UserCheck,
  Briefcase,
  BarChart3,
  Activity,
  Calendar as CalendarIcon,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/Sidebar";
import StatCard from "@/components/dashboard/StatCard";
import QuickActionButton from "@/components/dashboard/ActionButton";
import LeaveCalendar from "@/components/dashboard/LeaveCalendar";
import UpcomingBirthdays from "@/components/dashboard/UpcomingBirthdays";
import AttendanceOverview from "@/components/dashboard/AttendanceOverview";
import ShiftDistribution from "@/components/dashboard/ShiftDistribution";
import DepartmentSummary from "@/components/dashboard/DepartmentSummary";
import RecentLeaves from "@/components/dashboard/RecentLeaves";
import { SectionCard } from "@/components/dashboard/SuperAdminSections";
import {
  todayStr,
  monthRange,
  isPresent,
  getTimeAgo,
  safeArray,
  shiftFor,
  pct,
} from "@/components/dashboard/SuperAdminConstants";
import {
  getStatsApi,
  getDepartmentsApi,
  getUsersApi,
  getAdminsApi,
} from "@/services/superAdminApi";
import {
  getAllUsersAttendanceApi,
  getUserAttendanceByIdApi,
} from "@/services/attandanceApi";
import { getSuperAdminLeavesApi } from "@/services/leaveApi";
import { getHolidaysApi } from "@/services/holidayApi";
import { cachedFetch } from "@/lib/cache";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    totalDepartments: 0,
    onLeaveToday: 0,
    totalWorkingHours: 0,
    attendanceRate: 0,
  });
  const [overview, setOverview] = useState({
    present: 0,
    absent: 0,
    onLeave: 0,
    late: 0,
    total: 0,
  });
  const [trend, setTrend] = useState([]);
  const [deptSummary, setDeptSummary] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [shiftData, setShiftData] = useState([]);

  // User filter state
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserTodayAtt, setSelectedUserTodayAtt] = useState(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const today = todayStr();
      const { first, last } = monthRange();

      const [
        statsRes,
        deptsRes,
        usersRes,
        adminsRes,
        todayAtt,
        monthAtt,
        leavesRes,
        holidaysRes,
      ] = await Promise.all([
        cachedFetch("sa:stats", () => getStatsApi(), 30_000),
        cachedFetch("sa:departments", () => getDepartmentsApi(), 120_000),
        cachedFetch("sa:users", () => getUsersApi(), 120_000),
        cachedFetch("sa:admins", () => getAdminsApi(), 120_000),
        cachedFetch(
          `sa:att:today:${today}`,
          () => getAllUsersAttendanceApi(today, today),
          30_000,
        ),
        cachedFetch(
          `sa:att:month:${first}`,
          () => getAllUsersAttendanceApi(first, last),
          60_000,
        ),
        cachedFetch("sa:leaves", () => getSuperAdminLeavesApi(), 60_000),
        cachedFetch("sa:holidays", () => getHolidaysApi(), 3_600_000),
      ]);

      const allUsers = [
        ...safeArray(usersRes.data?.users ?? usersRes.data),
        ...safeArray(adminsRes.data),
      ];
      const todayRecs = safeArray(todayAtt.data?.data ?? todayAtt.data);
      const monthRecs = safeArray(monthAtt.data?.data ?? monthAtt.data);
      const allLeavesData = safeArray(leavesRes.data?.data ?? leavesRes.data);
      const departments = deptsRes.data || [];
      const holidaysData = safeArray(holidaysRes.data);

      setAllUsers(allUsers);
      setAllLeaves(allLeavesData);
      setHolidays(holidaysData);

      const totalEmployees = allUsers.length;
      const presentToday = todayRecs.filter(isPresent).length;
      const lateCount = todayRecs.filter((r) => r.isLate).length;

      const todayDate = new Date(today);
      todayDate.setHours(0, 0, 0, 0);
      const onLeaveToday = allLeavesData.filter((l) => {
        if (l.status !== "APPROVED") return false;
        const from = new Date(l.fromDate);
        from.setHours(0, 0, 0, 0);
        const to = new Date(l.toDate);
        to.setHours(23, 59, 59, 999);
        return from <= todayDate && to >= todayDate;
      }).length;

      const absentToday = Math.max(
        0,
        totalEmployees - presentToday - onLeaveToday,
      );
      const attendanceRate = parseFloat(pct(presentToday, totalEmployees));

      const totalWorkingHours = Math.round(
        monthRecs.reduce((acc, r) => {
          if (!r.checkIn || !r.checkOut) return acc;
          let mins = (new Date(r.checkOut) - new Date(r.checkIn)) / 60000;
          (r.breaks || []).forEach((b) => {
            if (b.breakIn && b.breakOut)
              mins -= (new Date(b.breakOut) - new Date(b.breakIn)) / 60000;
          });
          return acc + mins / 60;
        }, 0),
      );

      setStats({
        totalEmployees,
        presentToday,
        totalDepartments: departments.length,
        onLeaveToday,
        totalWorkingHours,
        attendanceRate,
      });
      setOverview({
        present: presentToday,
        absent: absentToday,
        onLeave: onLeaveToday,
        late: lateCount,
        total: totalEmployees,
      });

      setDeptSummary(
        departments.map((dept) => {
          const members = allUsers.filter(
            (u) => (u.department?._id || u.department) === dept._id,
          );
          const present = todayRecs.filter((r) => {
            const uid = r.userId?._id || r.userId;
            return members.some((u) => u._id === uid) && isPresent(r);
          }).length;
          return {
            department: dept.name,
            employees: members.length,
            presentToday: present,
            rate: parseFloat(pct(present, members.length)),
          };
        }),
      );

      setRecentLeaves(
        [...allLeavesData]
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.fromDate) -
              new Date(a.createdAt || a.fromDate),
          )
          .slice(0, 4)
          .map((l) => ({
            employee: l.user?.name || "Unknown",
            leaveType: l.leaveType,
            from: new Date(l.fromDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            to: new Date(l.toDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            status: l.status,
          })),
      );

      setTrend(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const dStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(d);
          const dayRecs =
            dStr === today
              ? todayRecs
              : monthRecs.filter(
                  (r) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(r.date)) === dStr,
                );
          const present = dayRecs.filter(isPresent).length;
          return {
            day: d.toLocaleDateString("en-US", { weekday: "short" }),
            fullLabel: d.toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            }),
            present,
            absent: Math.max(0, totalEmployees - present),
          };
        }),
      );

      // Shift distribution from today's records
      const shiftCounts = todayRecs.reduce((acc, r) => {
        const s = r.shift ? r.shift.toLowerCase() : shiftFor(r.checkIn);
        const key = s.includes("morning")
          ? "Morning"
          : s.includes("evening")
            ? "Evening"
            : s.includes("night")
              ? "Night"
              : "Flexible";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});
      const shiftTotal = presentToday || 1;
      setShiftData(
        Object.entries(shiftCounts).map(([name, value]) => ({
          name: `${name} Shift`,
          value,
          percentage: pct(value, shiftTotal),
        })),
      );

      if (statsRes.data?.recentActivity)
        setRecentActivity(statsRes.data.recentActivity);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 30_000);
    return () => clearInterval(t);
  }, [fetchAll]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  // Fetch selected user's today attendance
  const fetchSelectedUserAttendance = useCallback(
    async (userId) => {
      if (!userId) {
        setSelectedUserTodayAtt(null);
        setSelectedUserData(null);
        return;
      }
      setSelectedUserLoading(true);
      try {
        const today = todayStr();
        const res = await getUserAttendanceByIdApi(userId, today, today);
        const records = res.data?.data || [];
        const record = records.length > 0 ? records[0] : null;
        setSelectedUserTodayAtt(record);

        // Find user info
        const user = allUsers.find((u) => u._id === userId);
        setSelectedUserData(user || null);
      } catch (err) {
        console.error("Error fetching user attendance:", err);
        setSelectedUserTodayAtt(null);
      } finally {
        setSelectedUserLoading(false);
      }
    },
    [allUsers],
  );

  // When user selection changes, fetch their attendance
  useEffect(() => {
    if (selectedUserId && allUsers.length > 0) {
      fetchSelectedUserAttendance(selectedUserId);
    }
  }, [selectedUserId, allUsers, fetchSelectedUserAttendance]);

  // Filter users for dropdown based on search
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery) return allUsers;
    const q = userSearchQuery.toLowerCase();
    return allUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q),
    );
  }, [allUsers, userSearchQuery]);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <Sidebar />
        <div className="sidebar-aware pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center animate-fade-in">
            <div className="w-10 h-10 border-2 border-[var(--border-strong)] border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--text-muted)] text-sm">
              Loading dashboard…
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <Sidebar />

      <div className="sidebar-aware pt-20">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#7c6fff] via-[#8b5cf6] to-[#00d4aa] bg-clip-text text-transparent">
                Super Admin Dashboard
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                Overview of the entire attendance system
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] disabled:opacity-40 transition-all"
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "animate-spin text-indigo-400" : ""}
                />
              </button>
              <div className="hidden sm:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-2 rounded-xl text-indigo-400">
                <CalendarIcon size={14} />
                <span className="text-[12px] font-semibold">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              {
                title: "Total Employees",
                value: stats.totalEmployees,
                icon: <Users size={18} />,
                up: true,
                color: "purple",
                sparkline: [1100, 1150, 1200, stats.totalEmployees],
              },
              {
                title: "Present Today",
                value: stats.presentToday,
                icon: <UserCheck size={18} />,
                up: stats.attendanceRate >= 80,
                color: "blue",
                sparkline: [850, 900, 950, stats.presentToday],
              },
              {
                title: "Total Departments",
                value: stats.totalDepartments,
                icon: <Building2 size={18} />,
                up: true,
                color: "green",
                sparkline: [20, 22, 23, stats.totalDepartments],
              },
              {
                title: "On Leave Today",
                value: stats.onLeaveToday,
                icon: <Briefcase size={18} />,
                up: false,
                color: "orange",
                sparkline: [100, 110, 120, stats.onLeaveToday],
              },
              {
                title: "Working Hours (mo.)",
                value: `${stats.totalWorkingHours}h`,
                icon: <Clock size={18} />,
                up: true,
                color: "cyan",
                sparkline: [7000, 7500, 8000, stats.totalWorkingHours],
              },
              {
                title: "Attendance Rate",
                value: `${stats.attendanceRate}%`,
                icon: <BarChart3 size={18} />,
                up: true,
                color: "indigo",
                sparkline: [88, 90, 91, stats.attendanceRate],
              },
            ].map((p) => (
              <StatCard key={p.title} subtitle="" {...p} />
            ))}
          </div>

          {/* Attendance Overview + Trend + Birthdays */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AttendanceOverview
              overview={overview}
              attendanceRate={stats.attendanceRate}
              mounted={mounted}
            />
            <ShiftDistribution shiftData={shiftData} mounted={mounted} />
            <UpcomingBirthdays />
          </div>

          {/* Department Summary + Recent Leaves */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DepartmentSummary deptSummary={deptSummary} />
            <RecentLeaves recentLeaves={recentLeaves} />
          </div>

          {/* Leave Calendar */}
          <SectionCard title="Recent Leaves Calendar">
            <LeaveCalendar
              leaves={allLeaves}
              holidays={holidays}
              selectedUserId={selectedUserId}
              selectedUserTodayAtt={selectedUserTodayAtt}
            />
          </SectionCard>

          {/* View Employee Today's Status - Filter below calendar */}
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <Search size={16} className="text-indigo-400" />
                View Employee Today's Status
              </span>
            }
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  placeholder="Search employee by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[var(--bg-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <select
                value={selectedUserId}
                onChange={(e) => {
                  setSelectedUserId(e.target.value);
                  setUserSearchQuery("");
                }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[var(--bg-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="">-- Select an employee --</option>
                {filteredUsers.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
              {selectedUserId && (
                <button
                  onClick={() => {
                    setSelectedUserId("");
                    setUserSearchQuery("");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <X size={16} />
                  Clear
                </button>
              )}
            </div>

            {/* Selected User Today Status Summary */}
            {selectedUserId && (
              <div className="mt-4 p-4 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/60 to-white/60 backdrop-blur-sm">
                {selectedUserLoading ? (
                  <div className="flex items-center gap-2 text-sm text-indigo-600">
                    <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                    Loading attendance...
                  </div>
                ) : selectedUserTodayAtt ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-indigo-100">
                          <UserCheck size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-indigo-900">
                            {selectedUserData?.name || "Selected Employee"}
                          </p>
                          <p className="text-xs text-indigo-600/70">
                            {selectedUserData?.email || ""}
                          </p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        selectedUserTodayAtt.status === "CHECKED_IN" || selectedUserTodayAtt.status === "BACK_TO_WORK"
                          ? "bg-green-100 text-green-700"
                          : selectedUserTodayAtt.status === "LATE"
                            ? "bg-yellow-100 text-yellow-700"
                            : selectedUserTodayAtt.status === "ON_BREAK"
                              ? "bg-blue-100 text-blue-700"
                              : selectedUserTodayAtt.checkOut
                                ? "bg-purple-100 text-purple-700"
                                : "bg-red-100 text-red-700"
                      }`}>
                        {selectedUserTodayAtt.status || (selectedUserTodayAtt.checkOut ? "CHECKED_OUT" : "ABSENT")}
                      </div>
                    </div>

                    {/* Today's Timeline */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/70 border border-green-200">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <UserCheck size={14} className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-green-600 font-semibold">CHECK-IN</p>
                          <p className="text-xs font-bold text-green-800">
                            {selectedUserTodayAtt.checkIn
                              ? new Date(selectedUserTodayAtt.checkIn).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                              : "---"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/70 border border-purple-200">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <Briefcase size={14} className="text-purple-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-purple-600 font-semibold">CHECK-OUT</p>
                          <p className="text-xs font-bold text-purple-800">
                            {selectedUserTodayAtt.checkOut
                              ? new Date(selectedUserTodayAtt.checkOut).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })
                              : "---"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white/70 border border-blue-200">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Clock size={14} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="text-[10px] text-blue-600 font-semibold">TOTAL BREAKS</p>
                          <p className="text-xs font-bold text-blue-800">
                            {selectedUserTodayAtt.breaks?.length || 0} break{(selectedUserTodayAtt.breaks?.length || 0) !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Break Details */}
                    {selectedUserTodayAtt.breaks?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-indigo-700 mb-2">Break Details</p>
                        <div className="space-y-1.5">
                          {selectedUserTodayAtt.breaks.map((b, bi) => (
                            <div key={bi} className="flex items-center gap-3 text-xs bg-white/50 rounded-lg px-3 py-2 border border-slate-200">
                              <span className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-[10px]">
                                B{bi + 1}
                              </span>
                              <div className="flex items-center gap-4">
                                <span className="text-green-700 font-medium">
                                  In: {new Date(b.breakIn).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                                </span>
                                <span className="text-blue-700 font-medium">
                                  Out: {b.breakOut
                                    ? new Date(b.breakOut).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
                                    : "---"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Clock size={16} />
                    <span>No attendance record found for today</span>
                  </div>
                )}
              </div>
            )}
          </SectionCard>

          {/* Recent Activity */}
          <SectionCard
            title={
              <span className="flex items-center gap-2">
                <Activity size={16} className="text-indigo-400" />
                Recent System Activities
              </span>
            }
            action={
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                  Live
                </span>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-1.5 hover:bg-[var(--bg-elevated)] rounded-lg transition disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={`text-[var(--text-muted)] ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
            }
          >
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recentActivity.length > 0 ? (
                recentActivity.map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 p-3 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    <div className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[var(--text-primary)] font-medium">
                        {a.text}
                      </p>
                      {a.performedBy && (
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                          by {a.performedBy}
                          {a.targetUser && ` → ${a.targetUser}`}
                          {a.department && ` (${a.department})`}
                        </p>
                      )}
                      <p className="text-[11px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        {getTimeAgo(a.time)}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[var(--text-muted)] py-8 text-sm">
                  No recent activity
                </p>
              )}
            </div>
          </SectionCard>

          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickActionButton
                icon={<Users />}
                path="/superadmin/users"
                label="Add Employee"
                subtitle="Add new employee"
                color="blue"
              />
              <QuickActionButton
                icon={<UserCheck />}
                path="/superadmin/attendance"
                label="Mark Attendance"
                subtitle="Bulk mark attendance"
                color="green"
              />
              <QuickActionButton
                icon={<Building2 />}
                path="/superadmin/departments"
                label="Add Department"
                subtitle="Create new dept"
                color="purple"
              />
              <QuickActionButton
                icon={<BarChart3 />}
                path="/superadmin/audit"
                label="Generate Report"
                subtitle="Custom reports"
                color="indigo"
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
