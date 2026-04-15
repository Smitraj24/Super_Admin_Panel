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
      // Backend returns { data: [...], pagination: {...} }
      // Axios wraps it in res.data, so we need res.data.data
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
    setEditingRecord({
      ...record,
      newCheckOut: record.checkOut
        ? new Date(record.checkOut).toISOString().slice(0, 16)
        : "",
      newBreakIn: "",
      newBreakOut: "",
    });
    setEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    try {
      const updates = {};

      // Handle checkout update
      if (
        editingRecord.newCheckOut &&
        editingRecord.newCheckOut !==
          (editingRecord.checkOut
            ? new Date(editingRecord.checkOut).toISOString().slice(0, 16)
            : "")
      ) {
        updates.checkOut = editingRecord.newCheckOut;
      }

      // Handle new break
      if (editingRecord.newBreakIn) {
        updates.breakIn = editingRecord.newBreakIn;
        if (editingRecord.newBreakOut) {
          updates.breakOut = editingRecord.newBreakOut;
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

      await completeBreakOutApi(recordId, {
        breakIndex,
        breakOut: breakOutDateTime,
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <Sidebar />

      <div className="flex flex-1">
        <div className="flex-1 md:ml-64 p-4 md:p-6 pt-20">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">
            All Users Attendance
          </h1>

          {/* Attendance Summary */}
          <AttendanceSummary startDate={startDate} endDate={endDate} />

          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex gap-3 items-center flex-wrap">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleFilter}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 mt-6"
                disabled={loading}
              >
                {loading ? "Loading..." : "Filter"}
              </button>

              <button
                onClick={handleReset}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mt-6"
                disabled={loading}
              >
                Current Month
              </button>
            </div>
          </div>

          <div className="bg-white grid grid-cols-1 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      User
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Role
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Department
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Check In
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Check Out
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Breaks
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.length > 0 ? (
                    attendance.map((record) => (
                      <tr
                        key={record._id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-3">
                          <div className="font-medium text-gray-900">
                            {record.userId?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.userId?.email || "N/A"}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-700">
                          {record.userId?.role?.name || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-700">
                          {record.userId?.department?.name || "N/A"}
                        </td>
                        <td className="p-3 text-sm text-gray-700">
                          {formatDate(record.date)}
                        </td>
                        <td className="p-3 text-sm text-gray-700">
                          {formatTime(record.checkIn)}
                        </td>
                        <td className="p-3 text-sm">
                          {record.checkOut ? (
                            <span className="text-gray-700">
                              {formatTime(record.checkOut)}
                            </span>
                          ) : (
                            <span className="text-red-500 font-medium">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-sm">
                          {record.breaks && record.breaks.length > 0 ? (
                            <div className="space-y-1">
                              {record.breaks.map((brk, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2"
                                >
                                  <span className="text-gray-700">
                                    {formatTime(brk.breakIn)} -{" "}
                                    {brk.breakOut ? (
                                      formatTime(brk.breakOut)
                                    ) : (
                                      <span className="text-red-500">
                                        Pending
                                      </span>
                                    )}
                                  </span>
                                  {!brk.breakOut && (
                                    <button
                                      onClick={() =>
                                        handleCompleteBreak(record._id, idx)
                                      }
                                      className="text-xs bg-orange-500 text-white px-2 py-1 rounded hover:bg-orange-600"
                                    >
                                      Complete
                                    </button>
                                  )}
                                </div>
                              ))}
                              <div className="text-xs text-gray-500 mt-1">
                                Total: {getTotalBreakTime(record.breaks)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No breaks</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              record.status === "CHECKED_OUT"
                                ? "bg-green-100 text-green-800"
                                : record.status === "ON_BREAK"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : record.status === "BACK_TO_WORK"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => openEditModal(record)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center p-8 text-gray-500">
                        {loading ? "Loading..." : "No attendance records found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {editModal && editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Edit Attendance</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">
                  User: {editingRecord.userId?.name}
                </p>
                <p className="text-sm text-gray-600">
                  Date: {formatDate(editingRecord.date)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Add New Break</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditModal(false);
                  setEditingRecord(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
