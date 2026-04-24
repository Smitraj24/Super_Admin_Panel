"use client";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { Building2 } from "lucide-react";
import { useState, useEffect } from "react";

function SALESDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const res = await fetch(
          "http://localhost:5000/api/superadmin/departments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        setDepartments(data);
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const departmentColors = {
    IT: "bg-blue-100 text-blue-700",
    CE: "bg-orange-100 text-orange-700",
    HR: "bg-green-100 text-green-700",
    SALES: "bg-purple-100 text-purple-700",
    FINANCE: "bg-yellow-100 text-yellow-700",
  };

  return (
    <main>
      <Sidebar />
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-purple-900 mb-8">
            All Departments
          </h1>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-purple-600">Loading departments...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((dept) => (
                <div
                  key={dept._id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900">
                        {dept.name}
                      </h3>
                      <span
                        className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                          departmentColors[dept.name] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {dept.name}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default SALESDepartmentsPage;
