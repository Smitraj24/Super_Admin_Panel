"use client";

import { useEffect, useState } from "react";
import { getMonthlyAttendanceApi } from "@/services/attandanceApi";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];

        const res = await getMonthlyAttendanceApi(firstDay, lastDay);
        setAttendance(res.data);
        setStartDate(firstDay);
        setEndDate(lastDay);
      } catch (error) {
        console.error("Error fetching attendance:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <div className="flex-1 p-6 ml-64 pt-20 bg-gray-100">
          <div className="flex gap-3 items-center mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded"
            />

            <button
              onClick={async () => {
                if (!startDate || !endDate) {
                  alert("Please select both start and end dates");
                  return;
                }
                setLoading(true);
                try {
                  const res = await getMonthlyAttendanceApi(startDate, endDate);
                  setAttendance(res.data);
                } catch (error) {
                  console.error("Error filtering attendance:", error);
                  alert("Failed to fetch attendance data");
                } finally {
                  setLoading(false);
                }
              }}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Loading..." : "Filter"}
            </button>

            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const now = new Date();
                  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
                    .toISOString()
                    .split("T")[0];
                  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                    .toISOString()
                    .split("T")[0];

                  setStartDate(firstDay);
                  setEndDate(lastDay);
                  const res = await getMonthlyAttendanceApi(firstDay, lastDay);
                  setAttendance(res.data);
                } catch (error) {
                  console.error("Error resetting attendance:", error);
                } finally {
                  setLoading(false);
                }
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              disabled={loading}
            >
              Reset to Current Month
            </button>
          </div>

          <h2 className="text-2xl font-semibold mb-4">Monthly Attendance</h2>

          <table className="w-full border border-gray-300 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Check In</th>
                <th className="p-3 text-left">Check Out</th>
              </tr>
            </thead>

            <tbody>
              {attendance.length > 0 ? (
                attendance.map((item) => (
                  <tr key={item._id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(item.date).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      {item.checkIn
                        ? new Date(item.checkIn).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td className="p-3">
                      {item.checkOut
                        ? new Date(item.checkOut).toLocaleTimeString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center p-5 text-gray-500">
                    No attendance data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
