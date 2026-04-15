"use client";

import { useEffect, useState } from "react";
import { getMonthlyAttendanceApi, getAttendanceSummary } from "@/services/attandanceApi";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";

export default function AttendancePageWithSummary() {
  const [attendance, setAttendance] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchCurrentMonth();
  }, []);

  const fetchCurrentMonth = async () => {
    setLoading(true);
    try {
      const now = new Date();
      // Set to 1st day of current month
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      // Set to last day of current month
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const [attendanceRes, summaryRes] = await Promise.all([
        getMonthlyAttendanceApi(firstDay, lastDay),
        getAttendanceSummary(firstDay, lastDay),
      ]);

      setAttendance(attendanceRes.data);
      setSummary(summaryRes.data);
      setStartDate(firstDay);
      setEndDate(lastDay);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async () => {
    if (!startDate || !endDate) {
      alert("Select both dates");
      return;
    }
    setLoading(true);
    setCurrentPage(1); // Reset to first page
    try {
      const [attendanceRes, summaryRes] = await Promise.all([
        getMonthlyAttendanceApi(startDate, endDate),
        getAttendanceSummary(startDate, endDate),
      ]);
      setAttendance(attendanceRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateWorkingHours = (checkIn, checkOut, breaks) => {
    if (!checkIn || !checkOut) return "-";
    
    let workMinutes = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60);
    
    if (breaks?.length > 0) {
      breaks.forEach((brk) => {
        if (brk.breakIn && brk.breakOut) {
          const breakMinutes = (new Date(brk.breakOut) - new Date(brk.breakIn)) / (1000 * 60);
          workMinutes -= breakMinutes;
        }
      });
    }
    
    const hours = Math.floor(workMinutes / 60);
    const mins = Math.floor(workMinutes % 60);
    return `${hours}h ${mins}m`;
  };

  const formatBreakTime = (breaks) => {
    if (!breaks?.length) return "0h";
    
    let totalBreakMinutes = 0;
    breaks.forEach((brk) => {
      if (brk.breakIn && brk.breakOut) {
        totalBreakMinutes += (new Date(brk.breakOut) - new Date(brk.breakIn)) / (1000 * 60);
      }
    });
    
    const hours = Math.floor(totalBreakMinutes / 60);
    const mins = Math.floor(totalBreakMinutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Pagination calculations
  const totalPages = Math.ceil(attendance.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAttendance = attendance.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden">
          <div className="w-64 bg-white h-full shadow-lg p-4">
            <button onClick={() => setOpen(false)} className="mb-4 text-gray-600">
              Close
            </button>
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col pt-4 md:ml-64">
        <div className="flex items-center justify-between bg-white shadow px-4 py-3">
          <button className="md:hidden" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <Navbar />
        </div>

        <div className="p-4 md:p-6">
          {/* Date Filters */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleFilter}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              Filter
            </button>
            <button
              onClick={fetchCurrentMonth}
              className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
              disabled={loading}
            >
              Reset
            </button>
          </div>

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-pink-400 text-white p-6 rounded shadow">
                <div className="text-sm font-medium mb-1">Days</div>
                <div className="text-3xl font-bold">{summary.totalDays}</div>
              </div>

              <div className="bg-orange-500 text-white p-6 rounded shadow">
                <div className="text-sm font-medium mb-1">Late</div>
                <div className="text-3xl font-bold">
                  {summary.late > 0 ? Math.round((summary.late / summary.totalDays) * 100) : 0}% ({summary.late})
                </div>
              </div>

              <div className="bg-cyan-400 text-white p-6 rounded shadow">
                <div className="text-sm font-medium mb-1">Absent</div>
                <div className="text-3xl font-bold">
                  {summary.absent > 0 ? Math.round((summary.absent / summary.totalDays) * 100) : 0}% ({summary.absent})
                </div>
              </div>

              <div className="bg-yellow-400 text-white p-6 rounded shadow">
                <div className="text-sm font-medium mb-1">Half-day</div>
                <div className="text-3xl font-bold">{summary.halfDay}</div>
              </div>

              <div className="bg-green-600 text-white p-6 rounded shadow">
                <div className="text-sm font-medium mb-1">Total Office</div>
                <div className="text-2xl font-bold">
                  {Math.floor(summary.totalOfficeHours)}h {Math.floor((summary.totalOfficeHours % 1) * 60)}m
                </div>
              </div>

              <div className="bg-indigo-700 text-white p-6 rounded shadow">
                <div className="text-sm font-medium mb-1">Total Worked</div>
                <div className="text-2xl font-bold">
                  {Math.floor(summary.totalWorkHours)}h {Math.floor((summary.totalWorkHours % 1) * 60)}m
                </div>
              </div>

              <div className="bg-green-500 text-white p-6 rounded shadow">
                <div className="text-sm font-medium mb-1">Productivity</div>
                <div className="text-3xl font-bold">{summary.productivity}%</div>
              </div>

              <div className="bg-green-700 text-white p-6 rounded shadow">
                <div className="text-sm font-medium mb-1">Leaves</div>
                <div className="text-3xl font-bold">{summary.leaves}</div>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="bg-white rounded shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold">Date</th>
                    <th className="p-3 text-left text-sm font-semibold">Entry Time</th>
                    <th className="p-3 text-left text-sm font-semibold">Exit Time</th>
                    <th className="p-3 text-left text-sm font-semibold">Break Time</th>
                    <th className="p-3 text-left text-sm font-semibold">Working Hours</th>
                    <th className="p-3 text-left text-sm font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : currentAttendance.length > 0 ? (
                    currentAttendance.map((item) => (
                      <tr key={item._id} className="border-t hover:bg-gray-50">
                        <td className="p-3 text-sm">
                          {new Date(item.date).toLocaleDateString("en-GB")}
                        </td>
                        <td className="p-3 text-sm">{formatTime(item.checkIn)}</td>
                        <td className="p-3 text-sm">{formatTime(item.checkOut)}</td>
                        <td className="p-3 text-sm">{formatBreakTime(item.breaks)}</td>
                        <td className="p-3 text-sm">
                          {calculateWorkingHours(item.checkIn, item.checkOut, item.breaks)}
                        </td>
                        <td className="p-3 text-xs text-gray-600">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            item.status === 'CHECKED_OUT' ? 'bg-green-100 text-green-800' :
                            item.status === 'ON_BREAK' ? 'bg-yellow-100 text-yellow-800' :
                            item.status === 'BACK_TO_WORK' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center p-8 text-gray-500">
                        No data found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {attendance.length > 0 && (
              <div className="border-t p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, attendance.length)} of {attendance.length} entries
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded ${
                          currentPage === page
                            ? 'bg-green-600 text-white'
                            : 'border hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
