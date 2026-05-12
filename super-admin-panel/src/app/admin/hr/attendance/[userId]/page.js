"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getAllUsersAttendanceApi,
  updateAttendanceApi,
} from "@/services/attandanceApi";
import { getAttendanceSummary } from "@/services/attandanceApi";
import { getUsersApi, getAdminsApi } from "@/services/adminApi";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
  Calendar,
  Edit,
  Download,
  ArrowLeft,
  User,
  CheckCircle,
  XCircle,
  Briefcase,
  Clock,
  Coffee,
  PlayCircle,
  StopCircle,
  Filter,
} from "lucide-react";

export default function HRUserAttendanceDetail() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;

  const [user, setUser] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const now = new Date();
    setSelectedMonth(String(now.getMonth() + 1).padStart(2, "0"));
    setSelectedYear(String(now.getFullYear()));
    fetchUserData();
  }, [userId]);

  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchAttendance();
    }
  }, [selectedMonth, selectedYear, userId]);

  // Auto-refresh today's attendance every 30 seconds
  useEffect(() => {
    if (!selectedMonth || !selectedYear) return;

    const interval = setInterval(() => {
      const today = new Date().toISOString().split("T")[0];
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
      const lastDay = new Date(year, month, 0).toISOString().split("T")[0];

      if (today >= firstDay && today <= lastDay) {
        getAllUsersAttendanceApi(firstDay, lastDay)
          .then((res) => {
            const allAttendance = res.data?.data || [];
            const userAttendance = allAttendance.filter(
              (a) => a.userId?._id === userId,
            );
            userAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAttendance(userAttendance);
          })
          .catch((error) => {
            console.error("Error refreshing attendance:", error);
          });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedMonth, selectedYear, userId]);

  const fetchUserData = async () => {
    try {
      const [usersRes, adminsRes] = await Promise.all([
        getUsersApi(),
        getAdminsApi(),
      ]);

      const allUsers = [...(usersRes.data || []), ...(adminsRes.data || [])];
      const foundUser = allUsers.find((u) => u._id === userId);
      setUser(foundUser);
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const year = parseInt(selectedYear);
      const month = parseInt(selectedMonth);
      const firstDay = new Date(year, month - 1, 1).toISOString().split("T")[0];
      const lastDay = new Date(year, month, 0).toISOString().split("T")[0];

      const [attendanceRes, summaryRes] = await Promise.all([
        getAllUsersAttendanceApi(firstDay, lastDay),
        getAttendanceSummary(firstDay, lastDay),
      ]);

      const allAttendance = attendanceRes.data?.data || [];
      const userAttendance = allAttendance.filter(
        (a) => a.userId?._id === userId,
      );

      userAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAttendance(userAttendance);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (record) => {
    // Convert UTC time to local time for datetime-local input
    const getLocalDateTimeString = (utcDateString) => {
      if (!utcDateString) return "";
      const date = new Date(utcDateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Convert existing breaks to editable format
    const editableBreaks = (record.breaks || []).map((brk) => ({
      breakIn: getLocalDateTimeString(brk.breakIn),
      breakOut: getLocalDateTimeString(brk.breakOut),
      originalBreakIn: brk.breakIn,
      originalBreakOut: brk.breakOut,
    }));

    setEditingRecord({
      ...record,
      newCheckIn: getLocalDateTimeString(record.checkIn),
      newCheckOut: getLocalDateTimeString(record.checkOut),
      editableBreaks: editableBreaks,
      newBreakIn: "",
      newBreakOut: "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    try {
      const updates = {};

      // Convert local datetime to ISO string for backend
      const getLocalDateTimeString = (utcDateString) => {
        if (!utcDateString) return "";
        const date = new Date(utcDateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Handle check-in update
      if (
        editingRecord.newCheckIn &&
        editingRecord.newCheckIn !==
          getLocalDateTimeString(editingRecord.checkIn)
      ) {
        updates.checkIn = new Date(editingRecord.newCheckIn).toISOString();
      }

      // Handle checkout update
      if (
        editingRecord.newCheckOut &&
        editingRecord.newCheckOut !==
          getLocalDateTimeString(editingRecord.checkOut)
      ) {
        updates.checkOut = new Date(editingRecord.newCheckOut).toISOString();
      }

      // Handle existing breaks updates
      if (
        editingRecord.editableBreaks &&
        editingRecord.editableBreaks.length > 0
      ) {
        const updatedBreaks = editingRecord.editableBreaks.map((brk) => ({
          breakIn: brk.breakIn
            ? new Date(brk.breakIn).toISOString()
            : brk.originalBreakIn,
          breakOut: brk.breakOut
            ? new Date(brk.breakOut).toISOString()
            : brk.originalBreakOut,
        }));
        updates.breaks = updatedBreaks;
      }

      // Handle new break
      if (editingRecord.newBreakIn) {
        const newBreak = {
          breakIn: new Date(editingRecord.newBreakIn).toISOString(),
        };
        if (editingRecord.newBreakOut) {
          newBreak.breakOut = new Date(editingRecord.newBreakOut).toISOString();
        }

        // Add new break to existing breaks
        if (updates.breaks) {
          updates.breaks.push(newBreak);
        } else {
          updates.breaks = [...(editingRecord.breaks || []), newBreak];
        }
      }

      if (Object.keys(updates).length > 0) {
        await updateAttendanceApi(editingRecord._id, updates);
        alert("Attendance updated successfully");
        fetchAttendance();
        setShowEditModal(false);
        setEditingRecord(null);
      } else {
        alert("No changes to save");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Failed to update attendance");
    }
  };

  const generateReport = () => {
    const csvContent = [
      ["Date", "Check In", "Check Out", "Break Time", "Work Hours", "Status"],
      ...attendance.map((record) => [
        new Date(record.date).toLocaleDateString(),
        record.checkIn ? new Date(record.checkIn).toLocaleTimeString() : "-",
        record.checkOut ? new Date(record.checkOut).toLocaleTimeString() : "-",
        formatBreakTime(record.breaks),
        calculateWorkingHours(record.checkIn, record.checkOut, record.breaks),
        record.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${user?.name}-attendance-${selectedYear}-${selectedMonth}.csv`;
    a.click();
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBreakTime = (breaks) => {
    if (!breaks?.length) return "0m";

    let totalBreakMinutes = 0;
    breaks.forEach((brk) => {
      if (brk.breakIn && brk.breakOut) {
        totalBreakMinutes +=
          (new Date(brk.breakOut) - new Date(brk.breakIn)) / (1000 * 60);
      }
    });

    const hours = Math.floor(totalBreakMinutes / 60);
    const mins = Math.floor(totalBreakMinutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const calculateWorkingHours = (checkIn, checkOut, breaks) => {
    if (!checkIn || !checkOut) return "-";

    let workMinutes = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60);

    if (breaks?.length > 0) {
      breaks.forEach((brk) => {
        if (brk.breakIn && brk.breakOut) {
          const breakMinutes =
            (new Date(brk.breakOut) - new Date(brk.breakIn)) / (1000 * 60);
          workMinutes -= breakMinutes;
        }
      });
    }

    const hours = Math.floor(workMinutes / 60);
    const mins = Math.floor(workMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i,
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100">
      <Navbar />
      <Sidebar />

      <div className="flex flex-1">
        <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20">
          {/* MacBook-Style Header */}
          <div className="mb-8">
            <button
              onClick={() => router.push("/admin/hr/attendance")}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all font-medium mt-16 mb-6"
            >
              <ArrowLeft size={20} />
              Back to All Users
            </button>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-green-900 to-green-700 bg-clip-text text-transparent">
                    {user?.name}
                  </h1>
                  <p className="text-green-600 mt-1">{user?.email}</p>
                  <div className="flex gap-3 mt-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {typeof user?.department === "object"
                        ? user?.department?.name
                        : user?.department}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {typeof user?.role === "object"
                        ? user?.role?.name
                        : user?.role}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={generateReport}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all font-medium"
              >
                <Download size={18} />
                Download Report
              </button>
            </div>
          </div>

          {/* MacBook-Style Filter Section */}
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-200/60 mb-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Filter className="text-white" size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Select Period
              </h2>
            </div>
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  Select Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  Select Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold">{summary.totalDays}</p>
                <p className="text-sm opacity-90 mt-1">Total Days</p>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold">{summary.present}</p>
                <p className="text-sm opacity-90 mt-1">Present Days</p>
              </div>

              <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <XCircle className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold">{summary.absent}</p>
                <p className="text-sm opacity-90 mt-1">Absent Days</p>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <Briefcase className="w-7 h-7" />
                </div>
                <p className="text-3xl font-bold">{summary.totalWorkHours}h</p>
                <p className="text-sm opacity-90 mt-1">Total Work Hours</p>
              </div>
            </div>
          )}

          {/* MacBook-Style Table */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                Attendance Records
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {attendance.length} records found
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-green-500" />
                        Date
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <PlayCircle size={16} className="text-green-500" />
                        Check In
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <StopCircle size={16} className="text-red-500" />
                        Check Out
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Coffee size={16} className="text-amber-500" />
                        Break Time
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-500" />
                        Work Hours
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-blue-500" />
                        Status
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Edit size={16} className="text-gray-500" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center p-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <Clock
                              size={32}
                              className="text-gray-400 animate-spin"
                            />
                          </div>
                          <p className="text-gray-500 font-medium">
                            Loading attendance records...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : attendance.length > 0 ? (
                    attendance.map((record) => (
                      <tr
                        key={record._id}
                        className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200"
                      >
                        <td className="p-4 text-sm font-semibold text-gray-900">
                          {new Date(record.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-gray-700">
                              {formatTime(record.checkIn)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {record.checkOut ? (
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span className="font-medium text-gray-700">
                                {formatTime(record.checkOut)}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 font-medium text-xs">
                              <XCircle size={14} />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-sm font-semibold">
                            {formatBreakTime(record.breaks)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-sm font-bold">
                            {calculateWorkingHours(
                              record.checkIn,
                              record.checkOut,
                              record.breaks,
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full ${
                              record.status === "CHECKED_OUT"
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                                : record.status === "ON_BREAK"
                                  ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800"
                                  : record.status === "BACK_TO_WORK"
                                    ? "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800"
                                    : "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800"
                            }`}
                          >
                            {record.status === "CHECKED_OUT" && (
                              <CheckCircle size={14} />
                            )}
                            {record.status === "ON_BREAK" && (
                              <Coffee size={14} />
                            )}
                            {record.status === "BACK_TO_WORK" && (
                              <PlayCircle size={14} />
                            )}
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => openEditModal(record)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all font-medium"
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center p-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <Calendar size={32} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            No attendance records found for this month
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* MacBook-Style Edit Modal */}
      {showEditModal && editingRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Edit className="text-white" size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Edit Attendance
              </h3>
            </div>

            <div className="space-y-5">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-700 flex items-center gap-2 mb-1">
                  <User size={14} className="text-blue-600" />
                  <span className="font-semibold">User:</span>{" "}
                  {editingRecord.userId?.name}
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Calendar size={14} className="text-purple-600" />
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(editingRecord.date).toLocaleDateString()}
                </p>
              </div>

              {/* Check In Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <PlayCircle size={16} className="text-green-500" />
                  Check In Time
                </label>
                <input
                  type="datetime-local"
                  value={editingRecord.newCheckIn}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      newCheckIn: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                />
              </div>

              {/* Check Out Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <StopCircle size={16} className="text-red-500" />
                  Check Out Time
                </label>
                <input
                  type="datetime-local"
                  value={editingRecord.newCheckOut}
                  onChange={(e) =>
                    setEditingRecord({
                      ...editingRecord,
                      newCheckOut: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                />
              </div>

              {/* Edit Existing Breaks */}
              {editingRecord.editableBreaks &&
                editingRecord.editableBreaks.length > 0 && (
                  <div className="border-t border-gray-200 pt-5">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                      <Coffee size={18} className="text-amber-500" />
                      Edit Existing Breaks
                    </h4>
                    <div className="space-y-4">
                      {editingRecord.editableBreaks.map((brk, idx) => (
                        <div
                          key={idx}
                          className="bg-amber-50 p-3 rounded-xl space-y-3"
                        >
                          <p className="text-xs font-semibold text-amber-800">
                            Break {idx + 1}
                          </p>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Break In
                            </label>
                            <input
                              type="datetime-local"
                              value={brk.breakIn}
                              onChange={(e) => {
                                const updatedBreaks = [
                                  ...editingRecord.editableBreaks,
                                ];
                                updatedBreaks[idx].breakIn = e.target.value;
                                setEditingRecord({
                                  ...editingRecord,
                                  editableBreaks: updatedBreaks,
                                });
                              }}
                              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Break Out
                            </label>
                            <input
                              type="datetime-local"
                              value={brk.breakOut}
                              onChange={(e) => {
                                const updatedBreaks = [
                                  ...editingRecord.editableBreaks,
                                ];
                                updatedBreaks[idx].breakOut = e.target.value;
                                setEditingRecord({
                                  ...editingRecord,
                                  editableBreaks: updatedBreaks,
                                });
                              }}
                              className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Add New Break */}
              <div className="border-t border-gray-200 pt-5">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                  <Coffee size={18} className="text-amber-500" />
                  Add New Break
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Break In
                    </label>
                    <input
                      type="datetime-local"
                      value={editingRecord.newBreakIn}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          newBreakIn: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Break Out (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={editingRecord.newBreakOut}
                      onChange={(e) =>
                        setEditingRecord({
                          ...editingRecord,
                          newBreakOut: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all font-semibold"
              >
                <CheckCircle size={18} />
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRecord(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 shadow-md hover:shadow-lg transition-all font-semibold"
              >
                <XCircle size={18} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       