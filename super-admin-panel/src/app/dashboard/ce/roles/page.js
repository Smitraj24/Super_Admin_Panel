"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Shield, Edit3, PlusCircle } from "lucide-react";
import { getRoles } from "@/services/roleApi";
import Loader from "@/components/Loader";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        setRoles(response.data);
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoles();
  }, []);

  if (loading) return <Loader />;

  return (
    <ProtectedRoute roles={["USER"]}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <Sidebar />
        <Navbar />

        <main className="md:pl-64 pt-16">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="text-indigo-600" size={28} />
                  View Roles
                </h1>
                <p className="text-gray-500 text-sm">View system roles</p>
              </div>

              <div className="bg-white rounded-lg border px-4 py-2 text-sm flex items-center gap-2">
                <Shield size={16} />
                {roles.length} Roles
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.length > 0 ? (
                roles.map((role, index) => (
                  <div
                    key={role._id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Shield className="text-indigo-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {role.name}
                        </h3>
                        <p className="text-sm text-slate-500">Role</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No roles found</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
