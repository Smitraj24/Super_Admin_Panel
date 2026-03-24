"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/Navbar";
import {
  getAdminsApi,
  createAdminApi,
  updateAdminApi,
  deleteAdminApi,
  getDepartmentsApi,
} from "@/services/superAdminApi";
import {
  Users,
  UserPlus,
  Mail,
  Building2,
  Shield,
  Trash2,
  Edit3,
  Search,
  MoreVertical,
  Key,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
   const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
    department: "",
  });

  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [adminsRes, deptsRes] = await Promise.all([
        getAdminsApi(),
        getDepartmentsApi(),
      ]);
      setAdmins(adminsRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error("Fetch Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.department) {
      alert("Please fill all required fields (name, email, department)");
      return;
    }

    if (!editingId && !form.password) {
      alert("Password is required for new admins");
      return;
    }

    try {
      if (editingId) {
        const res = await updateAdminApi(editingId, form);
        setAdmins(admins.map((a) => (a._id === editingId ? res.data : a)));
        setEditingId(null);
      } else {
        const res = await createAdminApi(form);
        setAdmins([...admins, res.data]);
      }
      setForm({ name: "", email: "", password: "", role: "ADMIN", department: "" });
      alert("Admin " + (editingId ? "updated" : "created") + " successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    }
  };

  const deleteAdmin = async (id) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    try {
      await deleteAdminApi(id);
      setAdmins(admins.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  const startEdit = (admin) => {
    setEditingId(admin._id);
    setForm({
      name: admin.name,
      email: admin.email,
      password: "",
      role: admin.role?._id || "ADMIN",
      department: admin.department?._id || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredAdmins = admins.filter(
    (admin) =>
      (admin.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (admin.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (admin.department?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <Navbar />

      <main className=" md:pl-64 pt-16">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 py-3  gap-4 overflow-hidden">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Shield className="text-indigo-600" size={26} />
                Admin Management
              </h1>
              <p className="text-gray-500 text-sm">
                Manage administrator accounts
              </p>
            </div>

            <div className="bg-white border rounded-lg px-4 py-2 flex items-center gap-2">
              <Users size={16} />
              {admins.length} Admins
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200  p-6 overflow-hidden">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                {editingId ? <Edit3 size={18} /> : <UserPlus size={18} />}
                {editingId ? "Edit Admin" : "Add New Admin"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., John Doe"
                    className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="e.g., admin@company.com"
                    className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password *
                    </label>
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Enter secure password"
                      className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-medium transition"
                >
                  {editingId ? "Update Admin" : "Create Admin"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({ name: "", email: "", password: "", department: "" });
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-2 overflow-hidden">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
                <table className="w-full text-md">
                  <thead className="border-b border-slate-300 hover:bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Admin</th>
                      <th className="p-3 text-left">Department</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAdmins.length > 0 ? (
                      filteredAdmins.map((admin) => (
                        <tr
                          key={admin._id}
                          className="border-b border-slate-200 hover:bg-gray-50 "
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-indigo-100 rounded flex items-center justify-center text-indigo-600 font-bold">
                                {admin.name.charAt(0).toUpperCase()}
                              </div>

                              <div>
                                <div className="font-medium">{admin.name}</div>
                                <div className="text-xs text-gray-500">
                                  {admin.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                              <Building2 size={14} />
                              {admin.department?.name || "No Dept"}
                            </span>
                          </td>

                          <td className="p-3">
                            {admin.isActive ? (
                              <span className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 size={16} />
                                Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-gray-400">
                                <XCircle size={16} />
                                Inactive
                              </span>
                            )}
                          </td>

                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => startEdit(admin)}
                                className="p-1 hover:bg-gray-100 rounded transition"
                                title="Edit"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                onClick={() => deleteAdmin(admin._id)}
                                className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="p-10 text-center text-gray-400"
                        >
                          No Admins Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
