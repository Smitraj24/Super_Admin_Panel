"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import { getUsers } from "@/services/userApi";

function HRUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        const hrUsers = res.data.filter(
          (u) =>
            (typeof u.department === "object"
              ? u.department?.name
              : u.department) === "HR",
        );
        setUsers(hrUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <main>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-green-900 mb-8">
            HR Department Users
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-green-600">Loading users...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Department</th>
                      <th className="px-6 py-3 text-left">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user._id} className="hover:bg-green-50">
                          <td className="px-6 py-4 font-semibold text-green-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 text-green-700">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              {typeof user.department === "object"
                                ? user.department?.name
                                : user.department}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              {typeof user.role === "object"
                                ? user.role?.name
                                : user.role}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center">
                          <p className="text-green-600">
                            No users found in HR department
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default HRUsersPage;
