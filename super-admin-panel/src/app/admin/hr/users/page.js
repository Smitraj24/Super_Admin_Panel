"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import API from "@/lib/api";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Search,
  UserCircle,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "USER",
    department: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, deptsRes] = await Promise.all([
        API.get("/admin/users"),
        API.get("/admin/departments"),
      ]);
      setUsers(usersRes.data);
      setDepartments(deptsRes.data);
    } catch (err) {
      console.error(err.response?.data);
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
      alert("Please fill all required fields");
      return;
    }

    try {
      if (editingId) {
        const res = await API.put(`/admin/users/${editingId}`, form);
        setUsers(users.map((u) => (u._id === editingId ? res.data : u)));
        setEditingId(null);
      } else {
        const res = await API.post("/admin/users", {
          ...form,
          password: "123456",
        });
        setUsers([...users, res.data]);
      }

      setForm({ name: "", email: "", role: "USER", department: "" });
    } catch (err) {
      console.error(err.response?.data);
      alert("Operation failed");
    }
  };

  const startEdit = (user) => {
    setEditingId(user._id);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role?.name || "USER",
      department: user.department?._id || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteUser = async (id) => {
    if (!confirm("Are you sure you want to remove this user?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err.response?.data);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.department?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Sidebar />
      <Navbar />

      <main className="md:pl-64 pt-16">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="text-indigo-600" size={28} />
                User Directory
              </h1>
              <p className="text-gray-500 text-sm">
                Manage user accounts and departments
              </p>
            </div>
            <div className="bg-white rounded-lg border p-2 flex items-center gap-4">
              <UserCircle size={16} />
              {users.length} Users
            </div>
          </div>

          <div className="grid grid-cols-1  md:grid-cols-3 gap-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 p-6 shadow-lg h-fit ">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                {editingId ? <Edit3 size={18} /> : <UserPlus size={18} />}
                {editingId ? "Edit User" : "Add User"}
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
                    className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
                    className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
                      className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
                    className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium transition"
                >
                  {editingId ? "Update User" : "Create User"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm({
                        name: "",
                        email: "",
                        password: "",
                        department: "",
                      });
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-2">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="flex overflow-auto h-[500px]">
                  <table className="w-full text-sm  ">
                    <thead className="border-b border-slate-300 bg-slate-50 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 text-left">User</th>

                        <th className="p-3 text-left hidden sm:table-cell">
                          Department
                        </th>

                        <th className="p-3 text-left hidden md:table-cell">
                          Role
                        </th>

                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr
                            key={user._id}
                            className="border-b border-slate-200 hover:bg-gray-50"
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold">
                                  {user.name?.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                  <div className="font-medium">{user.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {user.email}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-3 hidden sm:table-cell">
                              {user.department?.name || "Member"}
                            </td>

                            <td className="p-3 hidden md:table-cell">
                              <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
                                {user.role?.name || "User"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-3">
                                <button
                                  onClick={() => startEdit(user)}
                                  className="text-indigo-600 hover:text-indigo-800"
                                >
                                  <Edit3 size={16} />
                                </button>

                                <button
                                  onClick={() => deleteUser(user._id)}
                                  className="text-red-500 hover:text-red-700"
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
                            No Users Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
