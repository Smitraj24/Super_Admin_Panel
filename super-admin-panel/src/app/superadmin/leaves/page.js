"use client";

import { useEffect, useState } from "react";
import { getSuperAdminLeavesApi, updateSuperAdminLeaveStatusApi } from "@/services/leaveApi";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Calendar, Check, X, Download, Filter, Search } from "lucide-react";

export default function SuperAdminLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await getSuperAdminLeavesApi();
      const data = res.data?.data || res.data || [];
      setLeaves(data);
      setFilteredLeaves(data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      alert("Failed to fetch leave data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    let filtered = leaves;

    if (searchQuery) {
      filtered = filtered.filter(
        (leave) =>
          leave.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          leave.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((leave) => leave.status === statusFilter);
    }

    if (selectedUser) {
      filtered = filtered.filter((leave) => leave.user?._id === selectedUser);
    }

    setFilteredLeaves(filtered);
  }, [searchQuery, statusFilter, selectedUser, leaves]);

  const handleStatusUpdate = async (leaveId, newStatus) => {
    try {
      await updateSuperAdminLeaveStatusApi(leaveId, newStatus);
      alert(`Leave ${newStatus.toLowerCase()} successfully`);
      fetchLeaves();
    } catch (error) {
      console.error("Error updating leave status:", error);
      alert("Failed to update leave status");
    }
  };

  const generateReport = () => {
    const csvContent = [
      ["Name", "Email", "Department", "Leave Type", "From Date", "To Date", "Duration", "Reason", "Status", "Applied On"],
      ...filteredLeaves.map((leave) => [
        leave.user?.name || "N/A",
        leave.user?.email || "N/A",
        leave.user?.department?.name || "N/A",
        leave.leaveType,
        new Date(leave.fromDate).toLocaleDateString(),
        new Date(leave.toDate).toLocaleDateString(),
        leave.isHalfDay ? "Half Day" : "Full Day",
        leave.reason,
        leave.status,
        new Date(leave.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const uniqueUsers = Array.from(
    new Set(leaves.map((l) => l.user?._id))
  ).map((id) => leaves.find((l) => l.user?._id === id)?.user);

  const stats = {
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />

      <div className="md:ml-64 pt-20 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Calendar className="text-indigo-600" />
            All Users Leave Management
          </h1>
          <p className="text-slate-600 mt-2">View, approve, reject, and manage leave requests for all users</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Total Leaves</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Approved</p>
            <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <p className="text-sm text-slate-600">Rejected</p>
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Search User</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full border-2 border-slate-300 p-2 pl-10 rounded-lg focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border-2 border-slate-300 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Filter by User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border-2 border-slate-300 p-2 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Users</option>
                {uniqueUsers.map((user) => (
                  <option key={user?._id} value={user?._id}>
                    {user?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("");
                setSelectedUser("");
              }}
              className="flex items-center gap-2 bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700"
            >
              Reset
            </button>
            <button
              onClick={generateReport}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 ml-auto"
            >
              <Download size={18} />
              Download Report
            </button>
          </div>
        </div>

        {/* Leaves Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 border-b">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">User</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Department</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Leave Type</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Duration</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">From Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">To Date</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Reason</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="p-4 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center p-8 text-slate-500">Loading...</td>
                  </tr>
                ) : filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <tr key={leave._id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{leave.user?.name || "N/A"}</div>
                        <div className="text-sm text-slate-500">{leave.user?.email || "N/A"}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-700">{leave.user?.department?.name || "N/A"}</td>
                      <td className="p-4 text-sm font-semibold text-slate-700">{leave.leaveType}</td>
                      <td className="p-4">
                        {leave.isHalfDay ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-semibold">
                            Half Day
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-semibold">
                            Full Day
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-slate-700">{new Date(leave.fromDate).toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-slate-700">{new Date(leave.toDate).toLocaleDateString()}</td>
                      <td className="p-4 text-sm text-slate-600 max-w-xs truncate">{leave.reason}</td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-semibold ${
                            leave.status === "APPROVED"
                              ? "bg-green-100 text-green-800"
                              : leave.status === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {leave.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatusUpdate(leave._id, "APPROVED")}
                              className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700"
                            >
                              <Check size={14} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(leave._id, "REJECTED")}
                              className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700"
                            >
                              <X size={14} />
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center p-8 text-slate-500">No leave records found</td>
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
