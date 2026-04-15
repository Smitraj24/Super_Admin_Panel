"use client";

import { useEffect, useState } from "react";
import { getUserLeavesApi, applyLeaveApi } from "@/services/leaveApi";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export default function LeaveManagement({ bgGradient = "bg-gray-100" }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [form, setForm] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
    isHalfDay: false,
  });

  const fetchLeaves = async (showLoader = true) => {
    const res = await getUserLeavesApi();
    setLeaves(res.data.data);
  };

  useEffect(() => {
    fetchLeaves(true);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === "checkbox" ? checked : value 
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
        alert("Half-day leave must be for a single day. Please select the same date for both From and To.");
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
      const res = await applyLeaveApi(form);

      if (res.data.success) {
        alert("Leave applied successfully");

        setForm({
          leaveType: "",
          fromDate: "",
          toDate: "",
          reason: "",
          isHalfDay: false,
        });

        setShowForm(false);
        fetchLeaves();
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Server error");
    }

    setFormLoading(false);
  };

  const getStatusColor = (status) => {
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
  };

  return (
    <main className={`flex min-h-screen ${bgGradient}`}>
      <Sidebar />
      <Navbar />

      <div className="lg:ml-64 pt-20 flex-1">
        <div className="p-6 space-y-6">
          <div className="flex  justify-between items-center">
            <h2 className="text-2xl font-bold">My Leave Requests</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              {showForm ? "Cancel" : "+ Add Leave"}
            </button>
          </div>

          {/* Add Leave Form */}
          {showForm && (
            <div className="bg-white p-6 rounded-lg shadow-lg border border-blue-200">
              <h3 className="text-xl font-bold mb-4">Apply for Leave</h3>

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
                      <option value="SICK">Sick</option>
                      <option value="CASUAL">Casual</option>
                      <option value="PAID">Paid</option>
                      <option value="UNPAID">Unpaid</option>
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
                  <label htmlFor="isHalfDay" className="font-semibold text-gray-700 cursor-pointer">
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
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {formLoading ? "Submitting..." : "Apply Leave"}
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
