"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Users,
  Clock,
  UserX,
  Coffee,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  LogIn,
  Play,
  LogOut,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import LeaveCalendar from "@/components/dashboard/LeaveCalendar";
import {
  getDashboardStatsApi,
  getWeeklyAttendanceApi,
  getAttendanceHistoryApi,
} from "@/services/dashboardApi";
import {
  checkInApi,
  breakInApi,
  breakOutApi,
  checkOutApi,
  getMonthlyAttendanceApi,
  getAttendanceSummary,
} from "@/services/attandanceApi";
import { getUserLeavesApi } from "@/services/leaveApi";
import { getHolidaysApi } from "@/services/holidayApi";
import { cachedFetch } from "@/lib/cache";

//  Constants
const ACTIVE_STATUSES = new Set([
  "CHECKED_IN",
  "ON_BREAK",
  "BACK_TO_WORK",
  "LATE",
]);

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
  },
};

const COLOR_MAP = {
  green: {
    bg: "bg-green-50",
    text: "text-green-600",
    iconBg: "bg-green-500",
    border: "border-green-100",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    iconBg: "bg-blue-500",
    border: "border-blue-100",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    iconBg: "bg-orange-500",
    border: "border-orange-100",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    iconBg: "bg-red-500",
    border: "border-red-100",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    iconBg: "bg-purple-500",
    border: "border-purple-100",
  },
};

// Helpers

const monthBounds = () => {
  const now = new Date();
  return {
    first: new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0],
    last: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0],
  };
};

const toTime = (d) =>
  d
    ? new Date(d).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const breakMins = (breaks = []) =>
  breaks.reduce((acc, b) => {
    if (b.breakIn && b.breakOut)
      acc += (new Date(b.breakOut) - new Date(b.breakIn)) / 60000;
    return acc;
  }, 0);

const minsToHM = (m) =>
  `${Math.floor(m / 60)}:${String(Math.floor(m % 60)).padStart(2, "0")}`;
const minsToHMs = (m) => `${Math.floor(m / 60)}h ${Math.floor(m % 60)}m`;

const calcWorkHours = (record) => {
  if (!record.checkIn || !record.checkOut) return "—";
  const net =
    (new Date(record.checkOut) - new Date(record.checkIn)) / 60000 -
    breakMins(record.breaks);
  return minsToHMs(net);
};

const countLeaveDays = (leaves, start, end) =>
  leaves
    .filter(
      (l) =>
        l.status === "APPROVED" &&
        new Date(l.fromDate) <= end &&
        new Date(l.toDate) >= start,
    )
    .reduce((acc, l) => {
      const s = new Date(l.fromDate) < start ? start : new Date(l.fromDate);
      const e = new Date(l.toDate) > end ? end : new Date(l.toDate);
      return acc + (l.isHalfDay ? 0.5 : Math.ceil((e - s) / 86400000) + 1);
    }, 0);

//  Sub-components

