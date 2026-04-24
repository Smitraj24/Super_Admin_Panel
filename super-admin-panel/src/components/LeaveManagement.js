"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getUserLeavesApi, applyLeaveApi, getUserLeaveBalanceApi, deleteUserLeaveApi, updateUserLeaveApi } from "@/services/leaveApi";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function LeaveManagement({ bgGradient = "bg-gray-100" }) {
  const [leaves, setLeaves] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);

  const [form, setForm] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
    isHalfDay: false,
  });

  const fetchLeaveBalance = useCallback(async () => {
    try {
      const res = await getUserLeaveBalanceApi();
      console.log('Leave Balance Data:', res.data.data); // Debug log
      setLeaveBalance(res.data.data);
    } catch (error) {
      console.error("Error fetching leave balance:", error);
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUserLeavesApi();
      setLeaves(res.data.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate monthly usage from leaves data
  const calculateMonthlyUsage = useCallback(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const plCount = leaves.filter(leave => {
      const leaveDate = new Date(leave.fromDate);
      return (
        leave.leaveType === 'PL' &&
        (leave.status === 'PENDING' || leave.status === 'APPROVED') &&
        leaveDate.getMonth() === currentMonth &&
        leaveDate.getFullYear() === currentYear
      );
    }).length;

    const slCount = leaves.filter(leave => {
      const leaveDate = new Date(leave.fromDate);
      return (
        leave.leaveType === 'SL' &&
        (leave.status === 'PENDING' || leave.status === 'APPROVED') &&
        leaveDate.getMonth() === currentMonth &&
        leaveDate.getFullYear() === currentYear
      );
    }).length;

    console.log('Calculated Monthly Usage - PL:', plCount, 'SL:', slCount);
    return { PL: plCount, SL: slCount };
  }, [leaves]);

  const monthlyUsage = useMemo(() => calculateMonthlyUsage(), [calculateMonthlyUsage]);

  useEffect(() => {
    fetchLeaves();
    fetchLeaveBalance();
  }, [fetchLeaves, fetchLeaveBalance]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    if (!form.leaveType || !form.fromDate || !form.toDate || !form.reason) {
      alert("All fields are required");
      return false;
    }

    if (new Date(form.toDate) < new Date(form.fromDate)) {
      alert("End date cannot be before start date");
      return false;
    }

    // Validate half-day leave
    if (form.isHalfDay) {
      const fromDate = new Date(form.fromDate).toDateString();
      const toDate = new Date(form.toDate).toDateString();

      if (fromDate !== toDate) {
        alert(
          "Half-day leave must be for a single day. Please select the same date for both From and To.",
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setFormLoading(true);

    try {
      let res;
      if (editingLeave) {
        res = await updateUserLeaveApi(editingLeave._id, form);
      } else {
        res = await applyLeaveApi(form);
      }

      if (res.data.success) {
        alert(editingLeave ? "Leave updated successfully" : "Leave applied successfully");

        setForm({
          leaveType: "",
          fromDate: "",
          toDate: "",
          reason: "",
          isHalfDay: false,
        });

        setShowForm(false);
        setEditingLeave(null);
        fetchLeaves();
        fetchLeaveBalance();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Server error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (leave) => {
    if (leave.status !== 'PENDING') {
      alert('Only pending leaves can be edited');
      return;
    }
    
    setEditingLeave(leave);
    setForm({
      leaveType: leave.leaveType,
      fromDate: new Date(leave.fromDate).toISOString().split('T')[0],
      toDate: new Date(leave.toDate).toISOString().split('T')[0],
      reason: leave.reason,
      isHalfDay: leave.isHalfDay || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (leaveId) => {
    if (!confirm('Are you sure you want to delete this leave?')) {
      return;
    }

    try {
      await deleteUserLeaveApi(leaveId);
      alert('Leave deleted successfully');
      fetchLeaves();
      fetchLeaveBalance();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error deleting leave');
    }
  };

  const handleCancelEdit = () => {
    setEditingLeave(null);
    setShowForm(false);
    setForm({
      leaveType: "",
      fromDate: "",
      toDate: "",
      reason: "",
      isHalfDay: false,
    });
  };

  // Memoize status color function
  const getStatusColor = useMemo(
    () => (status) => {
      switch (status) {
        case "PENDING":
          return "bg-yellow-200 text-yellow-800";
        case "APPROVED":
          return "bg-green-200 text-green-800";
        case "REJECTED":
          return "bg-red-200 text-red-800";
        default:
          return "bg-gray-200 text-gray-800";
      }
    },
    [],
  );

  return (
    <main className={`flex min-h-screen bg-gray-50`}>
      <Sidebar />
      <Navbar />

      <div className="lg:ml-64 pt-20 flex-1">
        <div className="p-6 space-y-6">
          <div className="flex  justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Leave Requests
            </h2>
            <button
              onClick={() => {
                setEditingLeave(null);
                setShowForm(!showForm);
              }}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 hover:shadow-cyan-500/50 transition hover:scale-105 transition-all duration-200  shadow "
            >
              {showForm ? "Cancel" : "+ Add Leave"}
            </button>
          </div>

          {/* Leave Balance Cards */}
          {leaveBalance && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow-lg">
                <p className="text-sm opacity-90">Privilege Leave (PL)</p>
                <h3 className="text-3xl font-bold">{leaveBalance.leaveBalance.PL}</h3>
                <p className="text-xs opacity-75 mt-1">
                  {monthlyUsage.PL >= 2 
                    ? '❌ Monthly limit reached' 
                    : `✓ ${monthlyUsage.PL}/2 used this month`}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg shadow-lg">
                <p className="text-sm opacity-90">Casual Leave (CL)</p>
                <h3 className="text-3xl font-bold">{leaveBalance.leaveBalance.CL}</h3>
                <p className="text-xs opacity-75 mt-1">Available</p>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-lg">
                <p className="text-sm opacity-90">Sick Leave (SL)</p>
                <h3 className="text-3xl font-bold">{leaveBalance.leaveBalance.SL}</h3>
                <p className="text-xs opacity-75 mt-1">
                  {monthlyUsage.SL >= 2 
                    ? '❌ Monthly limit reached' 
                    : `✓ ${monthlyUsage.SL}/2 used this month`}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow-lg">
                <p className="text-sm opacity-90">Duty Leave (DL)</p>
                <h3 className="text-3xl font-bold">{leaveBalance.leaveBalance.DL}</h3>
                <p className="text-xs opacity-75 mt-1">Available</p>
              </div>
            </div>
          )}

          {/* Add Leave Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {editingLeave ? 'Edit Leave' : 'Apply for Leave'}
              </h3>

              {/* Warning Messages */}
              {monthlyUsage.PL >= 2 && monthlyUsage.SL >= 2 && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  ⚠️ You have reached the monthly limit for both PL and SL leaves. Only CL and DL are available.
                </div>
              )}
              {monthlyUsage.PL >= 2 && monthlyUsage.SL < 2 && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  ⚠️ You have reached the monthly limit for PL leaves ({monthlyUsage.PL}/2 used).
                </div>
              )}
              {monthlyUsage.SL >= 2 && monthlyUsage.PL < 2 && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
                  ⚠️ You have reached the monthly limit for SL leaves ({monthlyUsage.SL}/2 used).
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold mb-2">
                      Leave Type
                    </label>
                    <select
                      name="leaveType"
                      value={form.leaveType}
                      onChange={handleChange}
                      className="w-full border p-2 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Select Leave Type</option>
                      <option 
                        value="PL" 
                        disabled={monthlyUsage.PL >= 2}
                      >
                        Privilege Leave (PL) - Balance: {leaveBalance?.leaveBalance.PL || 0}
                        {monthlyUsage.PL >= 2 ? ' (Monthly limit reached)' : ` (${monthlyUsage.PL}/2 this month)`}
                      </option>
                      <option value="CL">Casual Leave (CL) - Balance: {leaveBalance?.leaveBalance.CL || 0}</option>
                      <option 
                        value="SL" 
                        disabled={monthlyUsage.SL >= 2}
                      >
                        Sick Leave (SL) - Balance: {leaveBalance?.leaveBalance.SL || 0}
                        {monthlyUsage.SL >= 2 ? ' (Monthly limit reached)' : ` (${monthlyUsage.SL}/2 this month)`}
                      </option>
                      <option value="DL">Duty Leave (DL) - Balance: {leaveBalance?.leaveBalance.DL || 0}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2">
                      Leave Duration
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        name="fromDate"
                        value={form.fromDate}
                        onChange={handleChange}
                        className="flex-1 border p-2 rounded focus:outline-none focus:border-blue-500"
                      />
                      <span className="flex items-center">→</span>
                      <input
                        type="date"
                        name="toDate"
                        value={form.toDate}
                        onChange={handleChange}
                        className="flex-1 border p-2 rounded focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Half Day Checkbox */}
                <div className="flex items-center gap-2 bg-blue-50 p-3 rounded border border-blue-200">
                  <input
                    type="checkbox"
                    id="isHalfDay"
                    name="isHalfDay"
                    checked={form.isHalfDay}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="isHalfDay"
                    className="font-semibold text-gray-700 cursor-pointer"
                  >
                    This is a half-day leave
                  </label>
                  {form.isHalfDay && (
                    <span className="ml-2 text-sm text-blue-600">
                      (From and To dates must be the same)
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-semibold mb-2">Reason</label>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    className="w-full border p-2 rounded focus:outline-none focus:border-blue-500"
                    rows="3"
                    placeholder="Enter reason for leave..."
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {formLoading ? "Submitting..." : (editingLeave ? "Update Leave" : "Apply Leave")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Leaves Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : leaves.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No leave requests found. Click Add Leave to apply for leave.
              </div>
            ) : (
              <div className="grid grid-cols-1 overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr className="text-left">
                      <th className="p-4">Leave Type</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">From Date</th>
                      <th className="p-4">To Date</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Applied On</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {leaves.map((leave) => (
                      <tr
                        key={leave._id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="p-4 font-semibold">{leave.leaveType}</td>
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
                        <td className="p-4">
                          {new Date(leave.fromDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {new Date(leave.toDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 max-w-xs truncate text-sm text-gray-600">
                          {leave.reason}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 text-sm rounded-full font-semibold ${getStatusColor(
                              leave.status,
                            )}`}
                          >
                            {leave.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(leave.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {leave.status === 'PENDING' && (
                              <button
                                onClick={() => handleEdit(leave)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(leave._id)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
