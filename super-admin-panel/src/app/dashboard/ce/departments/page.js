"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Building2 } from "lucide-react";
import { getDepartmentsApi } from "@/services/adminApi";
import Loader from "@/components/Loader";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await getDepartmentsApi();
        setDepartments(response.data);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  if (loading) return <Loader />;

  return (
    <ProtectedRoute roles={["USER"]}>
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <Navbar />

        <main className="md:pl-64 pt-16">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Building2 className="text-indigo-600" size={28} />
                  View Departments
                </h1>
                <p className="text-gray-500 text-sm">
                  View company departments
                </p>
              </div>

              <div className="bg-white border rounded-lg px-4 py-2 text-sm flex items-center gap-2">
                <Building2 size={16} />
                {departments.length} Departments
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.length > 0 ? (
                departments.map((dep, index) => (
                  <div
                    key={dep._id}
                    className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Building2 className="text-indigo-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {dep.name}
                        </h3>
                        <p className="text-sm text-slate-500">Department</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No departments found</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
