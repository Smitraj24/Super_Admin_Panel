"use client";

import { useEffect, useState } from "react";
import { Clock, LogOut, Coffee, LogIn } from "lucide-react";
import {
  getTodayStatusApi,
  checkInApi,
  breakInApi,
  breakOutApi,
  checkOutApi,
} from "../services/attandanceApi.js";

export default function AttendanceButtons({ userId }) {
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const fetchStatus = async () => {
    try {
      const res = await getTodayStatusApi();
      setAttendance(res.data);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll for status updates every 30 seconds
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (type) => {
    try {
      setLoading(true);
      setMessage("");

      const payload = { userId };

      let response;
      if (type === "checkIn") response = await checkInApi(payload);
      if (type === "breakIn") response = await breakInApi(payload);
      if (type === "breakOut") response = await breakOutApi(payload);
      if (type === "checkOut") response = await checkOutApi(payload);

      setMessage(response.data.message);
      setMessageType("success");

      setTimeout(() => {
        fetchStatus();
        setMessage("");
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Action failed";
      setMessage(errorMsg);
      setMessageType("error");
      console.error("Action error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!attendance) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Attendance Tracking
        </h2>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg font-semibold ${
              messageType === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <button
            disabled={loading}
            onClick={() => handleAction("checkIn")}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <LogIn size={20} />
            Check In
          </button>
          <button
            disabled={true}
            className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Coffee size={20} />
            Break In
          </button>
          <button
            disabled={true}
            className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <LogOut size={20} />
            Check Out
          </button>
          <button
            disabled={true}
            className="bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Clock size={20} />
            Break Out
          </button>
        </div>
      </div>
    );
  }

  const status = attendance.status;

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Attendance Tracking</h2>
        <span
          className={`px-4 py-2 rounded-full font-semibold text-sm ${
            status === "CHECKED_IN"
              ? "bg-blue-100 text-blue-800"
              : status === "ON_BREAK"
                ? "bg-yellow-100 text-yellow-800"
                : status === "BACK_TO_WORK"
                  ? "bg-purple-100 text-purple-800"
                  : status === "CHECKED_OUT"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
          }`}
        >
          {status === "CHECKED_IN"
            ? "Checked In"
            : status === "ON_BREAK"
              ? "On Break"
              : status === "BACK_TO_WORK"
                ? "Back to Work"
                : status === "CHECKED_OUT"
                  ? "Checked Out"
                  : status}
        </span>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg font-semibold ${
            messageType === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Check In Button */}
        <button
          disabled={loading || status !== "NOT_CHECKED_IN"}
          onClick={() => handleAction("checkIn")}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            status !== "NOT_CHECKED_IN"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          <LogIn size={20} />
          Check In
        </button>

        {/* Break In Button */}
        <button
          disabled={loading || !["CHECKED_IN", "BACK_TO_WORK"].includes(status)}
          onClick={() => handleAction("breakIn")}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            !["CHECKED_IN", "BACK_TO_WORK"].includes(status)
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-yellow-500 hover:bg-yellow-600 text-white"
          }`}
        >
          <Coffee size={20} />
          Break In
        </button>

        {/* Check Out Button */}
        <button
          disabled={loading || !["CHECKED_IN", "BACK_TO_WORK"].includes(status)}
          onClick={() => handleAction("checkOut")}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            !["CHECKED_IN", "BACK_TO_WORK"].includes(status)
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          <LogOut size={20} />
          Check Out
        </button>

        {/* Break Out Button */}
        <button
          disabled={loading || status !== "ON_BREAK"}
          onClick={() => handleAction("breakOut")}
          className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
            status !== "ON_BREAK"
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-cyan-400 hover:bg-cyan-500 text-white"
          }`}
        >
          <Clock size={20} />
          Break Out
        </button>
      </div>
    </div>
  );
}
