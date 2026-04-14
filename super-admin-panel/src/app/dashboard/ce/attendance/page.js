"use client";

import { useEffect, useState } from "react";
import {
  getMonthlyAttendanceApi,
  getAttendanceSummary,
} from "@/services/attandanceApi";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // mobile sidebar..
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchCurrentMonth();
  }, []);

  const fetchCurrentMonth = async () => {
    setLoading(true);
    try {
      const now = new Date();

      const firstDay = new Date(now.getFullYear(), now.getMonth(), 2)
        .toISOString()
        .split("T")[0];

      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        .toISOString()
        .split("T")[0];

      const res = await getMonthlyAttendanceApi(firstDay, lastDay);

      setAttendance(res.data);
      setStartDate(firstDay);
      setEndDate(lastDay);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);

        const today = new Date();

        const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
          .toISOString()
          .split("T")[0];

        const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
          .toISOString()
          .split("T")[0];

        const res = await getAttendanceSummary(startDate, endDate);

        setSummary(res.data);
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      alert("Select both dates");
      return;
    }
    setLoading(true);
    try {
      const res = await getMonthlyAttendanceApi(startDate, endDate);
      setAttendance(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 ">
      <Sidebar />

      {/* Mobile Sidebar */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden">
          <div className="w-64 bg-white h-full shadow-lg p-4">
            <button
              onClick={() => setOpen(false)}
              className="mb-4 text-gray-600"
            >
              Close
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col pt-4 md:ml-64">
        {/* Navbar */}
        <div className="flex items-center justify-between bg-white shadow px-4 py-3 ">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <Navbar />
        </div>

        {/* Content */}
        <div className="p-4 md:p-10 pt-10">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-2 rounded w-full md:w-auto"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-2 rounded w-full md:w-auto"
            />

            <button
              onClick={handleFilter}
              className="bg-green-500 text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? "Loading..." : "Filter"}
            </button>

            <button
              onClick={fetchCurrentMonth}
              className="bg-blue-500 text-white px-4 py -2 rounded"
              disabled={loading}
            >
              Reset
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 p-4">
            <div className="bg-indigo-500 shadow-md rounded-xl p-4 text-center">
              <p className="text-white text-md">Days</p>
              <h2 className="text-xl text-white font-semibold">
                {summary?.totalDays || 0}
              </h2>
            </div>

            <div className="bg-orange-500 shadow-md rounded-xl p-4 text-center">
              <p className="text-white text-md">Late</p>
              <h2 className="text-xl text-white font-semibold">
                {" "}
                {summary?.late || 0}
              </h2>
            </div>

            <div className="bg-red-500 shadow-md rounded-xl p-4 text-center">
              <p className="text-white text-md">Absent</p>
              <h2 className="text-xl text-white font-semibold">
                {" "}
                {summary?.absent || 0}
              </h2>
            </div>

            <div className="bg-amber-500 shadow-md rounded-xl p-4 text-center">
              <p className="text-white text-md">Half Day</p>
              <h2 className="text-xl text-white font-semibold">
                {" "}
                {summary?.halfDay || 0}
              </h2>
            </div>

            <div className="bg-blue-500  shadow-md rounded-xl p-4 text-center">
              <p className="text-white text-md">Total Office Work</p>
              <h2 className="text-xl text-white font-semibold">
                {summary?.totalOfficeHours || 0}
              </h2>
            </div>

            <div className="bg-purple-500  shadow-md rounded-xl p-4 text-center">
              <p className="text-white text-md">Total Work</p>
              <h2 className="text-xl text-white font-semibold">
                {summary?.totalWorkHours || 0}h
              </h2>
            </div>

            <div className="bg-green-500  shadow-md rounded-xl p-4 text-center">
              <p className="text-white text-md">Productivity</p>
              <h2 className="text-xl text-white font-semibold text-green-600">
                {summary?.productivity || 0}%
              </h2>
            </div>

            <div className="bg-rose-800 shadow-md rounded-xl p-4 text-center">
              <p className="text-white text-md">PL Leaves (2026)</p>
              <h2 className="text-xl text-white font-semibold">
                {" "}
                {summary?.leaves || 0}
              </h2>
            </div>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            Monthly Attendance
          </h2>

          {/* Table Wrapper (IMPORTANT for mobile) */}
          <div className="overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full">
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
                    <tr key={item._id} className="border-t">
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
                    <td colSpan="3" className="text-center p-4 text-gray-500">
                      No data found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
