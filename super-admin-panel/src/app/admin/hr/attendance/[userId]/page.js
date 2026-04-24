"use client";

import { useEffect, useState } from "react";
import {
  getAllUsersAttendanceApi,
  updateAttendanceApi,
  completeBreakOutApi,
} from "@/services/attandanceApi";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AttendanceSummary from "@/components/AttendanceSummary";
import {
  Users,
  Calendar,
  Clock,
  Coffee,
  CheckCircle,
  XCircle,
  Edit3,
  Filter,
  RotateCcw,
  UserCheck,
  Mail,
  Briefcase,
  Building2,
  PlayCircle,
  StopCircle,
} from "lucide-react";

export default function HRAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editModal, setEditModal] = useState(false);

  const fetchAttendance = async (start, end) => {
    setLoading(true);
    try {
      console.log("[FRONTEND] Fetching attendance:", { start, end });
      const res = await getAllUsersAttendanceApi(start, end);
      console.log("[FRONTEND] Full response:", res);
      console.log("[FRONTEND] Response.data:", res.data);
      console.log("[FRONTEND] Response.data.data:", res.data?.data);
      setAttendance(res.data?.data || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      console.error("Error response:", error.response?.data);
      alert("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    setStartDate(firstDay);
    setEndDate(lastDay);
    fetchAttendance(firstDay, lastDay);
  }, []);

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates");
      return;
    }
    fetchAttendance(startDate, endDate);
  };

  const handleReset = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    setStartDate(firstDay);
    setEndDate(lastDay);
    fetchAttendance(firstDay, lastDay);
  };

  const openEditModal = (record) => {
    // Convert UTC time to local time for datetime-local input
    const getLocalDateTimeString = (utcDateString) => {
      if (!utcDateString) return "";
      const date = new Date(utcDateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    // Convert existing breaks to editable format
    const editableBreaks = (record.breaks || []).map(brk => ({
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
    setEditModal(true);
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
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      // Handle check-in update
      if (
        editingRecord.newCheckIn &&
        editingRecord.newCheckIn !== getLocalDateTimeString(editingRecord.checkIn)
      ) {
        updates.checkIn = new Date(editingRecord.newCheckIn).toISOString();
      }

      // Handle checkout update
      if (
        editingRecord.newCheckOut &&
        editingRecord.newCheckOut !== getLocalDateTimeString(editingRecord.checkOut)
      ) {
        updates.checkOut = new Date(editingRecord.newCheckOut).toISOString();
      }

      // Handle existing breaks updates
      if (editingRecord.editableBreaks && editingRecord.editableBreaks.length > 0) {
        const updatedBreaks = editingRecord.editableBreaks.map(brk => ({
          breakIn: brk.breakIn ? new Date(brk.breakIn).toISOString() : brk.originalBreakIn,
          breakOut: brk.breakOut ? new Date(brk.breakOut).toISOString() : brk.originalBreakOut,
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
        fetchAttendance(startDate, endDate);
        setEditModal(false);
        setEditingRecord(null);
      } else {
        alert("No changes to save");
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      alert("Failed to update attendance");
    }
  };

  const handleCompleteBreak = async (recordId, breakIndex) => {
    const breakOutTime = prompt(
      "Enter break-out time (HH:MM format, e.g., 14:30):",
    );
    if (!breakOutTime) return;

    try {
      const record = attendance.find((r) => r._id === recordId);
      const breakDate = record.date;
      const breakOutDateTime = `${breakDate}T${breakOutTime}:00`;
      
      // Convert to ISO string to ensure proper timezone handling
      const breakOutISO = new Date(breakOutDateTime).toISOString();

      await completeBreakOutApi(recordId, {
        breakIndex,
        breakOut: breakOutISO,
      });

      alert("Break completed successfully");
      fetchAttendance(startDate, endDate);
    } catch (error) {
      console.error("Error completing break:", error);
      alert("Failed to complete break");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalBreakTime = (breaks) => {
    if (!breaks || breaks.length === 0) return "0m";

    let totalMinutes = 0;
    breaks.forEach((brk) => {
      if (brk.breakIn && brk.breakOut) {
        const diff = new Date(brk.breakOut) - new Date(brk.breakIn);
        totalMinutes += Math.floor(diff / 60000);
      }
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100">
      <Navbar />
      <Sidebar />

      <div className="flex flex-1">
        <div className="flex-1 md:ml-64 p-4 md:p-8 pt-20">
          {/* MacBook-Style Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <Users className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Attendance Management
                </h1>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <Clock size={16} />
                  Monitor and manage employee attendance records
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <AttendanceSummary startDate={startDate} endDate={endDate} />

          {/* MacBook-Style Filter Section */}
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-gray-200/60 mb-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-2 mb-5">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Filter className="text-white" size={18} />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Filter Attendance</h2>
            </div>
            <div className="flex gap-4 items-end flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-blue-500" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50 hover:bg-white"
                />
              </div>

              <button
                onClick={handleFilter}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all font-medium"
                disabled={loading}
              >
                <Filter size={18} />
                {loading ? "Loading..." : "Apply Filter"}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all font-medium"
                disabled={loading}
              >
                <RotateCcw size={18} />
                Current Month
              </button>
            </div>
          </div>

          {/* MacBook-Style Table */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 overflow-hidden hover:shadow-xl transition-shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 via-slate-50 to-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <UserCheck size={16} className="text-blue-500" />
                        User
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-purple-500" />
                        Role
                      </div>
                    </th>
                    <th className="p-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-orange-500" />
                        Department
                      </div>
                    </th>
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
                        Breaks
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
                        <Edit3 size={16} className="text-gray-500" />
                        Actions
                      </div>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((record) => (
                      <tr
                        key={record._id}
                        className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-purple-50/30 transition-all duration-200"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                              {record.userId?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {record.userId?.name || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail size={12} />
                                {record.userId?.email || "N/A"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {record.userId?.role?.name || "N/A"}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                            {record.userId?.department?.name || "N/A"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-700 font-medium">
                          {formatDate(record.date)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="font-medium text-gray-700">
                              {formatTime(record.checkIn)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          {record.checkOut ? (
                            <div className="flex items-center gap-2">
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
                        <td className="p-4 text-sm">
                          {record.breaks && record.breaks.length > 0 ? (
                            <div className="space-y-2">
                              {record.breaks.map((brk, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 bg-amber-50 p-2 rounded-lg"
                                >
                                  <Coffee size={14} className="text-amber-600" />
                                  <span className="text-gray-700 text-xs">
                                    {formatTime(brk.breakIn)} -{" "}
                                    {brk.breakOut ? (
                                      formatTime(brk.breakOut)
                                    ) : (
                                      <span className="text-red-600 font-medium">
                                        Pending
                                      </span>
                                    )}
                                  </span>
                                  {!brk.breakOut && (
                                    <button
                                      onClick={() =>
                                        handleCompleteBreak(record._id, idx)
                                      }
                                      className="text-xs bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 py-1 rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-sm"
                                    >
                                      Complete
                                    </button>
                                  )}
                                </div>
                              ))}
                              <div className="text-xs text-gray-600 font-medium mt-1 flex items-center gap-1">
                                <Clock size={12} />
                                Total: {getTotalBreakTime(record.breaks)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs">No breaks</span>
                          )}
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
                            {record.status === "CHECKED_OUT" && <CheckCircle size={14} />}
                            {record.status === "ON_BREAK" && <Coffee size={14} />}
                            {record.status === "BACK_TO_WORK" && <PlayCircle size={14} />}
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => openEditModal(record)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all font-medium"
                          >
                            <Edit3 size={14} />
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center p-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <Users size={32} className="text-gray-400" />
                          </div>
                          <p className="text-gray-500 font-medium">
                            {loading ? "Loading attendance records..." : "No attendance records found"}
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
      {editModal && editingRecord && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 w-full max-w-2xl border border-gray-200/50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Edit3 className="text-white" size={20} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Edit Attendance</h3>
            </div>

            <div className="space-y-5">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
                <p className="text-sm text-gray-700 flex items-center gap-2 mb-1">
                  <UserCheck size={14} className="text-blue-600" />
                  <span className="font-semibold">User:</span> {editingRecord.userId?.name}
                </p>
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <Calendar size={14} className="text-purple-600" />
                  <span className="font-semibold">Date:</span> {formatDate(editingRecord.date)}
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
              {editingRecord.editableBreaks && editingRecord.editableBreaks.length > 0 && (
                <div className="border-t border-gray-200 pt-5">
                  <h4 className="font-semibold mb-3 flex items-center gap-2 text-gray-800">
                    <Coffee size={18} className="text-amber-500" />
                    Edit Existing Breaks
                  </h4>
                  <div className="space-y-4">
                    {editingRecord.editableBreaks.map((brk, idx) => (
                      <div key={idx} className="bg-amber-50 p-3 rounded-xl space-y-3">
                        <p className="text-xs font-semibold text-amber-800">Break {idx + 1}</p>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Break In
                          </label>
                          <input
                            type="datetime-local"
                            value={brk.breakIn}
                            onChange={(e) => {
                              const updatedBreaks = [...editingRecord.editableBreaks];
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
                              const updatedBreaks = [...editingRecord.editableBreaks];
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
                  setEditModal(false);
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
