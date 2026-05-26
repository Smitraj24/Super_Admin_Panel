"use client";

import { useState, useEffect } from "react";
import { Users, Clock, UserX, Coffee } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
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
} from "@/services/attandanceApi";

// Import dashboard components
import DashboardHeader from "./dashboard/DashboardHeader";
import StatCard from "./dashboard/StatCard";
import AttendanceTracking from "./dashboard/AttendanceTracking";
import TodaysSummary from "./dashboard/TodaysSummary";
import WeeklyCharts from "./dashboard/WeeklyCharts";
import AttendanceHistory from "./dashboard/AttendanceHistory";

export default function UnifiedDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [attendanceData, setAttendanceData] = useState({
    presentToday: 0,
    totalWorkHours: 0,
    lateCheckIns: 0,
    absentToday: 0,
    onBreak: 0,
    checkInTime: "---",
    checkOutTime: "---",
    totalBreakTime: "0:00",
    workingHours: "---",
    goalProgress: 0,
    userStatus: "NOT_CHECKED_IN",
    breaks: [],
  });

  const [weeklyAttendance, setWeeklyAttendance] = useState([]);
  const [weeklyWorkHours, setWeeklyWorkHours] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      const [statsRes, weeklyRes, historyRes] = await Promise.all([
        getDashboardStatsApi(),
        getWeeklyAttendanceApi(),
        getAttendanceHistoryApi(
          new Date().toISOString().split("T")[0],
          new Date().toISOString().split("T")[0]
        ),
      ]);

      if (statsRes.data) {
        setAttendanceData({
          presentToday: statsRes.data.presentToday || 0,
          totalWorkHours: statsRes.data.totalWorkHours || 0,
          lateCheckIns: statsRes.data.lateCheckIns || 0,
          absentToday: statsRes.data.absentToday || 0,
          onBreak: statsRes.data.onBreak || 0,
          checkInTime: statsRes.data.checkInTime || "---",
          checkOutTime: statsRes.data.checkOutTime || "---",
          totalBreakTime: statsRes.data.totalBreakTime || "0:00",
          workingHours: statsRes.data.workingHours || "---",
          goalProgress: statsRes.data.goalProgress || 0,
          userStatus: statsRes.data.userStatus || "NOT_CHECKED_IN",
          breaks: statsRes.data.breaks || [],
        });

        const status = statsRes.data.userStatus;
        setIsCheckedIn(
          ["CHECKED_IN", "ON_BREAK", "BACK_TO_WORK", "LATE"].includes(status)
        );
        setIsOnBreak(status === "ON_BREAK");
        setHasCheckedInToday(
          ["CHECKED_IN", "ON_BREAK", "BACK_TO_WORK", "LATE", "CHECKED_OUT"].includes(status)
        );
      }

      if (weeklyRes.data) {
        setWeeklyAttendance(weeklyRes.data.weeklyAttendance || []);
        setWeeklyWorkHours(weeklyRes.data.weeklyWorkHours || []);
      }

      if (historyRes.data) {
        const formattedHistory = historyRes.data.map((record) => ({
          date: record.date,
          entryTime: record.checkIn
            ? new Date(record.checkIn).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          exitTime: record.checkOut
            ? new Date(record.checkOut).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
          breaks:
            record.breaks && record.breaks.length > 0
              ? `${record.breaks.length} break(s)`
              : "No breaks",
          totalBreakTime: calculateBreakTime(record.breaks),
          workingHours: calculateWorkingHours(record),
          status: record.status,
          userEmail: record.userId?.email || "N/A",
          userName: record.userId?.name || "N/A",
          userId: record.userId?._id || "N/A",
        }));
        setAttendanceHistory(formattedHistory);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (!refreshing) {
        alert("Failed to load dashboard data. Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculate break time
  const calculateBreakTime = (breaks) => {
    if (!breaks || breaks.length === 0) return "0:00";

    let totalMinutes = 0;
    breaks.forEach((brk) => {
      if (brk.breakIn && brk.breakOut) {
        const minutes =
          (new Date(brk.breakOut) - new Date(brk.breakIn)) / (1000 * 60);
        totalMinutes += minutes;
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.floor(totalMinutes % 60);
    return `${hours}:${String(mins).padStart(2, "0")}`;
  };

  // Calculate working hours
  const calculateWorkingHours = (record) => {
    if (!record.checkIn || !record.checkOut) return "-";

    let workMinutes =
      (new Date(record.checkOut) - new Date(record.checkIn)) / (1000 * 60);

    if (record.breaks) {
      record.breaks.forEach((brk) => {
        if (brk.breakIn && brk.breakOut) {
          workMinutes -=
            (new Date(brk.breakOut) - new Date(brk.breakIn)) / (1000 * 60);
        }
      });
    }

    const hours = Math.floor(workMinutes / 60);
    const mins = Math.floor(workMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleCheckIn = async () => {
    try {
      await checkInApi();
      alert("Checked in successfully!");
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to check in");
    }
  };

  const handleBreak = async () => {
    try {
      await breakInApi();
      alert("Break started!");
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to start break");
    }
  };

  const handleResume = async () => {
    try {
      await breakOutApi();
      alert("Break ended!");
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to end break");
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOutApi();
      alert("Checked out successfully!");
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to check out");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <Sidebar />
        <div className="lg:ml-64 pt-20 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      <Sidebar />

      <div className="lg:ml-64 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <DashboardHeader refreshing={refreshing} handleRefresh={handleRefresh} />

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <StatCard
              title="Total Days Present"
              value={attendanceData.presentToday}
              icon={<Users className="w-6 h-6" />}
              trend="All time"
              trendUp={true}
              color="green"
              sparkline={[
                attendanceData.presentToday - 2,
                attendanceData.presentToday - 1,
                attendanceData.presentToday,
              ]}
            />
            <StatCard
              title="Work Hours"
              value={`${attendanceData.totalWorkHours}h`}
              icon={<Clock className="w-6 h-6" />}
              trend="This week"
              color="blue"
              sparkline={[20, 30, attendanceData.totalWorkHours]}
            />
            <StatCard
              title="Total Late Check-ins"
              value={attendanceData.lateCheckIns}
              icon={<Clock className="w-6 h-6" />}
              trend="All time"
              trendUp={false}
              color="orange"
              sparkline={[
                Math.max(0, attendanceData.lateCheckIns - 1),
                attendanceData.lateCheckIns,
                attendanceData.lateCheckIns,
              ]}
            />
            <StatCard
              title="Days Absent"
              value={attendanceData.absentToday}
              icon={<UserX className="w-6 h-6" />}
              trend="All time"
              trendUp={false}
              color="red"
              sparkline={[
                attendanceData.absentToday,
                attendanceData.absentToday,
                attendanceData.absentToday,
              ]}
            />
            <StatCard
              title="On Break"
              value={attendanceData.onBreak === 1 ? "Yes" : "No"}
              icon={<Coffee className="w-6 h-6" />}
              trend="Right now"
              color="purple"
              sparkline={[0, 0, attendanceData.onBreak]}
            />
          </div>

          {/* Attendance Tracking & Today's Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <AttendanceTracking
              userStatus={attendanceData.userStatus}
              isCheckedIn={isCheckedIn}
              isOnBreak={isOnBreak}
              handleCheckIn={handleCheckIn}
              handleBreak={handleBreak}
              handleResume={handleResume}
              handleCheckOut={handleCheckOut}
            />
            <TodaysSummary attendanceData={attendanceData} />
          </div>

          <WeeklyCharts
            weeklyAttendance={weeklyAttendance}
            weeklyWorkHours={weeklyWorkHours}
          />

          <AttendanceHistory attendanceHistory={attendanceHistory} />
        </div>
      </div>
    </main>
  );
}
