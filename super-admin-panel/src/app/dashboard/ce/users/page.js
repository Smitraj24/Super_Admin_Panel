"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import { getUsers } from "@/services/userApi";

function CEUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        const ceUsers = res.data.filter(
          (u) =>
            (typeof u.department === "object"
              ? u.department?.name
              : u.department) === "CE",
        );
        setUsers(ceUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <Sidebar />
      <Navbar />
      <div className="lg:ml-64 pt-20 p-4 ">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-900 mb-8">
            CE Department Users
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-blue-600">Loading users...</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="px-6 py-3 text-left">Name</th>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">Department</th>
                      <th className="px-6 py-3 text-left">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {users.length > 0 ? (
                      users.map((user) => (
                        <tr key={user._id} className="hover:bg-blue-50">
                          <td className="px-6 py-4 font-semibold text-blue-900">
                            {user.name}
                          </td>
                          <td className="px-6 py-4 text-blue-700">
                            {user.email}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
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
                          <p className="text-blue-600">
                            No users found in CE department
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

export default CEUsersPage;