const StatCard = ({ title, value, icon, trend, trendUp, color, sparkline }) => {
  const c = COLOR_MAP[color];
  const max = Math.max(...(sparkline || [1]));
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition">
      <div className={`inline-flex p-2.5 rounded-xl mb-3 ${c.bg} ${c.text}`}>
        {icon}
      </div>
      <p className="text-sm text-slate-500 mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        {sparkline && (
          <div className="flex items-end gap-0.5 h-8">
            {sparkline.map((v, i) => (
              <div
                key={i}
                className={`w-1.5 rounded-t ${c.bg}`}
                style={{ height: `${(v / max) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 mt-2">
        {trendUp !== undefined &&
          (trendUp ? (
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
          ))}
        <span
          className={`text-xs ${trendUp ? "text-green-600" : trendUp === false ? "text-red-600" : "text-slate-500"}`}
        >
          {trend}
        </span>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, subtitle, color, onClick, disabled }) => {
  const c = COLOR_MAP[color];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${c.bg} ${c.border} border-2 rounded-2xl p-4 sm:p-6 transition-all hover:shadow-md
        ${disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={`${c.iconBg} w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white`}
        >
          {icon}
        </div>
        <div>
          <p className="font-bold text-sm sm:text-base text-slate-800">
            {label}
          </p>
          <p className="text-xs sm:text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
    </button>
  );
};

const SummaryItem = ({ label, value, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-600">{label}</span>
    <span className={`text-lg font-bold ${COLOR_MAP[color].text}`}>
      {value}
    </span>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <select className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400">
        <option>This Week</option>
        <option>Last Week</option>
        <option>This Month</option>
      </select>
    </div>
    <div className="h-64">{children}</div>
  </div>
);

//  Main Component
export default function UnifiedDashboard() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    presentToday: 0,
    totalWorkHours: 0,
    lateCheckIns: 0,
    absentToday: 0,
    onBreak: 0,
    checkInTime: "—",
    checkOutTime: "—",
    totalBreakTime: "0:00",
    workingHours: "—",
    goalProgress: 0,
    userStatus: "NOT_CHECKED_IN",
    breaks: [],
  });
  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [weeklyWorkHours, setWeeklyWorkHours] = useState([]);
  const [history, setHistory] = useState([]);
  const [monthlyRecords, setMonthlyRecords] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);

  // Fetch

  const fetchAll = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { first, last } = monthBounds();

      const [
        statsRes,
        weeklyRes,
        historyRes,
        monthlyRes,
        summaryRes,
        leavesRes,
        holidaysRes,
      ] = await Promise.all([
        cachedFetch("ud:stats", () => getDashboardStatsApi(), 30_000),
        cachedFetch("ud:weekly", () => getWeeklyAttendanceApi(), 60_000),
        cachedFetch(`ud:history:${today}`, () => getAttendanceHistoryApi(today, today), 30_000),
        cachedFetch(`ud:monthly:${first}`, () => getMonthlyAttendanceApi(first, last), 60_000),
        cachedFetch(`ud:summary:${first}`, () => getAttendanceSummary(first, last), 60_000),
        cachedFetch("ud:leaves", () => getUserLeavesApi(), 60_000),
        cachedFetch("ud:holidays", () => getHolidaysApi(), 3_600_000),
      ]);

      if (statsRes.data)
        setStats({ ...statsRes.data, breaks: statsRes.data.breaks || [] });
      if (weeklyRes.data) {
        setWeeklyAttendance(weeklyRes.data.weeklyAttendance || []);
        setWeeklyWorkHours(weeklyRes.data.weeklyWorkHours || []);
      }
      if (historyRes.data) {
        setHistory(
          historyRes.data.map((r) => ({
            date: r.date,
            entryTime: toTime(r.checkIn),
            exitTime: toTime(r.checkOut),
            breaks: r.breaks?.length
              ? `${r.breaks.length} break(s)`
              : "No breaks",
            totalBreakTime: minsToHM(breakMins(r.breaks)),
            workingHours: calcWorkHours(r),
            status: r.status,
            userEmail: r.userId?.email || "N/A",
            userName: r.userId?.name || "N/A",
            userId: r.userId?._id || "N/A",
          })),
        );
      }
      if (monthlyRes.data) setMonthlyRecords(monthlyRes.data);
      if (summaryRes.data) setMonthlySummary(summaryRes.data);
      if (leavesRes.data) setLeaves(leavesRes.data.data || []);
      if (holidaysRes.data)
        setHolidays(Array.isArray(holidaysRes.data) ? holidaysRes.data : []);
    } catch (err) {
      console.error("Dashboard fetch:", err);
      if (!refreshing)
        alert("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchAll();
    const t = setInterval(fetchAll, 30_000);
    return () => clearInterval(t);
  }, [fetchAll]);

  //  Derived state
  const isCheckedIn = ACTIVE_STATUSES.has(stats.userStatus);
  const isOnBreak = stats.userStatus === "ON_BREAK";
  const isCheckedOut = stats.userStatus === "CHECKED_OUT";
  const hasCheckedInToday = isCheckedIn || isCheckedOut;

  const lateCount = useMemo(
    () => monthlyRecords.filter((r) => r.isLate).length,
    [monthlyRecords],
  );

  const actualAbsent = useMemo(() => {
    if (!monthlySummary) return 0;
    const { first, last } = monthBounds();
    const approved = countLeaveDays(leaves, new Date(first), new Date(last));
    return Math.max(0, monthlySummary.absent - approved);
  }, [leaves, monthlySummary]);

  //  Attendance actions

  const action = (apiFn, msg) => async () => {
    try {
      await apiFn();
      alert(msg);
      fetchAll();
    } catch (e) {
      alert(e.response?.data?.message || "Action failed");
    }
  };

  const displayVal = (monthly, fallback) =>
    monthlySummary ? monthly : fallback;

  //Loading

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <Sidebar />
        <div className="sidebar-aware pt-14 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading dashboard…</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <Sidebar />

      <div className="sidebar-aware pt-14">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Attendance System
            </h2>
            <div className="flex items-center gap-2 bg-indigo-50 px-3 sm:px-4 py-2 rounded-lg text-indigo-600">
              <CalendarIcon size={16} />
              <span className="text-xs sm:text-sm font-semibold hidden sm:block">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <StatCard
              title="Days Present"
              color="green"
              trendUp={true}
              trend="This month"
              value={displayVal(monthlySummary?.present, stats.presentToday)}
              icon={<Users className="w-5 h-5" />}
              sparkline={[
                displayVal(monthlySummary?.present, stats.presentToday) - 2,
                null,
                displayVal(monthlySummary?.present, stats.presentToday),
              ].map((v) => Math.max(0, v ?? 0))}
            />
            <StatCard
              title="Work Hours"
              color="blue"
              trend="This month"
              value={`${displayVal(Math.floor(monthlySummary?.totalWorkHours), stats.totalWorkHours)}h`}
              icon={<Clock className="w-5 h-5" />}
              sparkline={[
                20,
                30,
                displayVal(
                  monthlySummary?.totalWorkHours,
                  stats.totalWorkHours,
                ),
              ]}
            />
            <StatCard
              title="Late Check-ins"
              color="orange"
              trendUp={false}
              trend="This month"
              value={lateCount}
              icon={<Clock className="w-5 h-5" />}
              sparkline={[Math.max(0, lateCount - 1), lateCount, lateCount]}
            />
            <StatCard
              title="Days Absent"
              color="red"
              trendUp={false}
              trend="This month"
              value={actualAbsent}
              icon={<UserX className="w-5 h-5" />}
              sparkline={[actualAbsent, actualAbsent, actualAbsent]}
            />
            <StatCard
              title="On Break"
              color="purple"
              trend="Right now"
              value={isOnBreak ? "Yes" : "No"}
              icon={<Coffee className="w-5 h-5" />}
              sparkline={[0, 0, isOnBreak ? 1 : 0]}
            />
          </div>

          {/* Tracking + Today Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Attendance Tracking
                  </h3>
                  <p className="text-sm text-slate-500">
                    Track your attendance with one click
                  </p>
                </div>
                {stats.userStatus === "LATE" && (
                  <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    Late Check-In
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <ActionButton
                  icon={<LogIn className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Check In"
                  subtitle="Start Your Day"
                  color="green"
                  onClick={action(checkInApi, "Checked in successfully!")}
                  disabled={hasCheckedInToday}
                />
                <ActionButton
                  icon={<Coffee className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Break"
                  subtitle="Take a Break"
                  color="orange"
                  onClick={action(breakInApi, "Break started!")}
                  disabled={!isCheckedIn || isOnBreak}
                />
                <ActionButton
                  icon={<Play className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Resume"
                  subtitle="Back to Work"
                  color="blue"
                  onClick={action(breakOutApi, "Break ended!")}
                  disabled={!isOnBreak}
                />
                <ActionButton
                  icon={<LogOut className="w-5 h-5 sm:w-6 sm:h-6" />}
                  label="Check Out"
                  subtitle="End Your Day"
                  color="red"
                  onClick={action(checkOutApi, "Checked out successfully!")}
                  disabled={!isCheckedIn}
                />
              </div>
            </div>

            {/* Today's Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-5">
                Today's Summary
              </h3>
              <div className="space-y-3">
                <SummaryItem
                  label="Check In"
                  value={stats.checkInTime}
                  color="green"
                />
                <SummaryItem
                  label="Check Out"
                  value={stats.checkOutTime}
                  color="red"
                />
                <SummaryItem
                  label="Total Break"
                  value={stats.totalBreakTime}
                  color="orange"
                />
                <SummaryItem
                  label="Working Hours"
                  value={stats.workingHours}
                  color="blue"
                />
              </div>

              {/* Break details */}
              {stats.breaks.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-orange-500" /> Break Details
                  </h4>
                  <div className="space-y-2">
                    {stats.breaks.map((b) => (
                      <div
                        key={b.index}
                        className={`p-3 rounded-lg border text-xs ${b.isActive ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-600">
                            Break #{b.index}
                          </span>
                          {b.isActive && (
                            <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-green-600 font-medium">
                              {b.breakStart}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span
                              className={`font-medium ${b.isActive ? "text-orange-600" : "text-red-600"}`}
                            >
                              {b.breakEnd}
                            </span>
                          </div>
                          <span className="font-semibold text-slate-600">
                            {b.duration}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Goal progress */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-slate-500">
                    {stats.goalProgress}% of 8h goal
                  </span>
                  <span className="font-semibold text-slate-900">
                    {stats.workingHours} / 8h
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(stats.goalProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="Weekly Attendance">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAttendance}>
                  <defs>
                    <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Area
                    type="monotone"
                    dataKey="present"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#gPresent)"
                    fillOpacity={1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Work Hours Overview">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyWorkHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip {...TOOLTIP_STYLE} />
                  <Bar dataKey="hours" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
    
          {/* History Table */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Attendance History
              </h3>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button className="text-sm bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-lg font-medium transition">
                  Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {[
                      "Date",
                      "Entry",
                      "Exit",
                      "Breaks",
                      "Break Time",
                      "Work Hours",
                      "Status",
                      "User",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-3 px-3 text-xs font-semibold text-slate-500 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-8 text-slate-400"
                      >
                        No records found
                      </td>
                    </tr>
                  ) : (
                    history.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                          {r.date}
                        </td>
                        <td className="py-3 px-3 text-green-600 font-semibold">
                          {r.entryTime}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {r.exitTime}
                        </td>
                        <td className="py-3 px-3 text-blue-600">{r.breaks}</td>
                        <td className="py-3 px-3 text-slate-700">
                          {r.totalBreakTime}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {r.workingHours}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="text-blue-600 font-medium">
                            {r.userEmail}
                          </p>
                          <p className="text-xs text-slate-500">{r.userName}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Leaves Calendar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Recent Leaves Calendar
            </h3>
            <LeaveCalendar leaves={leaves} holidays={holidays} />
          </div>
        </div>
      </div>
    </main>
  );
}
